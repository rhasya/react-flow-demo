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
  type OnMoveEnd,
  type OnNodesChange,
  type Viewport,
  type XYPosition,
} from "@xyflow/react"
import { useTheme } from "next-themes"

import {
  createInitialEdges,
  createInitialNodes,
  INITIAL_EDGES,
  INITIAL_NODES,
} from "./initial-elements"
import { loadBoardState, saveBoardState } from "./sticky-board-storage"
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
import { StickyToolbar } from "./sticky-toolbar"

const nodeTypes = {
  [STICKY_NOTE_TYPE]: StickyNoteNode,
} satisfies NodeTypes

const DELETE_KEY_CODES = ["Backspace", "Delete"]

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
  const [initialBoard] = useState(() => loadBoardState())
  const [nodes, setNodes, onNodesChange] = useNodesState<StickyNoteNodeType>(
    initialBoard?.nodes ?? INITIAL_NODES
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialBoard?.edges ?? INITIAL_EDGES
  )
  const [viewport, setViewport] = useState<Viewport | undefined>(
    initialBoard?.viewport
  )
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
    getViewport,
    updateNodeData,
  } = useReactFlow<StickyNoteNodeType>()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveBoardState({
        nodes,
        edges,
        viewport: viewport ?? getViewport(),
      })
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [edges, getViewport, nodes, viewport])

  const forceColorMode: ColorMode | undefined =
    resolvedTheme === "dark" || resolvedTheme === "light"
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

  const focusAndHighlightNode = useCallback(
    (nodeId: string, position: XYPosition) => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current)
      }
      setJustCreatedNodeId(nodeId)
      highlightTimerRef.current = window.setTimeout(() => {
        setJustCreatedNodeId(null)
        highlightTimerRef.current = null
      }, 900)

      void setCenter(
        position.x + DEFAULT_STICKY_NOTE_WIDTH / 2,
        position.y + DEFAULT_STICKY_NOTE_HEIGHT / 2,
        { zoom: getZoom(), duration: 350 }
      )
    },
    [getZoom, setCenter]
  )

  const handleNodesChange: OnNodesChange<StickyNoteNodeType> = useCallback(
    (changes) => {
      changes.removeForNode(PREVIEW_NODE_ID)
      onNodesChange(changes)
    },
    [onNodesChange]
  )

  const handleMoveEnd: OnMoveEnd = useCallback((_event, nextViewport) => {
    setViewport(nextViewport)
  }, [])

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
    focusAndHighlightNode(newNode.id, position)
  }, [
    computePlacementPosition,
    draftColor,
    draftText,
    focusAndHighlightNode,
    previewPosition,
    setNodes,
  ])

  const handleAddBlankNote = useCallback(() => {
    const position = computePlacementPosition()
    const newNode = createStickyNoteNode({
      position,
      text: "",
      color: draftColor,
      selected: true,
    })

    setNodes((prev) => [
      ...prev.map((node) => (node.selected ? { ...node, selected: false } : node)),
      newNode,
    ])
    setPreviewPosition(null)
    focusAndHighlightNode(newNode.id, position)
    requestAnimationFrame(() => {
      inputTextareaRef.current?.focus()
    })
  }, [computePlacementPosition, draftColor, focusAndHighlightNode, setNodes])

  const handleExitSyncMode = useCallback(() => {
    setNodes((prev) =>
      prev.map((node) => (node.selected ? { ...node, selected: false } : node))
    )
    if (draftText.trim().length > 0 && previewPosition === null) {
      setPreviewPosition(computePlacementPosition())
    }
    inputTextareaRef.current?.focus()
  }, [computePlacementPosition, draftText, previewPosition, setNodes])

  const handleFitView = useCallback(() => {
    void fitView({ padding: 0.25, duration: 250 })
  }, [fitView])

  const handleToggleMiniMap = useCallback(() => {
    setShowMiniMap((prev) => !prev)
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (!hasSelection) {
      return
    }
    void deleteElements({ nodes: selectedNodes, edges: selectedEdges })
  }, [deleteElements, hasSelection, selectedEdges, selectedNodes])

  const handleLoadSample = useCallback(() => {
    setNodes(createInitialNodes())
    setEdges(createInitialEdges())
    setDraftText("")
    setPreviewPosition(null)
    setJustCreatedNodeId(null)
    requestAnimationFrame(() => {
      void fitView({ padding: 0.25, duration: 300 })
    })
  }, [fitView, setEdges, setNodes])

  const handleClearBoard = useCallback(() => {
    setNodes([])
    setEdges([])
    setDraftText("")
    setPreviewPosition(null)
    setJustCreatedNodeId(null)
  }, [setEdges, setNodes])

  const handleToggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

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

  return (
    <div ref={containerRef} className="h-svh w-screen bg-background">
      <ReactFlow
        nodes={renderedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={handleMoveEnd}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={initialBoard?.viewport}
        fitView={!initialBoard?.viewport}
        fitViewOptions={{ padding: 0.25 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        deleteKeyCode={isBarFocused ? null : DELETE_KEY_CODES}
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
          <StickyToolbar
            nodeCount={nodes.length}
            edgeCount={edges.length}
            hasSelection={hasSelection}
            showMiniMap={showMiniMap}
            resolvedTheme={resolvedTheme}
            onAddNote={handleAddBlankNote}
            onFitView={handleFitView}
            onToggleMiniMap={handleToggleMiniMap}
            onDeleteSelected={handleDeleteSelected}
            onLoadSample={handleLoadSample}
            onClearBoard={handleClearBoard}
            onToggleTheme={handleToggleTheme}
          />
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
  const isHydrated = useIsHydrated()

  if (!isHydrated) {
    return <div className="h-svh w-screen bg-background" />
  }

  return (
    <ReactFlowProvider>
      <StickyBoardCanvas />
    </ReactFlowProvider>
  )
}
