# CR019: Update Game Design Documentation

## Goal Description
Update `docs/game_design.md` to accurately reflect the current state of the application. The document is outdated and missing several key features implemented in recent sprints.

## User Review Required
None. This is a documentation update.

## Proposed Changes
### Documentation
#### [MODIFY] [game_design.md](file:///c:/Users/danie/projects/parley/docs/game_design.md)
- **Data Persistence**: Update to describe `Dexie.js` (IndexedDB) instead of `localStorage`.
- **Game State**: Add a section explaining the split between `EntityStore` (World Config) and `GameStore` (Active Session).
- **Locations & Map**:
  - Add details about the new `/locations` page.
  - Describe the World Map functionality and "Instant Save".
- **UI/UX Features**:
  - Add "Gameplay Toolbar" section.
  - Add "Day/Weather System".
  - Add "Theme Selection".
- **Architecture**: Update project structure to include `src/lib/store` and `src/lib/db.ts`.

## Verification Plan
### Manual Verification
- Review the rendered markdown of `docs/game_design.md` to ensure clarity and accuracy.
- Verify links and code references point to existing files.
