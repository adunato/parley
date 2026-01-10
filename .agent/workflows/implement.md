---
description: Implementation workflow
---

Upon implementing a new request always follow these rules.

When working with React components, follow these guidelines:
 1. **Reuse First**: Always check `src/components/ui` for existing components before creating a new one.
 2. **Design for Reusability**: If a new component is needed, ensure it is designed in a generic, reusable way rather than being tightly coupled to a specific feature.
 3. **Storybook Documentation**: After creating a new component, you MUST create a corresponding Storybook story in `src/stories/` to document its usage and variations.

After changes are completed, build the project by running `npm run build`. 

If the change warrants it test it in the browser.

Commit after every change, ensuring you are using the correct branch.