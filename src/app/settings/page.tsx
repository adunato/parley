"use client";

import { useState, useEffect } from "react";
import { useParleyStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";

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

  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chat Model</h2>
        <Select value={chatModel} onValueChange={setChatModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select a chat model" />
          </SelectTrigger>
          <SelectContent className="p-0">
            <Command>
              <CommandInput
                placeholder="Search models..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {models
                  .filter((model) =>
                    model.id.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.id} ({model.provider})
                    </SelectItem>
                  ))}
              </CommandList>
            </Command>
          </SelectContent>
        </Select>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Summarization Model</h2>
        <Select value={summarizationModel} onValueChange={setSummarizationModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select a summarization model" />
          </SelectTrigger>
          <SelectContent className="p-0">
            <Command>
              <CommandInput
                placeholder="Search models..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {models
                  .filter((model) =>
                    model.id.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.id} ({model.provider})
                    </SelectItem>
                  ))}
              </CommandList>
            </Command>
          </SelectContent>
        </Select>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Generation Model</h2>
        <Select value={generationModel} onValueChange={setGenerationModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select a generation model" />
          </SelectTrigger>
          <SelectContent className="p-0">
            <Command>
              <CommandInput
                placeholder="Search models..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {models
                  .filter((model) =>
                    model.id.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.id} ({model.provider})
                    </SelectItem>
                  ))}
              </CommandList>
            </Command>
          </SelectContent>
        </Select>
      </section>
    </div>
  );
}
