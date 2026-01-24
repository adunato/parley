# Bio Generator Tracks (CR042)

## Summary
Added two new spine tracks to the Bio Generator dataset to run parallel to the professional track:
1. **Relationships**: Tracks relationship status (High School Sweetheart -> Married/Single/etc).
2. **Housing**: Tracks living situation (Social Housing/Owned -> Student Halls -> Rented/Bought).

## Changes
- Added `rel_track` and `house_track` groups.
- Added Formative and Professional nodes for both tracks.
- Fixed "Orphan Tags" by mapping unused early tags (like `SIBLINGS_1`, `TRADES_SKILLS`) to weights in these new nodes.

## Implementation Details
- **Relationships Track**:
    - Formative: High School Sweetheart, Casual Dating, Self Focus.
    - Professional: Married Early, Serial Monogamy, Power Couple.
- **Housing Track**:
    - Childhood: Social Housing, Owned Home.
    - Formative: Student Halls, Parents.
    - Professional: Bought, Rented.
- **Tag Integration**:
    - `SIBLINGS_1` -> Increases `rel_hs_sweetheart`.
    - `TRADES_SKILLS` -> Increases `housing_bought`.
    - `TECH_SKILLS` -> Increases `rel_power_couple` & `housing_rented`.
