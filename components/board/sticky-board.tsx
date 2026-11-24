"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type ColorMode,
  type NodeTypes,
  type OnConnect,
  type OnNodesChange,
  type XYPosition,
} from "@xyflow/react"
import { MapIcon, Maximize2Icon, Trash2Icon } from "lucide-react"
import { useTheme } from "next-themes"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { INITIAL_EDGES, INITIAL_NODES } from "./initial-elements"
import { StickyInputBar } from "./sticky-input-bar"
import { findNonOverlappingPosition } from "./sticky-note-layout"
import { StickyNoteNode } from "./sticky-note-node"
import {
  createStickyNoteNode,
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_WIDTH,
  isStickyNoteColor,
  PREVIEW_NODE_ID,
  STICKY_NOTE_TYPE,
  type StickyNoteColor,
  type StickyNoteNodeType,
} from "./sticky-note-types"

const nodeTypes = {
  [STICKY_NOTE_TYPE]: StickyNoteNode,
} satisfies NodeTypes

function getMiniMapNodeColor(node: StickyNoteNodeType): string {
  const color = node.data?.color
  if (isStickyNoteColor(color)) {
    return `var(--note-${color}-swatch)`
  }
  return "var(--note-yellow-swatch)"
}

const emptySubscribe = () => () => {}

function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

function StickyBoardCanvas() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<StickyNoteNodeType>(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [draftText, setDraftText] = useState("")
  const [draftColor, setDraftColor] = useState<StickyNoteColor>("yellow")
  const [previewPosition, setPreviewPosition] = useState<XYPosition | null>(
    null
  )
  const [isBarFocused, setIsBarFocused] = useState(false)
  const [justCreatedNodeId, setJustCreatedNodeId] = useState<string | null>(
    null
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightTimerRef = useRef<number | null>(null)

  const {
    fitView,
    deleteElements,
    screenToFlowPosition,
    setCenter,
    getZoom,
    updateNodeData,
  } = useReactFlow<StickyNoteNodeType>()
  const { resolvedTheme } = useTheme()
  const isHydrated = useIsHydrated()

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  const forceColorMode: ColorMode | undefined =
    isHydrated && (resolvedTheme === "dark" || resolvedTheme === "light")
      ? resolvedTheme
      : undefined

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "smoothstep" }, eds))
    },
    [setEdges]
  )

  const selectedNodes = useMemo(
    () => nodes.filter((node) => node.selected),
    [nodes]
  )
  const selectedEdges = useMemo(
    () => edges.filter((edge) => edge.selected),
    [edges]
  )
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0
  const selectedNote = selectedNodes.length === 1 ? selectedNodes[0] : null
  const barMode: "create" | "sync" = selectedNote ? "sync" : "create"
  const syncingNodeId = selectedNote && isBarFocused ? selectedNote.id : null

  const computePlacementPosition = useCallback((): XYPosition => {
    const rect = containerRef.current?.getBoundingClientRect()
    const preferred = rect
      ? (() => {
          const flowCenter = screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2 - 48,
          })
          return {
            x: flowCenter.x - DEFAULT_STICKY_NOTE_WIDTH / 2,
            y: flowCenter.y - DEFAULT_STICKY_NOTE_HEIGHT / 2,
          }
        })()
      : { x: 160, y: 140 }

    return findNonOverlappingPosition(preferred, nodes)
  }, [nodes, screenToFlowPosition])

  const handleNodesChange: OnNodesChange<StickyNoteNodeType> = useCallback(
    (changes) => {
      changes.removeForNode(PREVIEW_NODE_ID)
      onNodesChange(changes)
    },
    [onNodesChange]
  )

  const handleBarTextChange = useCallback(
    (nextText: string) => {
      if (selectedNote) {
        updateNodeData(selectedNote.id, {
          text: nextText,
          updatedAt: new Date().toISOString(),
        })
        return
      }

      setDraftText(nextText)
      if (nextText.trim().length === 0) {
        setPreviewPosition(null)
      } else if (previewPosition === null) {
        setPreviewPosition(computePlacementPosition())
      }
    },
    [computePlacementPosition, previewPosition, selectedNote, updateNodeData]
  )

  const handleBarColorChange = useCallback(
    (nextColor: StickyNoteColor) => {
      if (selectedNote) {
        updateNodeData(selectedNote.id, {
          color: nextColor,
          updatedAt: new Date().toISOString(),
        })
        return
      }

      setDraftColor(nextColor)
    },
    [selectedNote, updateNodeData]
  )

  const handleCreateNote = useCallback(() => {
    const trimmed = draftText.trim()
    if (!trimmed) {
      return
    }

    const position = previewPosition ?? computePlacementPosition()
    const newNode = createStickyNoteNode({
      position,
      text: trimmed,
      color: draftColor,
      selected: false,
    })

    setNodes((prev) => [
      ...prev.map((node) => (node.selected ? { ...node, selected: false } : node)),
      newNode,
    ])
    setDraftText("")
    setPreviewPosition(null)

    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current)
    }
    setJustCreatedNodeId(newNode.id)
    highlightTimerRef.current = window.setTimeout(() => {
      setJustCreatedNodeId(null)
      highlightTimerRef.current = null
    }, 900)

    void setCenter(
      position.x + DEFAULT_STICKY_NOTE_WIDTH / 2,
      position.y + DEFAULT_STICKY_NOTE_HEIGHT / 2,
      { zoom: getZoom(), duration: 350 }
    )
  }, [
    computePlacementPosition,
    draftColor,
    draftText,
    getZoom,
    previewPosition,
    setCenter,
    setNodes,
  ])

  const handleExitSyncMode = useCallback(() => {
    setNodes((prev) =>
      prev.map((node) => (node.selected ? { ...node, selected: false } : node))
    )
    if (draftText.trim().length > 0 && previewPosition === null) {
      setPreviewPosition(computePlacementPosition())
    }
    inputTextareaRef.current?.focus()
  }, [computePlacementPosition, draftText, previewPosition, setNodes])

  const renderedNodes = useMemo<StickyNoteNodeType[]>(() => {
    const decorated = nodes.map((node) => {
      const isSyncing = node.id === syncingNodeId
      const isJustCreated = node.id === justCreatedNodeId
      if (!isSyncing && !isJustCreated) {
        return node
      }
      return {
        ...node,
        data: {
          ...node.data,
          isSyncing,
          isJustCreated,
        },
      }
    })

    if (!selectedNote && draftText.trim().length > 0 && previewPosition) {
      decorated.push({
        id: PREVIEW_NODE_ID,
        type: STICKY_NOTE_TYPE,
        position: previewPosition,
        width: DEFAULT_STICKY_NOTE_WIDTH,
        height: DEFAULT_STICKY_NOTE_HEIGHT,
        draggable: false,
        selectable: false,
        connectable: false,
        focusable: false,
        data: {
          text: draftText,
          color: draftColor,
          createdAt: "",
          updatedAt: "",
          isPreview: true,
        },
      })
    }

    return decorated
  }, [
    draftColor,
    draftText,
    justCreatedNodeId,
    nodes,
    previewPosition,
    selectedNote,
    syncingNodeId,
  ])

  const handleFitView = useCallback(() => {
    void fitView({ padding: 0.25, duration: 250 })
  }, [fitView])

  const handleDeleteSelected = useCallback(() => {
    if (!hasSelection) {
      return
    }
    void deleteElements({ nodes: selectedNodes, edges: selectedEdges })
  }, [deleteElements, hasSelection, selectedEdges, selectedNodes])

  return (
    <div ref={containerRef} className="h-svh w-screen bg-background">
      <ReactFlow
        nodes={renderedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        deleteKeyCode={["Backspace", "Delete"]}
        forceColorMode={forceColorMode}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        <Controls position="bottom-left" />
        {showMiniMap ? (
          <MiniMap
            position="bottom-right"
            nodeColor={getMiniMapNodeColor}
            pannable
            zoomable
          />
        ) : null}

        <Panel position="top-right">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/90 p-1.5 shadow-sm backdrop-blur-sm">
            <Badge variant="secondary">
              노드 {nodes.length} · 연결 {edges.length}
            </Badge>
            <Separator orientation="vertical" className="h-4 self-center" />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleFitView}
                    aria-label="전체 보기"
                  />
                }
              >
                <Maximize2Icon />
              </TooltipTrigger>
              <TooltipContent>전체 보기</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant={showMiniMap ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => setShowMiniMap((prev) => !prev)}
                    aria-label="미니맵 전환"
                    aria-pressed={showMiniMap}
                  />
                }
              >
                <MapIcon />
              </TooltipTrigger>
              <TooltipContent>
                {showMiniMap ? "미니맵 숨기기" : "미니맵 표시"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleDeleteSelected}
                    disabled={!hasSelection}
                    aria-label="선택 항목 삭제"
                  />
                }
              >
                <Trash2Icon />
              </TooltipTrigger>
              <TooltipContent>선택 항목 삭제</TooltipContent>
            </Tooltip>
          </div>
        </Panel>

        <Panel position="bottom-center">
          <StickyInputBar
            mode={barMode}
            text={selectedNote ? selectedNote.data.text : draftText}
            color={selectedNote ? selectedNote.data.color : draftColor}
            isPreviewActive={
              !selectedNote &&
              draftText.trim().length > 0 &&
              previewPosition !== null
            }
            textareaRef={inputTextareaRef}
            onTextChange={handleBarTextChange}
            onColorChange={handleBarColorChange}
            onSubmitCreate={handleCreateNote}
            onExitSyncMode={handleExitSyncMode}
            onFocusChange={setIsBarFocused}
          />
        </Panel>
      </ReactFlow>
    </div>
  )
}

export function StickyBoard() {
  return (
    <ReactFlowProvider>
      <StickyBoardCanvas />
    </ReactFlowProvider>
  )
}
