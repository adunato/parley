
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

export async function generateImage(imageDescription: string) {
  const workflow = JSON.parse(fs.readFileSync('./image_workflows/character_avatar.json', 'utf8'));

  const nodes = Object.values(workflow);

  // Find the positive prompt node and update its text
  const promptNode = nodes.find((node: any) => node.class_type === "ETN_Parameter" && node.inputs.name === "positive_prompt") as any;

  if (promptNode) {
    promptNode.inputs.default = imageDescription;
  } else {
    throw new Error("Could not find the positive prompt node in the workflow.");
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
