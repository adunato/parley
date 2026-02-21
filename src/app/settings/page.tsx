"use client";

import { useState, useEffect } from "react";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { ConfigPage } from "@/components/layout/config-page";
import { PromptConfig } from "@/lib/store/promptStore";
import { useParleyStore } from "@/lib/store";

interface Model {
  id: string;
  name: string;
  provider: string;
}

export default function SettingsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [comfyuiModels, setComfyuiModels] = useState<Model[]>([]);
  const [prompts, setPrompts] = useState<Record<string, PromptConfig>>({});
  const [loading, setLoading] = useState(true);
  const { setSystemPromptTemplate, avatarGenerationSettings } = useParleyStore();

  async function fetchModels(address: string) {
    try {
      const response = await fetch("/api/models");
      const data = await response.json();
      setModels(data);

      const comfyResponse = await fetch(`/api/models/comfyui?address=${encodeURIComponent(address)}`);
      const comfyData = await comfyResponse.json();
      setComfyuiModels(comfyData.models.map((m: string) => ({ id: m, name: m, provider: 'ComfyUI' })));
    } catch (error) {
      console.error("Failed to fetch models", error);
    }
  }

  async function fetchPrompts() {
    try {
      const response = await fetch("/api/settings/prompts");
      const data = await response.json();
      setPrompts(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch prompts", error);
      return {};
    }
  }

  // Initial load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchModels(avatarGenerationSettings.comfyuiAddress), fetchPrompts()]);
      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Refetch models silently when comfyuiAddress changes
  useEffect(() => {
    if (!loading) { // Don't run this concurrently with the initial load
      fetchModels(avatarGenerationSettings.comfyuiAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarGenerationSettings.comfyuiAddress]);

  const handleSavePrompt = async (id: string, template: string) => {
    try {
      await fetch("/api/settings/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, template })
      });
      const updatedPrompts = await fetchPrompts(); // Reload to ensure sync
      if (id === 'chat_system') {
        setSystemPromptTemplate(template);
      }
    } catch (error) {
      console.error("Failed to save prompt", error);
    }
  };

  const handleResetPrompt = async (id: string) => {
    try {
      await fetch("/api/settings/prompts/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const updatedPrompts = await fetchPrompts(); // Reload to get default
      if (id === 'chat_system' && updatedPrompts['chat_system']) {
        setSystemPromptTemplate(updatedPrompts['chat_system'].template);
      }
    } catch (error) {
      console.error("Failed to reset prompt", error);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading settings...</div>;
  }

  return (
    <ConfigPage>
      <h1 className="type-h2 mb-8 text-foreground">Settings</h1>

      <SettingsTabs
        models={models}
        comfyuiModels={comfyuiModels}
        prompts={prompts}
        onSavePrompt={handleSavePrompt}
        onResetPrompt={handleResetPrompt}
      />
    </ConfigPage>
  );
}