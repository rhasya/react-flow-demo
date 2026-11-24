"use client"

import { useState } from "react"
import {
  MapIcon,
  Maximize2Icon,
  MoonIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  SunIcon,
  Trash2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type StickyToolbarProps = {
  nodeCount: number
  edgeCount: number
  hasSelection: boolean
  showMiniMap: boolean
  resolvedTheme: string | undefined
  onAddNote: () => void
  onFitView: () => void
  onToggleMiniMap: () => void
  onDeleteSelected: () => void
  onLoadSample: () => void
  onClearBoard: () => void
  onToggleTheme: () => void
}

export function StickyToolbar({
  nodeCount,
  edgeCount,
  hasSelection,
  showMiniMap,
  resolvedTheme,
  onAddNote,
  onFitView,
  onToggleMiniMap,
  onDeleteSelected,
  onLoadSample,
  onClearBoard,
  onToggleTheme,
}: StickyToolbarProps) {
  const [isResetOpen, setIsResetOpen] = useState(false)
  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card/90 p-1.5 shadow-sm backdrop-blur-sm">
      <Badge variant="secondary" className="hidden sm:inline-flex">
        노드 {nodeCount} · 연결 {edgeCount}
      </Badge>
      <Separator
        orientation="vertical"
        className="hidden h-4 self-center sm:block"
      />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onAddNote}
              aria-label="새 포스트잇 추가"
            />
          }
        >
          <PlusIcon data-icon="inline-start" />
          <span className="hidden sm:inline">새 포스트잇</span>
        </TooltipTrigger>
        <TooltipContent>새 포스트잇 추가</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onFitView}
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
              onClick={onToggleMiniMap}
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
              onClick={onDeleteSelected}
              disabled={!hasSelection}
              aria-label="선택 항목 삭제"
            />
          }
        >
          <Trash2Icon />
        </TooltipTrigger>
        <TooltipContent>선택 항목 삭제</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-4 self-center" />

      <Popover open={isResetOpen} onOpenChange={setIsResetOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="보드 초기화"
              title="보드 초기화"
            />
          }
        >
          <RotateCcwIcon />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60">
          <PopoverHeader>
            <PopoverTitle>보드 초기화</PopoverTitle>
            <PopoverDescription>
              샘플 포스트잇을 불러오거나 보드를 비울 수 있습니다.
            </PopoverDescription>
          </PopoverHeader>
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onLoadSample()
                setIsResetOpen(false)
              }}
              className="w-full justify-start"
            >
              <SparklesIcon data-icon="inline-start" />
              샘플 포스트잇 불러오기
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onClearBoard()
                setIsResetOpen(false)
              }}
              className="w-full justify-start"
            >
              <Trash2Icon data-icon="inline-start" />
              모든 포스트잇 비우기
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleTheme}
              aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            />
          }
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </TooltipTrigger>
        <TooltipContent>
          {isDark ? "라이트 모드로 전환 (D)" : "다크 모드로 전환 (D)"}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
