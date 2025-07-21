import fs from 'fs';
import path from 'path';

export function getCharacterAvatarWorkflow(imageDescription: string) {
  const workflowPath = path.join(process.cwd(), 'image_workflows', 'character_avatar.json');
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  const imageDescriptionSuffix = ", portrait, detailed, cinematic, 4k, sharp focus, high resolution";

  for (const nodeId in workflow) {
    const node = workflow[nodeId];
    if (node.class_type === "ETN_Parameter") {
      if (node.inputs && node.inputs.name === "positive_prompt") {
        node.inputs.default = imageDescription + imageDescriptionSuffix;
      } else if (node.inputs && node.inputs.name === "seed") {
        node.inputs.default = Math.floor(Math.random() * 1000000000); // Set a random seed
      }
    }
  }

  return workflow;
}