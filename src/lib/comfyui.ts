
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

export async function generateImage(imageDescription: string, overrides: Record<string, any> = {}) {
  const workflow = JSON.parse(fs.readFileSync('./image_workflows/character_avatar.json', 'utf8'));

  const nodes = Object.values(workflow) as any[];

  // Merge imageDescription into overrides as positive_prompt if not present
  const finalOverrides: Record<string, any> = {
    positive_prompt: imageDescription,
    ...overrides
  };

  // Map 'model' to 'ckpt_name' if present (settings use 'model', workflow uses 'ckpt_name')
  if (finalOverrides.model) {
    finalOverrides.ckpt_name = finalOverrides.model;
  }

  // Handle random seed if set to -1
  if (finalOverrides.seed === -1) {
    finalOverrides.seed = Math.floor(Math.random() * 1000000000);
  }

  // Iterate through all nodes to find ETN_Parameter nodes and apply overrides
  nodes.forEach((node) => {
    if (node.class_type === "ETN_Parameter") {
      const parameterName = node.inputs.name;
      if (finalOverrides.hasOwnProperty(parameterName)) {
        node.inputs.default = finalOverrides[parameterName];
      }
    }

    // Handle KSampler specific overrides (Steps, CFG, etc) which are not ETN_Parameters
    if (node.class_type === "KSampler") {
      ['steps', 'cfg', 'sampler_name', 'scheduler', 'denoise'].forEach((key) => {
        if (finalOverrides.hasOwnProperty(key)) {
          node.inputs[key] = finalOverrides[key];
        }
      });
    }
  });

  try {
    const queuedPrompt = await client.enqueue_polling(workflow, { workflow: workflow });

    if (queuedPrompt.images && queuedPrompt.images.length > 0) {
      const imageUrl = queuedPrompt.images[0].data as string;
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      return Buffer.from(imageBuffer).toString('base64');
    } else {
      throw new Error("No image found in the ComfyUI response.");
    }
  } catch (error: any) {
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      throw new Error("ComfyUI is not running or not accessible at 127.0.0.1:8188");
    }
    throw error;
  }
}

export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch("http://127.0.0.1:8188/object_info/CheckpointLoaderSimple");
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json() as any;
    return data.CheckpointLoaderSimple.input.required.ckpt_name[0];
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || (error.cause && error.cause.code === 'ECONNREFUSED')) {
      console.warn("ComfyUI is not accessible. Returning empty model list.");
      return [];
    }
    console.error("Error fetching ComfyUI models:", error);
    return [];
  }
}
