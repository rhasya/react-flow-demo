"use client"

import { memo, useCallback, type ChangeEvent, type CSSProperties, type KeyboardEvent } from "react"
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react"
import { CopyIcon, GripHorizontalIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  createStickyNoteNode,
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_WIDTH,
  formatStickyNoteTime,
  isStickyNoteColor,
  MAX_STICKY_NOTE_HEIGHT,
  MAX_STICKY_NOTE_WIDTH,
  MIN_STICKY_NOTE_HEIGHT,
  MIN_STICKY_NOTE_WIDTH,
  STICKY_NOTE_COLOR_PRESETS,
  type StickyNoteNodeType,
} from "./sticky-note-types"

function StickyNoteNodeComponent({
  id,
  data,
  selected,
}: NodeProps<StickyNoteNodeType>) {
  const { updateNodeData, getNode, setNodes, deleteElements } =
    useReactFlow<StickyNoteNodeType>()

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, {
        text: event.target.value,
        updatedAt: new Date().toISOString(),
      })
    },
    [id, updateNodeData]
  )

  const handleTextareaKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.currentTarget.blur()
      }
    },
    []
  )

  const handleColorChange = useCallback(
    (values: string[]) => {
      const nextColor = values[0]
      if (isStickyNoteColor(nextColor) && nextColor !== data.color) {
        updateNodeData(id, {
          color: nextColor,
          updatedAt: new Date().toISOString(),
        })
      }
    },
    [data.color, id, updateNodeData]
  )

  const handleDuplicate = useCallback(() => {
    const current = getNode(id)
    if (!current) {
      return
    }

    const duplicated = createStickyNoteNode({
      position: {
        x: current.position.x + 32,
        y: current.position.y + 32,
      },
      text: current.data.text,
      color: current.data.color,
      width:
        current.width ??
        current.measured?.width ??
        DEFAULT_STICKY_NOTE_WIDTH,
      height:
        current.height ??
        current.measured?.height ??
        DEFAULT_STICKY_NOTE_HEIGHT,
      selected: true,
    })

    setNodes((prev) => [
      ...prev.map((node) => ({ ...node, selected: false })),
      duplicated,
    ])
  }, [getNode, id, setNodes])

  const handleDelete = useCallback(() => {
    void deleteElements({ nodes: [{ id }] })
  }, [deleteElements, id])

  const formattedTime = formatStickyNoteTime(data.updatedAt)
  const isPreview = Boolean(data.isPreview)
  const isSyncing = Boolean(data.isSyncing)
  const isJustCreated = Boolean(data.isJustCreated)

  if (isPreview) {
    return (
      <div
        data-note-color={data.color}
        data-preview="true"
        className="sticky-note pointer-events-none flex h-full w-full min-h-[140px] min-w-[180px] flex-col overflow-hidden rounded-xl border transition-all"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-3 pt-2.5 pb-1">
          <Badge variant="secondary">미리보기</Badge>
        </div>
        <p className="min-h-0 flex-1 overflow-hidden px-3 pt-1 pb-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {data.text}
        </p>
      </div>
    )
  }

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_STICKY_NOTE_WIDTH}
        minHeight={MIN_STICKY_NOTE_HEIGHT}
        maxWidth={MAX_STICKY_NOTE_WIDTH}
        maxHeight={MAX_STICKY_NOTE_HEIGHT}
        handleClassName="sticky-note-resize-handle"
        lineClassName="sticky-note-resize-line"
      />

      <NodeToolbar position={Position.Top} offset={8} align="center">
        <div className="nodrag nopan flex items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-md backdrop-blur-sm">
          <ToggleGroup
            value={[data.color]}
            onValueChange={handleColorChange}
            spacing={1}
            aria-label="포스트잇 색상 선택"
          >
            {STICKY_NOTE_COLOR_PRESETS.map((preset) => (
              <ToggleGroupItem
                key={preset.id}
                value={preset.id}
                size="sm"
                aria-label={`${preset.label} 색상`}
                title={preset.label}
                className="size-6 min-w-6 rounded-full p-0 data-pressed:ring-2 data-pressed:ring-ring data-pressed:ring-offset-1 data-pressed:ring-offset-card"
              >
                <span
                  className="sticky-note-swatch block size-3.5 rounded-full ring-1 ring-foreground/20"
                  style={
                    { "--swatch-color": preset.swatchVar } as CSSProperties
                  }
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Separator orientation="vertical" className="h-4 self-center" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleDuplicate}
                  aria-label="포스트잇 복제"
                />
              }
            >
              <CopyIcon />
            </TooltipTrigger>
            <TooltipContent>복제</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleDelete}
                  aria-label="포스트잇 삭제"
                />
              }
            >
              <Trash2Icon />
            </TooltipTrigger>
            <TooltipContent>삭제</TooltipContent>
          </Tooltip>
        </div>
      </NodeToolbar>

      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="sticky-note-handle"
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="sticky-note-handle"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="sticky-note-handle"
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="sticky-note-handle"
      />

      <div
        data-note-color={data.color}
        data-selected={selected ? "true" : "false"}
        data-syncing={isSyncing ? "true" : "false"}
        data-just-created={isJustCreated ? "true" : "false"}
        className="sticky-note flex h-full w-full min-h-[140px] min-w-[180px] flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow"
      >
        <div className="flex shrink-0 cursor-grab items-center justify-between gap-2 px-3 pt-2.5 pb-1 active:cursor-grabbing">
          <div className="flex items-center gap-1.5">
            <GripHorizontalIcon
              className="sticky-note-muted size-3.5 shrink-0"
              aria-hidden="true"
            />
            {isSyncing ? (
              <span className="sticky-note-muted text-[11px] font-medium">
                실시간 동기화
              </span>
            ) : null}
          </div>
          {formattedTime ? (
            <time
              dateTime={data.updatedAt}
              suppressHydrationWarning
              className="sticky-note-muted text-[11px] tabular-nums"
            >
              {formattedTime}
            </time>
          ) : null}
        </div>

        <Textarea
          value={data.text}
          onChange={handleTextChange}
          onKeyDown={handleTextareaKeyDown}
          placeholder="메모를 입력하세요..."
          aria-label="포스트잇 내용"
          className="nodrag nowheel nopan min-h-0 flex-1 resize-none overflow-y-auto px-3 pt-1 pb-3 text-sm leading-relaxed"
        />
      </div>
    </>
  )
}

export const StickyNoteNode = memo(StickyNoteNodeComponent)
