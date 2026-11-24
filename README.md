# react-flow-demo

React Flow(`@xyflow/react`)를 활용하여 사용자의 입력에 실시간으로 반응하는 인터랙티브 포스트잇 보드 애플리케이션입니다.

## 주요 기능 (목표)

- **입력 반응형 포스트잇**: 사용자의 입력에 반응해 포스트잇 노드를 생성하고 내용을 실시간으로 업데이트하는 인터랙티브 경험
- **자유로운 캔버스 조작**: React Flow 기반 캔버스 위에서 포스트잇 이동(드래그), 줌/팬, 노드 간 연결(엣지) 지원
- **포스트잇 편집 및 관리**: 포스트잇 텍스트 편집, 스타일 및 색상 변경 등 직관적인 보드 관리 기능
- **일관된 UI 및 테마**: shadcn/ui 기반의 깔끔한 인터페이스와 라이트/다크 테마(`next-themes`) 지원

## 기술 스택

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Canvas / Flow**: React Flow (`@xyflow/react`) *(도입 예정)*
- **UI & Styling**: Tailwind CSS v4, shadcn/ui (`base-nova`), Lucide Icons, `next-themes`
- **Package Manager**: pnpm

## 시작하기

의존성을 설치한 뒤 개발 서버를 실행합니다.

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속해 확인할 수 있습니다.

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
