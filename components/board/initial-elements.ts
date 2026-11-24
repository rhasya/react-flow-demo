import type { Edge } from "@xyflow/react"

import {
  createStickyNoteNode,
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_WIDTH,
  type StickyNoteNodeType,
} from "./sticky-note-types"

const INITIAL_TIMESTAMP = "2026-11-24T09:00:00.000Z"

export function createInitialNodes(): StickyNoteNodeType[] {
  return [
    createStickyNoteNode({
      id: "note-1",
      position: { x: 60, y: 120 },
      width: DEFAULT_STICKY_NOTE_WIDTH,
      height: DEFAULT_STICKY_NOTE_HEIGHT,
      color: "yellow",
      text: "포스트잇 안쪽을 클릭해 내용을 바로 수정하고, 상단 바를 드래그해 이동할 수 있어요.",
      createdAt: INITIAL_TIMESTAMP,
      updatedAt: INITIAL_TIMESTAMP,
    }),
    createStickyNoteNode({
      id: "note-2",
      position: { x: 380, y: 60 },
      width: DEFAULT_STICKY_NOTE_WIDTH,
      height: DEFAULT_STICKY_NOTE_HEIGHT,
      color: "blue",
      text: "포스트잇을 선택하면 색상 변경·복제·삭제 툴바와 크기 조절 핸들이 나타납니다.",
      createdAt: INITIAL_TIMESTAMP,
      updatedAt: INITIAL_TIMESTAMP,
    }),
    createStickyNoteNode({
      id: "note-3",
      position: { x: 380, y: 290 },
      width: DEFAULT_STICKY_NOTE_WIDTH,
      height: DEFAULT_STICKY_NOTE_HEIGHT,
      color: "green",
      text: "노드 테두리의 연결점을 드래그해 다른 포스트잇과 자유롭게 연결해 보세요.",
      createdAt: INITIAL_TIMESTAMP,
      updatedAt: INITIAL_TIMESTAMP,
    }),
  ]
}

export function createInitialEdges(): Edge[] {
  return [
    {
      id: "edge-1-2",
      source: "note-1",
      sourceHandle: "right",
      target: "note-2",
      targetHandle: "left",
      type: "smoothstep",
    },
  ]
}

export const INITIAL_NODES: StickyNoteNodeType[] = createInitialNodes()
export const INITIAL_EDGES: Edge[] = createInitialEdges()
