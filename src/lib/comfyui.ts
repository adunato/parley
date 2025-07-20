
import { Client } from "@stable-canvas/comfyui-client";
import fs from 'fs';
import { Character } from '@/lib/entityStore';
import WebSocket from "ws";
import fetch from "node-fetch";

const client = new Client({
  api_host: "127.0.0.1:8188",
  WebSocket: WebSocket as any,
  fetch: fetch as any,
});

client.connect();

export async function generateImage(character: Character) {
  const workflow = JSON.parse(fs.readFileSync('./image_workflows/test_workflow.json', 'utf8'));

  const queuedPrompt = await client.enqueue_polling(workflow, { workflow: workflow });

  if (queuedPrompt.images && queuedPrompt.images.length > 0) {
    return queuedPrompt.images[0].data;
  } else {
    throw new Error("No image found in the ComfyUI response.");
  }
}
