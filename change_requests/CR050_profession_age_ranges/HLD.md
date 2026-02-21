# CR050: Profession Age Ranges

## Status
Draft

## Goals
- Add `minAge` and `maxAge` attributes to Professions.
- Allow configuration of these age limits in the Profession Configuration UI.
- Validate character Age against the selected Profession in the Character Configuration "Basic Information" section.
- Generalize error styling for inputs in the UI component library.
- Improve Procedural Character Generator logic to randomize age (16-75 or constrained by profession) instead of reusing the previous age from localStorage.
- Stop reusing the previous `targetProfessional` and `targetChildhood` from localStorage in the Procedural Generator.
- Apply the same age validation in the Procedural Character Generator when a specific target professional is selected.

## Proposed Solution

### 1. Data Model (`src/lib/types.ts`)
- Update the `Profession` interface to include `minAge?: number;` and `maxAge?: number;`.

### 2. UI Component Library (`src/components/ui/input.tsx` & `src/components/ui/select.tsx`)
- Enhance the `Input` component to accept an optional `error` or `isInvalid` prop.
- When true, append error styling (e.g., `border-destructive text-destructive focus-visible:ring-destructive`).
- Optionally add a generalized error message component or pattern to use alongside inputs.

### 3. Profession Configuration (`src/components/professions/profession-modal.tsx`)
- Add number inputs for `minAge` and `maxAge` in the `ProfessionModal`.
- Ensure values persist to the `bioStore`.

### 4. Character Configuration ("Basic Information" in `src/components/character-configuration.tsx`)
- Add a derived validation check that compares `displayCharacter.basicInfo.age` against the selected profession's (`displayCharacter.basicInfo.role`) defined `minAge` and `maxAge`.
- If invalid, pass the new `error` prop to the Age `Input` and display an error indicator summarizing the mismatch.
- Ensure the role `Select` dropdown is unrestricted, allowing the user to select the role and then fixing the age field based on the resulting error.

### 5. Procedural Character Generator (`src/components/character/procedural-generator-dialog.tsx`)
- **Remove Persistence:** Stop loading `age`, `targetChildhood`, and `targetProfessional` from `localStorage`.
- **Age Randomization:** 
  - If a role is pre-selected, randomize the initial `age` state within the `minAge` and `maxAge` of that role.
  - If no role is selected, randomize the initial `age` between 16 and 75 natively.
- **In-Dialog Validation:** Add the same validation logic on the Age input in the "Identity Settings" panel so that if a `targetProfessional` is selected manually, the input flags an error if the age is out of bounds.

## Open Questions for User
1. Are `minAge` and `maxAge` strictly required for all professions, or optional? If optional, do we assume a default valid range of 16-75 when unbounded?
2. If `minAge` or `maxAge` are empty (undefined), should we treat them as essentially having no lower/upper limit (e.g., minimum 0, maximum 150)?
