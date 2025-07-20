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

# IMPLEMENTATION STEPS