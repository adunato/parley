import fs from 'fs';
import path from 'path';

export function getCharacterAvatarWorkflow(imageDescription: string) {
  const workflowPath = path.join(process.cwd(), 'image_workflows', 'character_avatar.json');
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  const imageDescriptionSuffix = ", closeup portrait, front view, detailed, cinematic, 4k, sharp focus, high resolution";

  for (const nodeId in workflow) {
    const node = workflow[nodeId];
    if (node.class_type === "ETN_Parameter") {
      if (node.inputs && node.inputs.name === "positive_prompt") {
        console.log("positive_prompt: " + imageDescription + imageDescriptionSuffix);
        node.inputs.default = imageDescription + imageDescriptionSuffix;
      } else if (node.inputs && node.inputs.name === "seed") {
        node.inputs.default = Math.floor(Math.random() * 1000000000); // Set a random seed
      }
    }
  }

  return workflow;
}

export function getCharacterAvatarPoseWorkflow(imageDescription: string) {
  const workflowPath = path.join(process.cwd(), 'image_workflows', 'character_avatar_pose.json');
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  const imageDescriptionSuffix = ", closeup portrait, front view, detailed, 4k, sharp focus, high resolution, natural light, realistic";
  const poseImagePath = path.join(process.cwd(), 'image_workflows', 'character_portrait_pose.png');
  const poseImageBase64 = fs.readFileSync(poseImagePath, 'base64');

  for (const nodeId in workflow) {
    const node = workflow[nodeId];
    if (node.class_type === "ETN_Parameter") {
      if (node.inputs && node.inputs.name === "positive_prompt") {
        console.log("positive_prompt: " + imageDescription + imageDescriptionSuffix);
        node.inputs.default = imageDescription + imageDescriptionSuffix;
      } else if (node.inputs && node.inputs.name === "seed") {
        node.inputs.default = Math.floor(Math.random() * 1000000000); // Set a random seed
      }
    }
    if (node._meta?.title === "Input Character Pose") {
        if (node.inputs) {
            node.inputs.base64_data = poseImageBase64;
        }
    }
  }

  return workflow;
}