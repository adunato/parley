# HLD: Loading Screen Implementation (CR017)

## Problem
Currently, when the application starts, the Main Menu is displayed immediately. However, the data (managed by `entityStore` and `gameStore`) is loaded asynchronously from IndexedDB (via Dexie). This causes the Main Menu to be non-responsive or display incomplete data until hydration is complete. The user experience is degraded as they might try to interact with the UI before it's ready.

## Solution
We will implement a **Loading Screen** that is displayed while the critical application stores are hydrating.

### Key Changes
1.  **Store Hydration Tracking**:
    *   Update `entityStore` and `gameStore` to expose their hydration status (e.g., `_hasHydrated`).
    *   Alternatively, use a `useHydration` hook or a central `LoadingContext` to track the "ready" state of all stores.
    
2.  **Loading Screen Component**:
    *   Create a new `LoadingScreen` component in `src/components/ui`.
    *   The design should be consistent with the application's aesthetic (dark mode, premium feel).
    *   It should show a loading indicator (spinner or progress bar) and potentially a "Loading..." text.

3.  **Application Entry Point Update**:
    *   Modify `src/app/page.tsx` (the Main Menu) or a higher-level layout to conditionally render the `LoadingScreen` based on hydration status.
    *   If `entityStore` OR `gameStore` is not hydrated, show `LoadingScreen`.
    *   Once hydrated, show `MainMenu`.

### Detailed Design

#### Hydration Tracking
We will modify the `persist` options in Zustand stores to update a `_hasHydrated` flag in the store state upon completion of rehydration.

```typescript
// Example pattern for store
onRehydrateStorage: () => (state) => {
  if (state) {
    state.setHasHydrated(true);
  }
}
```

#### Transition
Use a simple conditional render in `MainMenu`.

```tsx
export default function MainMenu() {
  const isEntityHydrated = useEntityStore(state => state._hasHydrated);
  // ... other stores

  if (!isEntityHydrated) {
    return <LoadingScreen />;
  }

  return (
    // Existing Main Menu JSX
  );
}
```

## UI/UX
The loading screen will feature the application title "PARLEY" and a subtle loading animation, ensuring a premium "app-like" feel.
