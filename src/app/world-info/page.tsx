'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useParleyStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function WorldInfoPage() {
  const { worldDescription, setWorldDescription } = useParleyStore();
  const [description, setDescription] = useState(worldDescription);
  const [worldCreationPrompt, setWorldCreationPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);

  useEffect(() => {
    setWorldDescription(description);
  }, [description, setWorldDescription]);

  const generateWorld = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worldDescription: prompt }),
      });
      const data = await response.json();
      if (response.ok) {
        setDescription(data.world);
      } else {
        console.error('Failed to generate world:', data.error);
        alert('Error generating world: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating world:', error);
      alert('An unexpected error occurred while generating the world.');
    } finally {
      setIsLoading(false);
      setIsPromptDialogOpen(false); // Close dialog after generation
    }
  };

  const handleGenerateWorld = async () => {
    const descriptionToSend = description || "a fantasy world with magic and mythical creatures"; // Provide a default if empty
    generateWorld(descriptionToSend);
  };

  const handleGenerateWithPrompt = async () => {
    generateWorld(worldCreationPrompt);
  };

  return (
        <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">World Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 mb-4">
              <label htmlFor="worldCreationPrompt" className="md:text-right font-medium">
                Creation Prompt
              </label>
              <Textarea
                id="worldCreationPrompt"
                value={worldCreationPrompt}
                onChange={(e) => setWorldCreationPrompt(e.target.value)}
                className="col-span-3 min-h-[100px]"
                rows={4}
                placeholder="Enter a prompt for world creation (e.g., 'A steampunk world with flying islands and ancient automatons')"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <div className="flex items-center gap-2 md:col-span-1 md:justify-end">
                <label htmlFor="worldDescription" className="font-medium">
                  World Description
                </label>
                <Button
                  onClick={handleGenerateWorld}
                  disabled={isLoading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="sr-only">Generate World</span>
                </Button>
              </div>
              <Textarea
                id="worldDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 min-h-[200px]"
                rows={10}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Generate with Prompt</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate World with Custom Prompt</DialogTitle>
                <DialogDescription>
                  Enter your desired prompt for world creation here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  id="customPrompt"
                  value={worldCreationPrompt}
                  onChange={(e) => setWorldCreationPrompt(e.target.value)}
                  className="min-h-[150px]"
                  rows={6}
                  placeholder="e.g., 'A post-apocalyptic world where nature has reclaimed cities.'"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleGenerateWithPrompt} disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
