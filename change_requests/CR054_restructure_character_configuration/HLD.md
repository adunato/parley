# Restructure Character Configuration

## Status
Draft

## Goals
- Introduce a "Background Information" section between TOWN and PROFESSION.
- Change the gender field to a dropdown with only "male" and "female" values.
- Consolidate generation wands next to name, age, and gender into a single generation button for the entire basic information section.

## Proposed Solution
- Update the Character Configuration UI component to group the basic information fields under a section.
- Introduce the new "Background Information" section in the UI layout.
- Modify the gender input component to use a `Select` component restricted to "male" and "female".
- Remove individual generator buttons for name, age, and gender.
- Add a new aggregate generate button that interfaces with the faker engine and populates the remaining unset basic information parameters simultaneously.
