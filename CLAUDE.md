# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AI-powered PRD (Product Requirements Document) generator with Next.js 15 and TypeScript, featuring:
- 8-step structured questionnaire flow with MISO AI insights
- Template marketplace integration (MISOMarket)
- Real-time chat functionality with Mini Ally
- Multiple document generation (PRD, Design System, Database Schema)

## Development Commands
```bash
# Package manager: pnpm (9.12.1)
pnpm install         # Install dependencies
pnpm dev            # Run development server (http://localhost:3000)
pnpm build          # Build for production
pnpm lint           # Run ESLint
pnpm type-check     # Run TypeScript type checking (tsc --noEmit)
```

## Architecture

### Core State Management
The application uses React Context API with a central `PRDContext` managing:
- Step navigation (8 predefined steps + dynamic expert questions)
- Answer collection with validation
- Additional questions per step
- Generated content (PRD, design, database schema)

### API Integration Pattern
All MISO API calls go through server-side API routes:
```
Client → /api/miso/* → Server (with API keys) → MISO API
```

Key API clients:
- `lib/miso-api.ts` - Main MISO workflow API integration
- `lib/miso-agent-api.ts` - MISO Agent API for chat functionality
- `lib/miso-supabase.ts` - Supabase integration for MISOMarket

### Routing Structure
- `/` - Home page with template marketplace
- `/prd-generator` - Main PRD generation flow
- `/prd-result` - Results page with generated documents
- `/chat` - Mini Ally chat interface
- `/miso-generator` - Alternative MISO workflow generator

## Key Implementation Details

### Step Flow Management
The PRD generation follows a strict 8-step flow defined in `lib/prd-questions.ts`:
1. Project Overview
2. Goals & Objectives  
3. Target Audience
4. Key Features
5. User Stories
6. Technical Requirements
7. Success Metrics
8. Timeline

Each step can have additional AI-generated questions stored in `additionalQuestions` state.

### Document Generation
Three types of documents are generated sequentially:
1. **PRD**: Based on all collected answers
2. **Design System**: Generated from PRD content
3. **Database Schema**: Generated from PRD + Design content

### Template System
Templates are stored in `lib/data/templates.ts` and integrate with Supabase for the MISOMarket feature. Each template pre-fills specific answers in the PRD flow.

### Environment Variables
Required in `.env.local`:
```env
# MISO API Keys (server-side only)
MISO_API_KEY=
MISO_GENERATOR_API_KEY=
MISO_AGENT_API_KEY=

# Public Supabase (for MISOMarket)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Code Style Guidelines

### Component Pattern
```typescript
interface ComponentNameProps {
  // Props definition
}

export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Implementation
};
```

### Conditional Styling
Always use the `cn()` utility from `lib/utils.ts`:
```typescript
className={cn(
  "base-classes",
  condition && "conditional-classes"
)}
```

### API Route Pattern
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate and process
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

## Common Tasks

### Adding a New Step
1. Update `PRD_STEPS` in `lib/prd-questions.ts`
2. Ensure proper ordering and validation rules
3. Update progress indicators if needed

### Modifying API Integration
1. Add new methods to `MISOAPIClient` in `lib/miso-api.ts`
2. Create corresponding API route in `app/api/miso/`
3. Keep API keys server-side only

### Working with Templates
1. Templates defined in `lib/data/templates.ts`
2. Each template has `prefillData` mapping to question IDs
3. Templates can be filtered by category

## Important Notes
- Never expose API keys in client-side code
- All MISO API calls must go through server-side routes
- Maintain the 8-step flow structure for consistency
- Use proper TypeScript types (no `any` unless necessary)
- Follow the established naming conventions for consistency