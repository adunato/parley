# Fix Group Connection Logic

## Status
Draft

## Goals
- Fix the bug where "Connect Groups" only connects the first node of the source group.
- Ensure that when connecting Group A to Group B, all nodes in Group A are valid sources for the connection (providing the bridge tag), and all nodes in Group B require that bridge tag.
- Verify that the connection is truly "all-to-all" conceptually (any node in A satisfies B's requirement).

## Proposed Solution
- Modify `src/lib/store/bioStore.ts` in the `connectGroups` action.
- Ensure that the tag assignment logic (adding `provides` tag) iterates correctly over ALL nodes in the source group.
- Ensure that the `requires` tag assignment iterates correctly over ALL nodes in the target group.
- Verify the `processList` logic and `tagId` selection logic.
- Add a test case to verify the fix.
