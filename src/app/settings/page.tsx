"use client";

import { useState, useEffect } from "react";
import { useParleyStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

interface Model {
  id: string;
  name: string;
  provider: string;
}

export default function SettingsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const { chatModel, setChatModel, summarizationModel, setSummarizationModel, generationModel, setGenerationModel } = useParleyStore();

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
          itemToString={(item) => `${item.id} (${item.provider})`}
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
          itemToString={(item) => `${item.id} (${item.provider})`}
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
          itemToString={(item) => `${item.id} (${item.provider})`}
        />
      </section>
    </div>
  );
}