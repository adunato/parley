# Gemini Project: Parley

This project is a web-based text adventure game built with Next.js and TypeScript. The application presents a story with choices to the user.

## Project Structure

The project follows the standard Next.js App Router structure.

```
src/
├── app/                  # Next.js App Router root
│   ├── api/              # API Routes
│   ├── chat/             # Chat page
│   ├── character-config/ # Character configuration
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/               # Reusable UI components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Core application logic
│   ├── engine/           # Game engine logic (Analyst, Judge, etc.)
│   ├── generator/        # Procedural generation (LLM based)
│   ├── store/            # State management (Zustand)
│   └── llm.ts            # LLM integration
└── stories/              # Storybook stories
```

-   The frontend is located in `src/app/page.tsx` and other route directories.
-   The backend logic for the chat component is in `src/app/api/chat/route.ts`.
-   Static assets and global styles are in `src/app/`.
-   TypeScript types are defined within the relevant components or imported from `src/lib/types.ts`.

## Code Editing Process

**For EVERY change, you MUST follow these steps:**
1. Assign a dedicated CR number (in `change_requests`) and create an associated branch, using an HLD to capture even just a summary of changes. 
2. Ask clarifying questions if you don't understand the user prompt. 
3. Assess the changes and plan implementation steps *before* editing code. 
4. After changes are completed, build the project by running `npm run build`. 
5. Always commit after any code changes.

## React Components Design

 When working with React components, follow these guidelines:
 1. **Reuse First**: Always check `src/components/ui` for existing components before creating a new one.
 2. **Design for Reusability**: If a new component is needed, ensure it is designed in a generic, reusable way rather than being tightly coupled to a specific feature.
 3. **Storybook Documentation**: After creating a new component, you MUST create a corresponding Storybook story in `src/stories/` to document its usage and variations.

---

## React Best Practices: You Might Not Need an Effect

### Core Message

➡️ **Effects are meant for syncing with external systems**—like the DOM API, third-party widgets, timers, server requests, etc. If you're just transforming data for rendering or handling user events, you likely **don’t need an effect**.

---

### Two common anti-patterns

1.  **Deriving state from props or other state using `useEffect`**

    *   ❌ *Bad*:

        ```js
        const [fullName, setFullName] = useState('');
        useEffect(() => {
          setFullName(firstName + ' ' + lastName);
        }, [firstName, lastName]);
        ```
    *   ✅ *Good*:

        ```js
        const fullName = firstName + ' ' + lastName;
        ```

        Calculations should happen during render, not in effects—this avoids unnecessary extra renders.

2.  **Updating state in an effect in response to user events**

    *   Instead of using an effect after state changes → do it directly in the event handler.
    *   For example, make your API call or trigger actions in the `onClick` itself—not in a `useEffect` that watches some state flag.

---

### ✅ When *you do* need `useEffect`

Use it when you truly need to sync with something **outside** of React:

*   Controlling a non‑React widget or DOM element via refs (like `.focus()` or third‑party animation).
*   Network connections (chat subscriptions) or HTTP requests (e.g., `fetch()`).
*   Browser APIs (e.g. `localStorage`, global event listeners).

---

### Alternatives to effects

*   **Compute during render**—avoid putting derived data in state.
*   **Use `useMemo`** for expensive computations.
*   **Reset state on prop changes** using `key` prop or controlled values.
*   **Handle side effects in event handlers** rather than using effects as intermediaries.

---

### TL;DR

Keep your components simpler and faster by:

*   Only using `useEffect` when you need to bridge to outside-world systems.
*   Doing data transformations and event handling directly and cleanly in render or handlers.
*   Dropping unnecessary effects—removing bugs, render overhead, and mental burden.