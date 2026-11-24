import type { Edge, Viewport } from "@xyflow/react"

import {
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_WIDTH,
  isStickyNoteColor,
  PREVIEW_NODE_ID,
  STICKY_NOTE_TYPE,
  type StickyNoteNodeType,
} from "./sticky-note-types"

export const BOARD_STORAGE_KEY = "react-flow-demo:sticky-board:v1"
export const BOARD_STORAGE_VERSION = 1

export type PersistedBoardState = {
  version: 1
  nodes: StickyNoteNodeType[]
  edges: Edge[]
  viewport?: Viewport
  savedAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function sanitizeNodesForStorage(
  nodes: readonly StickyNoteNodeType[]
): StickyNoteNodeType[] {
  return nodes
    .filter((node) => node.id !== PREVIEW_NODE_ID)
    .map((node) => {
      const width =
        node.width ?? node.measured?.width ?? DEFAULT_STICKY_NOTE_WIDTH
      const height =
        node.height ?? node.measured?.height ?? DEFAULT_STICKY_NOTE_HEIGHT

      return {
        id: node.id,
        type: STICKY_NOTE_TYPE,
        position: {
          x: node.position.x,
          y: node.position.y,
        },
        width,
        height,
        selected: false,
        data: {
          text: node.data.text,
          color: node.data.color,
          createdAt: node.data.createdAt,
          updatedAt: node.data.updatedAt,
        },
      }
    })
}

function normalizeNode(raw: unknown): StickyNoteNodeType | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || raw.id === PREVIEW_NODE_ID) {
    return null
  }

  if (
    !isRecord(raw.position) ||
    !isFiniteNumber(raw.position.x) ||
    !isFiniteNumber(raw.position.y)
  ) {
    return null
  }

  const rawData = isRecord(raw.data) ? raw.data : {}
  const now = new Date().toISOString()
  const createdAt =
    typeof rawData.createdAt === "string" && rawData.createdAt.length > 0
      ? rawData.createdAt
      : now
  const updatedAt =
    typeof rawData.updatedAt === "string" && rawData.updatedAt.length > 0
      ? rawData.updatedAt
      : createdAt

  const width =
    isFiniteNumber(raw.width) && raw.width > 0
      ? raw.width
      : DEFAULT_STICKY_NOTE_WIDTH
  const height =
    isFiniteNumber(raw.height) && raw.height > 0
      ? raw.height
      : DEFAULT_STICKY_NOTE_HEIGHT

  return {
    id: raw.id,
    type: STICKY_NOTE_TYPE,
    position: {
      x: raw.position.x,
      y: raw.position.y,
    },
    width,
    height,
    selected: false,
    data: {
      text: typeof rawData.text === "string" ? rawData.text : "",
      color: isStickyNoteColor(rawData.color) ? rawData.color : "yellow",
      createdAt,
      updatedAt,
    },
  }
}

function normalizeEdge(
  raw: unknown,
  validNodeIds: ReadonlySet<string>
): Edge | null {
  if (
    !isRecord(raw) ||
    typeof raw.id !== "string" ||
    typeof raw.source !== "string" ||
    typeof raw.target !== "string"
  ) {
    return null
  }

  if (!validNodeIds.has(raw.source) || !validNodeIds.has(raw.target)) {
    return null
  }

  return {
    id: raw.id,
    source: raw.source,
    target: raw.target,
    sourceHandle:
      typeof raw.sourceHandle === "string" ? raw.sourceHandle : undefined,
    targetHandle:
      typeof raw.targetHandle === "string" ? raw.targetHandle : undefined,
    type: typeof raw.type === "string" ? raw.type : "smoothstep",
  }
}

function normalizeViewport(raw: unknown): Viewport | undefined {
  if (!isRecord(raw)) {
    return undefined
  }
  if (
    !isFiniteNumber(raw.x) ||
    !isFiniteNumber(raw.y) ||
    !isFiniteNumber(raw.zoom) ||
    raw.zoom <= 0
  ) {
    return undefined
  }
  return {
    x: raw.x,
    y: raw.y,
    zoom: raw.zoom,
  }
}

export function loadBoardState(): PersistedBoardState | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawText = window.localStorage.getItem(BOARD_STORAGE_KEY)
    if (!rawText) {
      return null
    }

    const parsed: unknown = JSON.parse(rawText)
    if (
      !isRecord(parsed) ||
      parsed.version !== BOARD_STORAGE_VERSION ||
      !Array.isArray(parsed.nodes) ||
      !Array.isArray(parsed.edges)
    ) {
      return null
    }

    const nodes = parsed.nodes
      .map(normalizeNode)
      .filter((node): node is StickyNoteNodeType => node !== null)

    const validNodeIds = new Set(nodes.map((node) => node.id))
    const edges = parsed.edges
      .map((edge) => normalizeEdge(edge, validNodeIds))
      .filter((edge): edge is Edge => edge !== null)

    return {
      version: BOARD_STORAGE_VERSION,
      nodes,
      edges,
      viewport: normalizeViewport(parsed.viewport),
      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function saveBoardState(input: {
  nodes: readonly StickyNoteNodeType[]
  edges: readonly Edge[]
  viewport?: Viewport
}): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const payload: PersistedBoardState = {
      version: BOARD_STORAGE_VERSION,
      nodes: sanitizeNodesForStorage(input.nodes),
      edges: input.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type ?? "smoothstep",
      })),
      viewport: normalizeViewport(input.viewport),
      savedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore quota or storage access errors
  }
}

export function clearBoardState(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.removeItem(BOARD_STORAGE_KEY)
  } catch {
    // Ignore storage access errors
  }
}
