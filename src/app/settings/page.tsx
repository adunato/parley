"use client";

import { useState, useEffect } from "react";
import { useParleyStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";

interface Model {
  id: string;
  name: string;
  provider: string;
}

export default function SettingsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const {
    chatModel, setChatModel,
    summarizationModel, setSummarizationModel,
    generationModel, setGenerationModel,
    avatarGenerationSettings, setAvatarGenerationSettings
  } = useParleyStore();

  useEffect(() => {
    async function fetchModels() {
      const response = await fetch("/api/models");
      const data = await response.json();
      setModels(data);
    }
    fetchModels();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chat Model</h2>
        <Label htmlFor="chat-model-select" className="sr-only">Chat Model</Label>
        <Combobox<Model>
          items={models}
          value={chatModel}
          onValueChange={setChatModel}
          placeholder="Select a chat model..."
          filterFn={(item, query) =>
            item.id.toLowerCase().includes(query.toLowerCase())
          }
          itemToString={(item) => item.provider ? `${item.id} - ${item.name} (${item.provider})` : `${item.id} - ${item.name}`}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Summarization Model</h2>
        <Label htmlFor="summarization-model-select" className="sr-only">Summarization Model</Label>
        <Combobox<Model>
          items={models}
          value={summarizationModel}
          onValueChange={setSummarizationModel}
          placeholder="Select a summarization model..."
          filterFn={(item, query) =>
            item.id.toLowerCase().includes(query.toLowerCase())
          }
          itemToString={(item) => item.provider ? `${item.id} - ${item.name} (${item.provider})` : `${item.id} - ${item.name}`}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Generation Model</h2>
        <Label htmlFor="generation-model-select" className="sr-only">Generation Model</Label>
        <Combobox<Model>
          items={models}
          value={generationModel}
          onValueChange={setGenerationModel}
          placeholder="Select a generation model..."
          filterFn={(item, query) =>
            item.id.toLowerCase().includes(query.toLowerCase())
          }
          itemToString={(item) => item.provider ? `${item.id} - ${item.name} (${item.provider})` : `${item.id} - ${item.name}`}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Avatar Generation</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={avatarGenerationSettings.width}
                onChange={(e) => setAvatarGenerationSettings({ width: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={avatarGenerationSettings.height}
                onChange={(e) => setAvatarGenerationSettings({ height: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="steps">Steps</Label>
              <Input
                id="steps"
                type="number"
                value={avatarGenerationSettings.steps}
                onChange={(e) => setAvatarGenerationSettings({ steps: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg">CFG Scale</Label>
              <Input
                id="cfg"
                type="number"
                step="0.1"
                value={avatarGenerationSettings.cfg}
                onChange={(e) => setAvatarGenerationSettings({ cfg: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (-1 for random)</Label>
              <Input
                id="seed"
                type="number"
                value={avatarGenerationSettings.seed}
                onChange={(e) => setAvatarGenerationSettings({ seed: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negative-prompt">Negative Prompt</Label>
            <Textarea
              id="negative-prompt"
              value={avatarGenerationSettings.negativePrompt}
              onChange={(e) => setAvatarGenerationSettings({ negativePrompt: e.target.value })}
              placeholder="Enter negative prompt..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model Checkpoint Name</Label>
            <Input
              id="model"
              value={avatarGenerationSettings.model}
              onChange={(e) => setAvatarGenerationSettings({ model: e.target.value })}
              placeholder="e.g. epicrealismXL_vxiiiAb3ast.safetensors"
            />
          </div>
        </div>
      </section>
    </div>
  );
}