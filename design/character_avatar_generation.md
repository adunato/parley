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

4. Integration with comfyui.ts

* Function Call: The (potentially modified) image description from the dialog will be sent to a function in src/lib/comfyui.ts (e.g., generateImage) to initiate the image generation process.
* Input: The generateImage function in comfyui.ts will receive the user-approved image description as input.
* Output: comfyui.ts will return the generated image, likely as a base64 data URL.

4. Image Saving and Storage

* Public Directory: The generated image (base64 data URL) will be saved to the public/avatars directory. This will likely
  involve a new API route for handling image uploads/saving, similar to existing avatar uploading logic.
* State Update: The avatar field of the Character or PlayerPersona object in the Zustand store (src/lib/store.ts) will be
  updated with the URL of the newly saved image.

5. Prompt Management

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
    * Update the generateImage function (or create a new one) to accept the LLM-generated image description as input.
    * Ensure the comfyui.ts logic correctly uses this description to generate the image.
4. Create Image Upload/Save API Route (if not already existing):
    * If a generic image upload/save route doesn't exist, create one (e.g., src/app/api/upload/avatar/route.ts) that can
      take a base64 data URL and save it to public/avatars, returning the public URL.
5. Integrate into Configuration Components:
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
