import type { Edge, Node } from "@xyflow/react"

export const INITIAL_NODES: Node[] = [
  {
    id: "note-1",
    position: { x: 80, y: 120 },
    data: { label: "포스트잇 노드를 자유롭게 드래그해 보세요." },
  },
  {
    id: "note-2",
    position: { x: 360, y: 80 },
    data: { label: "핸들을 드래그해 노드를 연결할 수 있어요." },
  },
  {
    id: "note-3",
    position: { x: 360, y: 240 },
    data: { label: "선택 후 Backspace/Delete로 삭제할 수 있어요." },
  },
]

export const INITIAL_EDGES: Edge[] = [
  {
    id: "edge-1-2",
    source: "note-1",
    target: "note-2",
    type: "smoothstep",
  },
]
