# OBJECTIVE

- Enable user to create a character avatar using comfyui local server.

# REQUIREMENTS

- User should be able to create a character avatar using comfyui local server.
- A new button next to the current image upload button should be added.
- The functionality should apply to both character and persona avatars.
- The functionality should be accessible from the character and persona configuration pages.
- The app should use a new dedicated LLM endpoint to generate character avatar image description.
- The app should then invoke the comfyui.ts library to generate the image.
- The resulting image should be saved in the public as per current avatar uploading logic.
- The prompt used to generate the image should be saved in a new dedicated file [prompts](../src/lib/prompts/imageGenerationPrompts.ts) - please refer to the existing files in the folder for reference.

# DESIGN

Objective: To enable users to generate character and persona avatars using a local ComfyUI server, driven by an
LLM-generated image description.

1. New UI Element: "Generate Avatar" Button

* Location: A new button will be added next to the existing image upload button on both the character and persona
  configuration pages (src/components/character-configuration.tsx and src/components/persona-configuration.tsx).
* Functionality: Clicking this button will trigger the avatar generation process.
* State Management: The button will likely be disabled during the generation process to prevent multiple concurrent
  requests.

2. LLM Endpoint for Image Description Generation

* New API Route: A new dedicated API route will be created (e.g., src/app/api/generate/avatar-description/route.ts).
* Purpose: This endpoint will receive character/persona data (e.g., name, traits, personality) and use an LLM to generate
  a detailed image description suitable for image generation.
* Prompt: A new prompt for generating image descriptions will be defined in src/lib/prompts/imageGenerationPrompts.ts.
  This prompt will guide the LLM to produce relevant and high-quality descriptions.

3. User Review and Tweak of Image Description

* Pop-up Dialog: After the LLM returns the image description, a pop-up dialog will be displayed to the user.
* Editable Text: The dialog will contain the LLM-generated text, allowing the user to review and tweak it.
* Submit Button: A "Submit" button within the dialog will send the (potentially modified) text to the ComfyUI server for image generation.

4. ComfyUI Workflow Management

* `comfyui.ts` Role: The `comfyui.ts` module will be updated to accept a complete JSON workflow as input and execute it directly without internal modifications.
* Workflow Adapter: A new adapter module (e.g., `src/lib/imageWorkflowAdapter.ts`) will be created. Its responsibility will be to:
    * Load the base workflow from `image_workflows/character_avatar.json`.
    * Programmatically update the `default` value of the parameter with `name: "positive_prompt"` to the LLM-generated image description string.
    * Programmatically update the `default` value of the parameter with `name: "seed"` to a random integer.
    * Return the modified JSON workflow to `comfyui.ts`.

5. Image Saving and Storage

* Existing API Route: The existing `/api/upload` route will be used to save the generated image (base64 data URL converted to a File object on the frontend) to the `public/avatars` directory.
* State Update: The `avatar` field of the `Character` or `PlayerPersona` object in the Zustand store (`src/lib/store.ts`) will be updated with the URL of the newly saved image.

6. Prompt Management

* New File: A new TypeScript file, src/lib/prompts/imageGenerationPrompts.ts, will be created.
* Content: This file will contain the prompt string(s) used by the LLM to generate image descriptions for avatars. It
  will follow the conventions of existing prompt files in src/lib/prompts/.

Implementation Steps

1. Create `imageGenerationPrompts.ts`:
    * Create the file src/lib/prompts/imageGenerationPrompts.ts.
    * Define a constant string for the LLM prompt that guides the generation of character/persona image descriptions.
    * Use src/lib/prompts/generatorPrompts.ts for reference on how to structure the prompt.
2. Create `avatar-description` API Route:
    * Create the directory src/app/api/generate/avatar-description.
    * Create the file src/app/api/generate/avatar-description/route.ts.
    * Implement the API logic:
        * Receive character/persona data from the frontend.
        * Call the LLM (using existing LLM utility functions) with the prompt from imageGenerationPrompts.ts and the
          character/persona data to get an image description.
        * Return the generated image description.
3. Modify `comfyui.ts`:
    * Update the `generateImage` function (or create a new one) to accept a complete JSON workflow object as input.
    * Ensure it executes the provided workflow as-is, without internal modifications to the workflow structure.
4. Create `imageWorkflowAdapter.ts`:
    * Create the file `src/lib/imageWorkflowAdapter.ts`.
    * Implement a function (e.g., `getCharacterAvatarWorkflow`) that:
        * Reads `image_workflows/character_avatar.json`.
        * Finds the parameter with `name: "positive_prompt"` and sets its `default` value to the provided image description string.
        * Finds the parameter with `name: "seed"` and sets its `default` value to a random integer.
        * Returns the modified workflow JSON object.
5. Update Image Saving Logic:
    * Ensure the generated image (base64 data URL) is converted to a `File` object (or similar) on the frontend before being sent to the existing `/api/upload` route.
    * The response from `/api/upload` (containing the image URL) will then be used to update the character/persona avatar in the Zustand store.
6. Integrate into Configuration Components:
    * `src/components/character-configuration.tsx`:
        * Add a new "Generate Avatar" button next to the existing avatar input.
        * Implement an onClick handler for this button.
        * The handler will:
            * Call the avatar-description API route to get the image description.
            * Display the image description in a pop-up dialog for user editing.
            * On dialog submission (user confirms/tweaks text):
                * Call the comfyui.ts function (via another API route if necessary) to generate the image.
                * Call the image upload/save API route to save the generated image.
                * Update the character's avatar field in the Zustand store with the new image URL.
            * Handle loading states and error feedback.
    * `src/components/persona-configuration.tsx`:
        * Repeat the integration steps for the persona configuration page.
6. Build Project: Run npm run build to compile the changes and ensure there are no errors.
