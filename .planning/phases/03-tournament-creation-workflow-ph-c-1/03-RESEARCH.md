# Phase 3: Tournament Creation Workflow - Research

## Context Review
The goal is to implement the tournament creation workflow for organizers. Based on `03-CONTEXT.md`, the requirements are:
1. **Form Layout**: Step-by-step wizard.
2. **Rules Entry**: Both rich text editor and file upload (PDF/Image).
3. **Category & Fee**: Dynamic pricing per category.
4. **Venue Input**: Simple text field for MVP.

## Codebase Analysis
- Shared types in `packages/shared/src/index.ts` currently have a simple `Tournament` interface. We need to expand it:
  - Add `categories` array (name, fee).
  - Update `rules` to support text and `rulesFileUrl`.
- Backend uses NestJS + Mongoose. We need to create a `tournaments` module with Mongoose schemas and DTOs.
- Frontend uses React Native + Tamagui. We need a multi-step form state (can use local state or a library like `react-hook-form` with context).
- For file upload, we need to handle `multipart/form-data` in NestJS and use `expo-document-picker` or `expo-image-picker` in React Native. Since this is an MVP with mock data/simplified backend, we might mock the actual S3 file upload and just save a local mock URL or base64.

## Technical Decisions
1. **Frontend State**: Use a simple wrapper component to hold the wizard state and render steps based on current index.
2. **Backend**: Create `TournamentService`, `TournamentController`, and a `Tournament` Mongoose schema.
3. **File Uploads**: For this local MVP phase, accept file uploads via `FileInterceptor` in NestJS and store them in a local `uploads/` folder statically served, or return a mock URL if true upload isn't strictly necessary.

## API Design
`POST /tournaments`
Payload (multipart/form-data if file included, or JSON if text only):
- `title`, `description`, `sport`, `time`, `location`, `city`
- `categories`: JSON stringified array of categories with fees.
- `rulesText`: string
- `rulesFile`: (file payload)
