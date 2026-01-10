# CR018 Gameplay Toolbar

## Goal
Implement a HUD/Toolbar at the top of the game screen, visible only during "play mode" (active chat session).
The toolbar serves as a status display and navigation anchor.

## Proposed Changes

### 1. Update `GameTimeDisplay` Component
**Location:** `src/components/ui/game-time-display.tsx`
- **Current Behavior:** Displays "Day X [TimeOfDay]" text + Weather/Time Icon.
- **New Behavior:**
    - Text: Displays "Day X" only.
    - Icon: Displays a specific icon for the Time of Day (Morning, Afternoon, Evening, Night).
    - **Logic Change:** The icon logic will be simplifed to strictly show Time availability, potentially ignoring weather for the icon (or maybe user wants weather *and* time? prompt says "Time of the day icon...").
    - *Assumption:* The user explicitly contrasted "Weather icon" with "Time of the day icon". I will prioritize Time icons (Sun, SunHigh?, Sunset, Moon).

### 2. Create `GameplayToolbar` Component
**Location:** `src/components/gameplay-toolbar.tsx` (New)
- **Structure:**
    - **Left:** Persona Avatar (Placeholder - explicit circle/image).
    - **Center:** `GameTimeDisplay` widget.
    - **Right:**
        - Settings Icon (Placeholder).
        - Exit Icon (Triggers exit to main menu).

### 3. Integration
**Location:** `src/app/chat/page.tsx`
- Insert `GameplayToolbar` into the layout.
- **Visibility:** Only render when `isChatActive` is true (or generally on the chat page if "play mode" covers setup too, but likely active chat).
    - *Decision:* Start with `isChatActive` true, as "Day" and "Time" are most relevant when the timeline is active.

### 4. Icons
- Use `lucide-react` for:
    - Settings (`Settings` or `Cog`)
    - Exit (`LogOut`, `Home`, or `X`)
    - Time Icons (`Sun`, `SunMedium`?, `Sunset`, `Moon`)

## Verification Plan

### Manual Verification
1. **Start Game:** Go to Chat page.
2. **Start Session:** Select Location/Character/Persona and Start Chat.
3. **Verify Toolbar:**
    - Check if Toolbar appears at the top.
    - Check Persona Avatar placeholder.
    - Check Time Widget: Should say "Day X" and show generic time icon (e.g. Sun for Morning).
    - Check Settings/Exit icons.
4. **Test Functionality:**
    - Click Exit icon -> Should go to Main Menu (`/`).
5. **Verify "Setup" Mode:**
    - End chat.
    - Verify Toolbar is HIDDEN (or check user preference, but mostly likely hidden or replaced by Back button).

### Automated Tests
- None planned for this visual feature at this stage, relying on manual verification.
