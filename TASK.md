# TASK: React Flow 기반 입력 반응형 포스트잇 보드 구현

## 개요

[README.md](./README.md)에 정의된 **React Flow(`@xyflow/react`)를 활용하여 사용자 입력에 실시간으로 반응하는 인터랙티브 포스트잇 보드 애플리케이션**을 구현하기 위한 작업 목록입니다.

### 현재 프로젝트 상태

- **프레임워크/런타임**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, `pnpm`
- **UI/테마**: `next-themes` 기반 `components/theme-provider.tsx` 구현 완료 (`d` 키 테마 토글 포함, 입력 요소 포커스 시 무시)
- **shadcn/ui**: `components/ui/button.tsx`만 설치되어 있으며, 추가 기본 UI 컴포넌트는 필요 시 `pnpm dlx shadcn@latest add <component>`로 추가해야 함 (`AGENTS.md` 규칙 준수)
- **미구현**: `@xyflow/react` 패키지 미설치, `app/page.tsx` 초기 템플릿 상태

### 작업 원칙

- 기본 UI/스타일 컴포넌트는 새로 생성하지 않고 shadcn/ui 컴포넌트를 활용한다.
- 패키지 설치 및 스크립트 실행은 `pnpm`을 사용한다.
- 커밋 메시지는 `(짧은 구분): (내용 요약, 한국어)` 형식을 따른다.

---

## Phase 1. 환경 및 의존성 세팅

- [x] `@xyflow/react` 패키지 설치 (`pnpm add @xyflow/react`)
- [x] React Flow 기본 스타일(`@xyflow/react/dist/style.css`) 및 Tailwind v4 / 다크 모드 호환 스타일 연동 확인
- [x] 필요한 shadcn/ui 컴포넌트 추가 (`pnpm dlx shadcn@latest add input textarea popover tooltip separator badge toggle-group` 등 실제 구현에 필요한 항목 선별 설치)
- [x] `app/layout.tsx`의 `lang="ko"` 및 프로젝트 `metadata`(`title`, `description`) 정비

## Phase 2. React Flow 기본 캔버스 구축

- [x] `app/page.tsx`의 초기 템플릿 코드를 포스트잇 보드 진입 화면으로 교체
- [x] `ReactFlowProvider`를 포함한 클라이언트 보드 컴포넌트 구조 설계 및 구성
- [x] 전체 화면(`100svh` / `100vw`) React Flow 캔버스 레이아웃 구현
- [x] `Background`, `Controls`, `MiniMap`(필요 시 토글) 등 기본 캔버스 UI 배치
- [x] 노드 드래그 이동, 줌/팬, 노드 간 엣지 연결(`onConnect`), 선택 노드/엣지 삭제 동작 구현
- [x] `next-themes`의 `resolvedTheme`와 React Flow `colorMode` 동기화

## Phase 3. 포스트잇 커스텀 노드 구현

- [x] 포스트잇 노드 데이터 타입 정의 (`StickyNoteData`: 텍스트 내용, 색상 프리셋, 생성/수정 시각 등)
- [x] 커스텀 노드 컴포넌트(`StickyNoteNode`) 구현 및 `nodeTypes` 등록
- [x] 노드 내부 텍스트 직접 편집 기능 구현 (`nodrag`, `nowheel` 클래스 적용으로 입력·스크롤 시 캔버스 드래그/줌 간섭 방지)
- [x] 포스트잇 색상/스타일 프리셋 정의 및 라이트/다크 테마 가독성 확보
- [x] 노드 개별 액션 UI 구현 (색상 변경, 복제, 삭제, 크기 조절 `NodeResizer`, 연결용 `Handle`)

## Phase 4. 입력 반응형 포스트잇 인터랙션 구현

- [x] 캔버스 내 플로팅 입력 바(`Panel` + shadcn/ui `Input`/`Textarea`, `Button`) 구현
- [x] 입력 제출 시 현재 뷰포트 중심(또는 기존 노드와 겹치지 않는 오프셋 위치)에 새 포스트잇 노드 즉시 생성
- [x] 입력 중 실시간 반응 인터랙션 구현
  - [x] 선택된 포스트잇이 있을 때 입력 내용 실시간 동기화 또는 새 포스트잇 미리보기/하이라이트 반응
  - [x] 노드 생성 시 부드러운 뷰포트 이동/포커스 전환 및 시각적 피드백(애니메이션/강조) 적용
- [x] 입력 바 내 포스트잇 색상 선택 및 단축키(`Enter` 또는 `Cmd/Ctrl + Enter`) 지원

## Phase 5. 보드 관리 및 테마/UX 고도화

- [ ] 상단 또는 플로팅 툴바 구성
  - [ ] 새 포스트잇 추가 버튼
  - [ ] 전체 보기(`fitView`) 버튼
  - [ ] 보드 초기화(또는 샘플 포스트잇 불러오기) 버튼
  - [ ] 라이트/다크 테마 토글 버튼 (기존 `ThemeProvider`의 `d` 단축키와 상태 동기화)
- [ ] `localStorage` 기반 보드 상태(노드, 엣지, 뷰포트) 자동 저장 및 복원 기능 구현
- [ ] 키보드 입력 중 전역/캔버스 단축키 충돌 방지 점검 (`INPUT`/`TEXTAREA` 포커스 시 `d` 테마 토글 및 노드 삭제 키 비활성화 확인)

## Phase 6. 검증 및 문서화

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` 실행 및 오류 없음 확인
- [ ] 라이트/다크 테마 전환 및 데스크톱/모바일 뷰포트에서의 캔버스·입력 UX 동작 점검
- [ ] 구현 완료 사항을 반영해 `README.md` 업데이트 (`*(도입 예정)*` 표기 제거 및 실제 기능/사용법 안내 보완)
