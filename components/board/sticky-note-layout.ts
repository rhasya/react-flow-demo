import type { XYPosition } from "@xyflow/react"

import {
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_WIDTH,
  type StickyNoteNodeType,
} from "./sticky-note-types"

const OVERLAP_PADDING = 16
const RING_GAP = 24
const MAX_SEARCH_RINGS = 6

type RectSize = {
  width: number
  height: number
}

function hasOverlap(
  position: XYPosition,
  size: RectSize,
  existingNodes: readonly StickyNoteNodeType[]
): boolean {
  for (const node of existingNodes) {
    const nodeWidth =
      node.width ?? node.measured?.width ?? DEFAULT_STICKY_NOTE_WIDTH
    const nodeHeight =
      node.height ?? node.measured?.height ?? DEFAULT_STICKY_NOTE_HEIGHT

    const overlapsX =
      position.x < node.position.x + nodeWidth + OVERLAP_PADDING &&
      position.x + size.width + OVERLAP_PADDING > node.position.x
    const overlapsY =
      position.y < node.position.y + nodeHeight + OVERLAP_PADDING &&
      position.y + size.height + OVERLAP_PADDING > node.position.y

    if (overlapsX && overlapsY) {
      return true
    }
  }

  return false
}

function buildRingOffsets(ring: number): Array<{ dx: number; dy: number }> {
  const cardinal: Array<{ dx: number; dy: number }> = []
  const diagonal: Array<{ dx: number; dy: number }> = []

  for (let dy = -ring; dy <= ring; dy += 1) {
    for (let dx = -ring; dx <= ring; dx += 1) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) {
        continue
      }
      if (dx === 0 || dy === 0) {
        cardinal.push({ dx, dy })
      } else {
        diagonal.push({ dx, dy })
      }
    }
  }

  return [...cardinal, ...diagonal]
}

export function findNonOverlappingPosition(
  preferredPosition: XYPosition,
  existingNodes: readonly StickyNoteNodeType[],
  size: RectSize = {
    width: DEFAULT_STICKY_NOTE_WIDTH,
    height: DEFAULT_STICKY_NOTE_HEIGHT,
  }
): XYPosition {
  const roundedPreferred: XYPosition = {
    x: Math.round(preferredPosition.x),
    y: Math.round(preferredPosition.y),
  }

  if (!hasOverlap(roundedPreferred, size, existingNodes)) {
    return roundedPreferred
  }

  const stepX = size.width + RING_GAP
  const stepY = size.height + RING_GAP

  for (let ring = 1; ring <= MAX_SEARCH_RINGS; ring += 1) {
    for (const { dx, dy } of buildRingOffsets(ring)) {
      const candidate: XYPosition = {
        x: Math.round(preferredPosition.x + dx * stepX),
        y: Math.round(preferredPosition.y + dy * stepY),
      }
      if (!hasOverlap(candidate, size, existingNodes)) {
        return candidate
      }
    }
  }

  const cascade = ((existingNodes.length % 6) + 1) * 32
  return {
    x: Math.round(preferredPosition.x + cascade),
    y: Math.round(preferredPosition.y + cascade),
  }
}
