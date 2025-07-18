"use client";

import { useState, useEffect } from "react";
import { useParleyStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Model {
  id: string;
  name: string;
  provider: string;
}

export default function SettingsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const { chatModel, setChatModel, summarizationModel, setSummarizationModel, generationModel, setGenerationModel } = useParleyStore();
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function fetchModels() {
      const response = await fetch("/api/models");
      const data = await response.json();
      setModels(data);
    }
    fetchModels();

    }, []);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chat Model</h2>
        <div className="grid gap-2">
          <Label htmlFor="chat-model-search">Search Models</Label>
          <Input
            id="chat-model-search"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={chatModel} onValueChange={setChatModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a chat model" />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Summarization Model</h2>
        <div className="grid gap-2">
          <Label htmlFor="summarization-model-search">Search Models</Label>
          <Input
            id="summarization-model-search"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={summarizationModel} onValueChange={setSummarizationModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a summarization model" />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Generation Model</h2>
        <div className="grid gap-2">
          <Label htmlFor="generation-model-search">Search Models</Label>
          <Input
            id="generation-model-search"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={generationModel} onValueChange={setGenerationModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a generation model" />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
