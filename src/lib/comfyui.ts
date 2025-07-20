
import { Client } from "@stable-canvas/comfyui-client";
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
  const workflow = {
    "3": {
      "inputs": {
        "seed": 104371019928516,
        "steps": 25,
        "cfg": 8,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1,
        "model": [
          "4",
          0
        ],
        "positive": [
          "6",
          0
        ],
        "negative": [
          "7",
          0
        ],
        "latent_image": [
          "5",
          0
        ]
      },
      "class_type": "KSampler",
      "_meta": {
        "title": "KSampler"
      }
    },
    "4": {
      "inputs": {
        "ckpt_name": [
          "10",
          0
        ]
      },
      "class_type": "CheckpointLoaderSimple",
      "_meta": {
        "title": "Load Checkpoint"
      }
    },
    "5": {
      "inputs": {
        "width": [
          "12",
          0
        ],
        "height": [
          "14",
          0
        ],
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage",
      "_meta": {
        "title": "Empty Latent Image"
      }
    },
    "6": {
      "inputs": {
        "text": [
          "11",
          0
        ],
        "clip": [
          "4",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "7": {
      "inputs": {
        "text": [
          "13",
          0
        ],
        "clip": [
          "4",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "8": {
      "inputs": {
        "samples": [
          "3",
          0
        ],
        "vae": [
          "4",
          2
        ]
      },
      "class_type": "VAEDecode",
      "_meta": {
        "title": "VAE Decode"
      }
    },
    "10": {
      "inputs": {
        "name": "ckpt_name",
        "type": "choice",
        "default": "epicrealismXL_vxiiiAb3ast.safetensors"
      },
      "class_type": "ETN_Parameter",
      "_meta": {
        "title": "Parameter"
      }
    },
    "11": {
      "inputs": {
        "name": "positive_prompt",
        "type": "prompt (positive)",
        "default": "a portrait of a girl"
      },
      "class_type": "ETN_Parameter",
      "_meta": {
        "title": "Parameter"
      }
    },
    "12": {
      "inputs": {
        "name": "width",
        "type": "number (integer)",
        "default": 1024,
        "min": 16,
        "max": 16384
      },
      "class_type": "ETN_Parameter",
      "_meta": {
        "title": "Parameter"
      }
    },
    "13": {
      "inputs": {
        "name": "positive_prompt",
        "type": "prompt (negative)",
        "default": "text, watermark"
      },
      "class_type": "ETN_Parameter",
      "_meta": {
        "title": "Parameter"
      }
    },
    "14": {
      "inputs": {
        "name": "height",
        "type": "number (integer)",
        "default": 1024,
        "min": 16,
        "max": 16384
      },
      "class_type": "ETN_Parameter",
      "_meta": {
        "title": "Parameter"
      }
    },
    "15": {
      "inputs": {
        "images": [
          "8",
          0
        ]
      },
      "class_type": "SaveImageWebsocket",
      "_meta": {
        "title": "SaveImageWebsocket"
      }
    }
  };

  const queuedPrompt = await client.enqueue_polling(workflow, { workflow: workflow });

  if (queuedPrompt.images && queuedPrompt.images.length > 0) {
    return queuedPrompt.images[0].data;
  } else {
    throw new Error("No image found in the ComfyUI response.");
  }
}
