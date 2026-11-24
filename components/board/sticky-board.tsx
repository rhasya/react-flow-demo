"use client"

import { useCallback, useMemo, useState, useSyncExternalStore } from "react"
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type ColorMode,
  type OnConnect,
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

const emptySubscribe = () => () => {}

function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

function StickyBoardCanvas() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
  const [showMiniMap, setShowMiniMap] = useState(true)

  const { fitView, deleteElements } = useReactFlow()
  const { resolvedTheme } = useTheme()
  const isHydrated = useIsHydrated()

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
    <div className="h-svh w-screen bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        deleteKeyCode={["Backspace", "Delete"]}
        forceColorMode={forceColorMode}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        <Controls position="bottom-left" />
        {showMiniMap ? (
          <MiniMap position="bottom-right" pannable zoomable />
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
