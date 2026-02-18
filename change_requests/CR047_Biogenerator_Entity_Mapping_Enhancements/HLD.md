# Biogenerator Entity Mapping Enhancements

## Status
Draft

## Goals
- Enhance entity mapping capabilities in the biogenerator.
- Model requirements for mapping generated bio entities to character attributes.

## Current State
- **Symbolic Mapping**: Exists in `BioStore` and `types.ts`. Maps `Category` + `Key` -> `NodeId`.
- **UI**: `BioMappingEditor` allows creating and deleting these mappings.
- **Integration**: `BioMachine` receives `BioData` (which includes mappings), but current usage in generation logic appears limited or indirect.
- **Character Attributes**: `Character` interface has `BasicInfo` (Gender, Role, etc.), `Personality`, `Stats` (implied). currently disconnected from Bio Nodes unless manually bridged.

## Proposed Solution

### 1. Refactor `BioMappingEditor` UI
- Replace free-text inputs with Dropdowns (Select components).
- **Category Dropdown**:
  - Predefined values: `PROFESSION`, `SIBLINGS`.
- **Key Dropdown**:
  - Dependent on selected Category.
  - If `Category == PROFESSION`: List all available Professions from `BioStore`.
  - If `Category == SIBLINGS`: List predefined sibling statuses: `['No Siblings', 'One Sibling', 'Two Siblings']`.
- **Target Node Dropdown**:
  - Restrict strictly to **Spine Nodes** (Childhood, Formative, Professional, Senior).
  - Explicitly exclude Life Events (Flesh).

### 2. Context-Aware Generation (New)
- **Goal**: Seamlessly bridge Manual Input (Basic Info) with Procedural Generation.
- **Workflow**:
    1.  User selects an attribute in **Basic Info** (e.g., Profession: "High School Teacher").
    2.  User opens **Procedural Generator**.
    3.  System checks for a **Symbolic Mapping** matching the attribute (e.g., `PROFESSION` + `High School Teacher` -> `Node: EDUCATION_TEACHER`).
    4.  If found, the Generator automatically:
        -   Switches specific setting to **Custom**.
        -   Pre-selects the mapped **Target Node**.
- **User Value**: Reduces friction; the generator "knows" what you already decided.

### 3. Update Data Models
- **Siblings Attribute**:
  - Add `siblings` field to `BasicInfo`.

### 3. Implementation Details
- **BioStore**: Ensure `professions` are accessible to the Editor.
- **Types**: update `SymbolicMapping` if necessary (current structure `category, key, nodeId` is likely sufficient, just need to enforce values in UI).
