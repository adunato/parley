# Configure ComfyUI Local Instance Address

## Status
Draft

## Goals
- Allow the configuration of the ComfyUI local instance address directly from the application's image generation settings.
- Ensure the configured address is saved and persists across sessions.
- Integrate the configured address into the application's workflow (e.g., API routes/client-side fetching) when triggering generation requests.

## Proposed Solution
- **UI Addition:** Add a Settings/Configuration input field specifically for the "ComfyUI Local Instance Address".
- **State Management:** Bind this input to the appropriate global state/Zustand store (or local storage implementation) to ensure it persists.
- **Service Update:** Update the image generation service logic to use this dynamically configured address instead of a fixed/hardcoded one.
