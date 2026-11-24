"use client"

import type { CSSProperties, FormEvent, KeyboardEvent, RefObject } from "react"
import {
  CheckIcon,
  PlusIcon,
  SparklesIcon,
  StickyNoteIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  isStickyNoteColor,
  STICKY_NOTE_COLOR_PRESETS,
  type StickyNoteColor,
} from "./sticky-note-types"

type StickyInputBarProps = {
  mode: "create" | "sync"
  text: string
  color: StickyNoteColor
  isPreviewActive: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onTextChange: (value: string) => void
  onColorChange: (color: StickyNoteColor) => void
  onSubmitCreate: () => void
  onExitSyncMode: () => void
  onFocusChange: (focused: boolean) => void
}

export function StickyInputBar({
  mode,
  text,
  color,
  isPreviewActive,
  textareaRef,
  onTextChange,
  onColorChange,
  onSubmitCreate,
  onExitSyncMode,
  onFocusChange,
}: StickyInputBarProps) {
  const handleColorValueChange = (values: string[]) => {
    const nextColor = values[0]
    if (isStickyNoteColor(nextColor) && nextColor !== color) {
      onColorChange(nextColor)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === "create") {
      onSubmitCreate()
    } else {
      onExitSyncMode()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return
    }

    if (mode === "create") {
      if (
        event.key === "Enter" &&
        (event.metaKey || event.ctrlKey || (!event.shiftKey && !event.altKey))
      ) {
        event.preventDefault()
        onSubmitCreate()
        return
      }

      if (event.key === "Escape") {
        if (text.length > 0) {
          onTextChange("")
        } else {
          event.currentTarget.blur()
        }
      }
      return
    }

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      onExitSyncMode()
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      onExitSyncMode()
      event.currentTarget.blur()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={() => onFocusChange(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onFocusChange(false)
        }
      }}
      className="nodrag nopan nowheel flex w-[min(calc(100vw-2rem),540px)] flex-col gap-2 rounded-2xl border border-border bg-card/95 p-2.5 shadow-lg backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {mode === "sync" ? (
            <>
              <Badge variant="default">
                <SparklesIcon data-icon="inline-start" />
                선택 노트 실시간 편집
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onExitSyncMode}
              >
                <PlusIcon data-icon="inline-start" />새 메모
              </Button>
            </>
          ) : (
            <>
              <Badge variant="secondary">
                <StickyNoteIcon data-icon="inline-start" />새 포스트잇
              </Badge>
              {isPreviewActive ? (
                <span className="text-xs text-muted-foreground">
                  캔버스에 미리보기 표시 중
                </span>
              ) : null}
            </>
          )}
        </div>

        <ToggleGroup
          value={[color]}
          onValueChange={handleColorValueChange}
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
                style={{ "--swatch-color": preset.swatchVar } as CSSProperties}
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "sync"
              ? "선택된 포스트잇 내용을 실시간으로 편집하세요... (Cmd/Ctrl+Enter 완료)"
              : "포스트잇 내용을 입력하세요... (Enter 추가 · Shift+Enter 줄바꿈)"
          }
          aria-label={
            mode === "sync" ? "선택된 포스트잇 편집" : "새 포스트잇 내용 입력"
          }
          className="nodrag nowheel nopan min-h-10 max-h-28 flex-1 resize-none py-2 text-sm leading-relaxed"
        />

        {mode === "create" ? (
          <Button
            type="submit"
            disabled={text.trim().length === 0}
            aria-label="포스트잇 추가"
          >
            <PlusIcon data-icon="inline-start" />
            추가
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={onExitSyncMode}
            aria-label="편집 완료"
          >
            <CheckIcon data-icon="inline-start" />
            완료
          </Button>
        )}
      </div>
    </form>
  )
}
