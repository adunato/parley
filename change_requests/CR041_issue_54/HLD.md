# feat: bio-generator - the edit/creation dialog for entities is too narrow

## Status
Draft

## Goals
- Increase the width of the entity edit/creation dialog in the bio-generator to approximately twice its current size.
- Improve the usability of the dialog by providing more horizontal space for fields.

## Proposed Solution
- Identify the component responsible for the entity dialog (likely `BioEntityEditor` or similar dialog component).
- Adjust the CSS or Tailwind classes controlling the dialog's width (e.g., changing `max-w-md` to `max-w-2xl` or similar).
