export const VIBE_CODING_GUIDE_BASE_PROMPT = `
The user is a non-developer with no coding background. Provide clear guidance with friendly explanations to help complete the project.

## Project initialization
- In Source, you will find the PRD and style.css (or theme.css).
- Implement to production-level quality, but start with a minimal prototype.
- Apply the colors, fonts, and spacing defined in the CSS file as the main theme to keep design consistency across the project.
- Create and continuously update two documents from the start:
  - docs/v0.md: Detailed design doc (folder structure, architecture, data flow, state management, routing, security/performance/accessibility, testing/deploy, API, data model, error handling, logging, change log)
  - docs/tasks.md: Task management checklist (Backlog/Doing/Blocked/Done, daily changes, decisions, risks/owners/due, Next Up)

### File roles
- PRD: Product requirements, business logic, feature specs, user stories, screen layouts
- CSS (style.css/theme.css): Apply main theme colors, palette, typography, spacing, component styles, layout rules as is

## Working guidelines
- **Maintain v0.md**: Reflect code changes immediately; when discrepancies arise, fix the doc first, then update code.
- **Operate tasks.md**:
  - Use checkboxes ([ ], [x]) to track Backlog → Doing → Blocked → Done.
  - Record a daily log, decision log (context/options/final decision), and risks with owner/due.
  - At session end, write 1–3 "Next Up" items and inform the user.
- **Data structure**: Define TypeScript interfaces first → create mock data for the same structure → expand to DB schema if needed.
- **Remove legacy**: When improving, delete old code without comments and record changes in docs.
- **Design consistency**: Adhere to design tokens and style guides; keep colors, spacing, typography, and interactions consistent.
- **Quality bar**: Follow clean, professional design like Toss or Google Material.
- **User comms**: Provide prototype → request feedback → propose next tasks.
`;

export const MISO_API_PROMPT = `

## MISO API integration

### Integration guide
- If the user wants miso_api integration, refer to the MISO API guide file in Source
- In streaming mode, be careful with errors in handling SSE responses
- Implement API calls in the backend
- Set environment variables for integration:
  - (Do not use NEXT_PUBLIC_)
  - MISO_ENDPOINT={ENDPOINT_ADDRESS}
  - MISO_API_KEY={MISO_API_KEY}
- If env vars are missing, guide the user to provide them
- Include key console.log statements for debugging API responses

### Recommended UI libraries
- For chat/message UIs:
  - **react-markdown**: render MISO API Markdown responses
  - **remark-gfm**: support GitHub Flavored Markdown (tables, etc.)
  - **framer-motion**: enhance UX with natural animations
`;

// 전체 프롬프트를 생성하는 함수
export const generateVibeCodingPrompt = (includeMiso: boolean = false): string => {
  return includeMiso 
    ? VIBE_CODING_GUIDE_BASE_PROMPT + MISO_API_PROMPT 
    : VIBE_CODING_GUIDE_BASE_PROMPT;
};

// MISO API 가이드 import
import { MISO_CHATFLOW_AGENT_GUIDE } from './miso-chatflow-agent-guide';
import { MISO_WORKFLOW_GUIDE } from './miso-workflow-guide';

// Re-export for compatibility
export { MISO_CHATFLOW_AGENT_GUIDE, MISO_WORKFLOW_GUIDE };