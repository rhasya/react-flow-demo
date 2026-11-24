# react-flow-demo

React Flow(`@xyflow/react`)를 활용하여 사용자의 입력에 실시간으로 반응하는 인터랙티브 포스트잇 보드 애플리케이션입니다.

## 주요 기능

- **입력 반응형 포스트잇**: 하단 플로팅 입력 바를 통한 즉시 생성(비중첩 뷰포트 중심 배치), 생성 전 캔버스 실시간 미리보기, 선택된 포스트잇 실시간 내용·색상 동기화, 생성 시 부드러운 뷰포트 이동 및 강조 애니메이션
- **포스트잇 커스텀 노드**: 노드 내부 직접 텍스트 편집(`nodrag`/`nowheel` 적용), 5가지 라이트/다크 대응 색상 프리셋(노랑·분홍·파랑·초록·보라), 개별 툴바(색상 변경·복제·삭제), `NodeResizer` 크기 조절, 4방향 자유 연결 `Handle`
- **캔버스 및 보드 관리**: 드래그 이동, 줌/팬, `Background`/`Controls`/`MiniMap`(토글), 상단 툴바(새 포스트잇 추가, 전체 보기 `fitView`, 선택 삭제, 샘플 불러오기/전체 비우기), `localStorage` 기반 노드·엣지·뷰포트 자동 저장 및 복원
- **일관된 UI 및 테마**: shadcn/ui (`base-nova`) 기반 인터페이스, `next-themes` 라이트/다크 테마 전환(툴바 버튼 및 `d` 단축키 동기화)

## 기술 스택

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Canvas / Flow**: React Flow (`@xyflow/react`)
- **UI & Styling**: Tailwind CSS v4, shadcn/ui (`base-nova`), Lucide Icons, `next-themes`
- **Package Manager**: pnpm

## 시작하기

의존성을 설치한 뒤 개발 서버를 실행합니다.

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속해 확인할 수 있습니다.

## 사용법 및 단축키

| 단축키 / 동작 | 설명 |
| --- | --- |
| `Enter` (생성 모드) | 입력 바 내용을 새 포스트잇으로 추가 |
| `Shift + Enter` | 입력 바 줄바꿈 |
| `Cmd/Ctrl + Enter` | 새 포스트잇 추가 / 선택 노트 편집 완료 |
| `Escape` | 입력 초기화 또는 포커스·편집 종료 |
| `Backspace` / `Delete` | 선택된 포스트잇·연결선 삭제 (입력창 포커스 시 비활성화) |
| `d` | 라이트/다크 테마 토글 (입력창 포커스 시 비활성화) |

## 주요 스크립트

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 코드 검사 |
| `pnpm typecheck` | TypeScript 타입 검사 (`tsc --noEmit`) |
| `pnpm format` | Prettier 코드 포맷팅 |

## UI 컴포넌트 추가 (shadcn/ui)

이 프로젝트는 기본 UI 및 스타일 컴포넌트를 새로 생성하지 않고 shadcn/ui 컴포넌트를 활용합니다. 컴포넌트를 추가할 때는 아래 명령어를 사용합니다.

```bash
pnpm dlx shadcn@latest add button
```

추가된 컴포넌트는 `components/ui` 경로에 생성되며 다음과 같이 가져와 사용합니다.

```tsx
import { Button } from "@/components/ui/button";
```
