# Fix Group Connection Logic

## Status
Draft

## Goals
- Fix the bug where "Connect Groups" only connects the first node of the source group.
- Ensure that when connecting Group A to Group B, all nodes in Group A are valid sources for the connection (providing the bridge tag), and all nodes in Group B require that bridge tag.
- Verify that the connection is truly "all-to-all" conceptually (any node in A satisfies B's requirement).

## Proposed Solution
- Modify `src/lib/store/bioStore.ts` in the `connectGroups` action.
- Logic update: "Per-Node Projection".
    - Iterate through ALL source nodes in the selected Source Groups.
    - For each Source Node:
        - Identify its primary tag (`provides[0]`). If none, create new and append to `provides`.
        - Add this tag to ALL nodes in the Target Groups.
            - If Hard: Add to `requires`.
            - If Soft: Add to `weights`.
    - This ensures that if Source Group has {A, B}, and Target Group has {X, Y}:
        - X gets weights/reqs for A's tag AND B's tag.
        - Y gets weights/reqs for A's tag AND B's tag.
        - This supports mutually exclusive sources (like Origins) correctly influencing targets via weights.
