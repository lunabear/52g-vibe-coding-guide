# Gemini Engineering Playbook: prd-generator

## 1. Core Mission

**Objective**: To act as an expert AI software engineer, augmenting the development of the `prd-generator` project.

**Guiding Principles**:
- **Context-First**: My primary directive is to understand the existing codebase, patterns, and conventions before writing a single line of code.
- **Precision & Quality**: All contributions must be high-quality, idiomatic, and align with the project's established technical standards.
- **Proactive Collaboration**: I will anticipate needs, offer solutions, and automate repetitive tasks to accelerate the development lifecycle.

---

## 2. Project Overview

`prd-generator` is a sophisticated web application built with **Next.js** and **TypeScript**. Its primary purpose is to guide users through a series of questions and, based on their answers, interact with the **Miso Agent API** to generate, refine, and manage Product Requirements Documents (PRDs).

- **Frontend**: A dynamic, user-friendly interface built with React, Tailwind CSS, and Radix UI components.
- **Backend**: Leverages Next.js API Routes to securely communicate with the Miso Agent API and other backend services.
- **State Management**: Utilizes React Context (`contexts/PRDContext.tsx`) for managing global state related to the PRD generation workflow.

---

## 3. Technical Architecture & Stack

| Category              | Technology / Library                                                                                             | Purpose & Convention                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**         | [Next.js](https://nextjs.org/) (^15.3.5)                                                                         | Core application framework. Utilize App Router for routing, Server/Client Components, and API routes.                                             |
| **Language**          | [TypeScript](https://www.typescriptlang.org/) (^5.8.3)                                                           | Enforce strict typing across the entire codebase. Leverage types from `types/` and define new ones as needed.                                    |
| **Package Manager**   | [pnpm](https://pnpm.io/)                                                                                         | Use `pnpm` for all dependency management to ensure fast, efficient, and consistent installs.                                                      |
| **UI Components**     | [Radix UI](https://www.radix-ui.com/)                                                                            | Foundation for accessible, unstyled UI primitives (Dialog, Dropdown, etc.). Found in `components/ui`.                                            |
| **Styling**           | [Tailwind CSS](https://tailwindcss.com/)                                                                         | Utility-first CSS framework for styling. Adhere to `tailwind.config.js` and existing utility class patterns.                                    |
| **Class Merging**     | `clsx`, `tailwind-merge`                                                                                         | Safely construct and merge Tailwind CSS class names for dynamic and conditional styling.                                                          |
| **Icons**             | [Lucide React](https://lucide.dev/)                                                                              | For all iconography. Keep icons consistent and import them as needed.                                                                             |
| **Animations**        | [Framer Motion](https://www.framer.com/motion/)                                                                  | For UI animations and transitions. Use sparingly and purposefully to enhance user experience.                                                     |
| **Linting & Formatting** | [ESLint](https://eslint.org/) with `eslint-config-next`                                                          | Maintain code quality and consistency. All code must pass linting checks before merging.                                                        |
| **API Communication** | `fetch` API (wrapped in `lib/miso-agent-api.ts`, `lib/miso-api.ts`)                                                | Centralize all external API interactions within the `lib/` directory to decouple data fetching from UI components.                               |
| **Markdown**          | `react-markdown`, `rehype-raw`, `remark-gfm`                                                                     | To render PRD content and other Markdown-based text within the application.                                                                       |

---

## 4. Development Workflow

### 4.1. Initial Setup

1.  **Clone the repository.**
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Configure Environment**: Create a `.env.local` file by copying `.env.local.example`. Populate it with the necessary API keys and environment-specific variables.
    ```bash
    cp .env.local.example .env.local
    ```

### 4.2. Running the Application

-   **Development Mode**: Run the Next.js development server.
    ```bash
    pnpm dev
    ```
-   **Production Build**: To build and start the application for production.
    ```bash
    pnpm build
    pnpm start
    ```

### 4.3. Code Quality & Verification

Before committing any changes, **you must run the following commands** to ensure code quality and prevent regressions:

1.  **Type Checking**:
    ```bash
    pnpm type-check
    ```
2.  **Linting**:
    ```bash
    pnpm lint
    ```

---

## 5. Codebase Structure & Conventions

-   **`app/`**: App Router directory.
    -   `app/api/`: Backend API routes. Business logic should be minimal here; abstract complex logic into `lib/`.
    -   `app/(pages)/page.tsx`: Each subdirectory represents a route. Keep page components clean, primarily for layout and data fetching.
-   **`components/`**: Reusable React components.
    -   `components/ui/`: Generic, application-agnostic UI elements (Button, Card, Input). Often built upon Radix UI.
    -   `components/common/`: Components used across multiple features but specific to this application (e.g., `Container`, `ConfirmModal`).
    -   `components/layout/`: Major layout components like `Header` and `Footer`.
    -   `components/prd/`: Components specifically for the PRD generation feature set.
-   **`contexts/`**: Global state management.
    -   `PRDContext.tsx`: Manages the state of the PRD creation process. New global state should be added here or in a new, dedicated context if the domain is different.
-   **`hooks/`**: Custom React hooks for shared component logic.
-   **`lib/`**: Core application logic, external API clients, and utilities.
    -   `lib/miso-agent-api.ts`, `lib/miso-api.ts`: Pre-configured clients for interacting with backend services. **Use these wrappers** instead of calling `fetch` directly in components.
    -   `lib/utils.ts`: General utility functions.
-   **`types/`**: TypeScript type definitions.
    -   `prd.types.ts`: Contains all type definitions related to the PRD data structures. Keep this file as the single source of truth for PRD-related types.

---

## 6. Git & Commit Guidelines

-   **Branching**: Create descriptive, kebab-case branches from `main` (e.g., `feature/new-onboarding-flow`, `fix/login-bug`).
-   **Commits**: Write clear, concise commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.
    -   **Format**: `feat: add user profile page` or `fix(api): correct response handling for chat`
    -   **Body**: The commit body should explain the "what" and "why," not the "how."
-   **Pull Requests**: Ensure all checks (linting, type-checking) pass before requesting a review. Provide a clear description of the changes.