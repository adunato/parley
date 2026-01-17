---
name: create-change-request
description: Initiates a formal change request workflow. Handles folder creation, High Level Design (HLD) drafting, git branching, and user approval. Use this when the user wants to start a new task, feature, or change request (CR).
---

# Goal
To standardize the setup of new work items by enforcing a directory structure, documentation first (HLD), and version control best practices.

# Instructions

## Phase 1: Setup and Directory Management
1.  **Determine Change ID:**
    * List the contents of the `\change_requests` directory.
    * Identify the highest existing counter in the format `CRXXX` (e.g., if `CR012` exists, the next is `CR013`).
    * If the directory is empty, start with `CR001`.
2.  **Sanitize Title:** Convert the user's provided title to snake_case or kebab-case (e.g., "Fix Login Bug" -> `fix_login_bug`).
3.  **Create Directory:**
    * Create a new folder: `\change_requests\CR{NextNumber}_{SanitizedTitle}`.

## Phase 2: High Level Design (HLD)
1.  **Create File:** Inside the new folder, create a file named `HLD.md`.
2.  **Write Content:** Populate the file with the following structure based on the user's request:
    * `# Title`: The human-readable title of the change.
    * `## Status`: Set to "Draft".
    * `## Goals`: A bulleted list of what this change achieves.
    * `## Proposed Solution`: A technical summary of the files to be changed and the logic to be implemented.

## Phase 3: Version Control
1.  **Create Branch:** Create and switch to a new git branch named `change/CR{NextNumber}-{SanitizedTitle}`.
2.  **Commit:**
    * Stage the new `HLD.md`.
    * Commit with the message: `docs: init HLD for CR{NextNumber} {Title}`.

## Phase 4: Approval
1.  **Review:** Display the content of the created `HLD.md` to the user.
2.  **Wait:** Explicitly ask the user: "Do you approve this High Level Design? I will wait for your confirmation before writing any implementation code."