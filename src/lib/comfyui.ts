
import { Client } from "@stable-canvas/comfyui-client";
import fs from 'fs';
import { Character } from '@/lib/types';
import WebSocket from "ws";
import fetch from "node-fetch";

const client = new Client({
  api_host: "127.0.0.1:8188",
  WebSocket: WebSocket as any,
  fetch: fetch as any,
});

client.connect();

export async function generateImage(character: Character) {
  const workflow = JSON.parse(fs.readFileSync('./image_workflows/character_avatar.json', 'utf8'));

  // Inject character data into the workflow
  // This is a simplified example, you'll need to map character data to your specific workflow nodes
  // For example, if your workflow has a node named "character_name" that takes a string input:
  // workflow.nodes.find(node => node.name === "character_name").inputs.string_input = character.basicInfo.name;
  // You'll need to inspect your actual workflow JSON to determine the correct paths.
  // For now, let's assume a simple text input node for the prompt.
  const promptNode = workflow.nodes.find((node: any) => node.type === "CLIPTextEncode" && node.inputs.text.includes("positive"));
  if (promptNode) {
    promptNode.inputs.text = `A portrait of ${character.basicInfo.name}, ${character.basicInfo.appearance}, ${character.basicInfo.firstImpression}. ${character.basicInfo.background}.`;
  }

  

  const queuedPrompt = await client.enqueue_polling(workflow, { workflow: workflow });

  if (queuedPrompt.images && queuedPrompt.images.length > 0) {
    const imageUrl = queuedPrompt.images[0].data as string;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(imageBuffer).toString('base64');
  } else {
    throw new Error("No image found in the ComfyUI response.");
  }
}
