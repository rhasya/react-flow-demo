import type { Node, XYPosition } from "@xyflow/react"

export const STICKY_NOTE_TYPE = "stickyNote" as const
export const PREVIEW_NODE_ID = "__sticky-note-preview__" as const

export type StickyNoteColor = "yellow" | "pink" | "blue" | "green" | "purple"

export type StickyNoteColorPreset = {
  id: StickyNoteColor
  label: string
  swatchVar: string
}

export const STICKY_NOTE_COLOR_PRESETS: readonly StickyNoteColorPreset[] = [
  { id: "yellow", label: "노랑", swatchVar: "var(--note-yellow-swatch)" },
  { id: "pink", label: "분홍", swatchVar: "var(--note-pink-swatch)" },
  { id: "blue", label: "파랑", swatchVar: "var(--note-blue-swatch)" },
  { id: "green", label: "초록", swatchVar: "var(--note-green-swatch)" },
  { id: "purple", label: "보라", swatchVar: "var(--note-purple-swatch)" },
]

const STICKY_NOTE_COLOR_SET = new Set<string>(
  STICKY_NOTE_COLOR_PRESETS.map((preset) => preset.id)
)

export function isStickyNoteColor(value: unknown): value is StickyNoteColor {
  return typeof value === "string" && STICKY_NOTE_COLOR_SET.has(value)
}

export type StickyNoteData = {
  text: string
  color: StickyNoteColor
  createdAt: string
  updatedAt: string
  isPreview?: boolean
  isSyncing?: boolean
  isJustCreated?: boolean
}

export type StickyNoteNodeType = Node<StickyNoteData, typeof STICKY_NOTE_TYPE>

export const DEFAULT_STICKY_NOTE_WIDTH = 240
export const DEFAULT_STICKY_NOTE_HEIGHT = 200
export const MIN_STICKY_NOTE_WIDTH = 180
export const MIN_STICKY_NOTE_HEIGHT = 140
export const MAX_STICKY_NOTE_WIDTH = 480
export const MAX_STICKY_NOTE_HEIGHT = 480

export type CreateStickyNoteOptions = {
  id?: string
  position: XYPosition
  text?: string
  color?: StickyNoteColor
  width?: number
  height?: number
  selected?: boolean
  createdAt?: string
  updatedAt?: string
}

export function createStickyNoteNode({
  id,
  position,
  text = "",
  color = "yellow",
  width = DEFAULT_STICKY_NOTE_WIDTH,
  height = DEFAULT_STICKY_NOTE_HEIGHT,
  selected,
  createdAt,
  updatedAt,
}: CreateStickyNoteOptions): StickyNoteNodeType {
  const now = new Date().toISOString()
  const resolvedCreatedAt = createdAt ?? now
  const resolvedUpdatedAt = updatedAt ?? resolvedCreatedAt

  return {
    id: id ?? `note-${crypto.randomUUID().slice(0, 8)}`,
    type: STICKY_NOTE_TYPE,
    position,
    width,
    height,
    selected,
    data: {
      text,
      color,
      createdAt: resolvedCreatedAt,
      updatedAt: resolvedUpdatedAt,
    },
  }
}

const stickyNoteTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export function formatStickyNoteTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) {
      return ""
    }
    return stickyNoteTimeFormatter.format(date)
  } catch {
    return ""
  }
}
