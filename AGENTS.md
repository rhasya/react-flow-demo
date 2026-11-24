<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI & Style Components

이 프로젝트는 기본 UI, style 컴포넌트는 신규로 생성하지 말고 shadcn 컴포넌트를 활용한다.
사용 가능한 컴포넌트는 skill을 통해 확인할 수 있다.

## Commit Message

커밋 메시지는 `(짧은 구분): (내용 요약, 한국어)` 형식으로 작성한다.

- 예: `feat: 노드 추가 기능 구현`, `fix: 엣지 연결 오류 수정`, `docs: AGENTS.md 규칙 추가`

