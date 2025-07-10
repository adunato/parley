# Gemini Project: Parley

This project is a web-based text adventure game built with Next.js and TypeScript. The application presents a story with choices to the user.

## Game Design Document

After each change, you should check `game_design.md` and update it as needed.

## Git commit rules

Do not commit unless user asks for it.
Due to an unusual shell behavior, multi-word commit messages with `git commit -m "message"` are not currently supported. Please use hyphens instead of spaces for multi-word messages (e.g., `git commit -m "feat-add-new-feature"`).

## Project Structure

The project follows the standard Next.js App Router structure.

-   The frontend is located in `src/app/page.tsx`.
-   The backend logic is in an API route at `src/app/api/game/route.ts`.
-   Static assets and global styles are in `src/app/`.
-   TypeScript types are defined in `src/app/types.ts`.

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