'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useParleyStore } from '@/lib/store';
import { useEntityStore } from '@/lib/entityStore';
import { useEffect, useState } from 'react';
import { Sparkles, Type, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WorldInfoPage() {
  const { worldDescription, setWorldDescription, aiStyle, setAiStyle, clearAllData: clearParleyData } = useParleyStore();
  const { clearAllData: clearEntityData } = useEntityStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isWorldPromptDialogOpen, setIsWorldPromptDialogOpen] = useState(false);
  const [isAiStylePromptDialogOpen, setIsAiStylePromptDialogOpen] = useState(false);
  const [worldDialogPrompt, setWorldDialogPrompt] = useState(''); // New state for the world description dialog's prompt
  const [aiStyleDialogPrompt, setAiStyleDialogPrompt] = useState(''); // New state for the AI style dialog's prompt
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);

  const generateWorld = async (prompt?: string) => {
    setIsLoading(true);
    try {
      const body: { worldDescription?: string; aiStyle?: string } = {};
      if (prompt !== undefined && prompt !== '') {
        body.worldDescription = prompt;
      }
      body.aiStyle = aiStyle;
      const response = await fetch('/api/generate/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        setWorldDescription(data.world);
      } else {
        console.error('Failed to generate world:', data.error);
        alert('Error generating world: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating world:', error);
      alert('An unexpected error occurred while generating the world.');
    } finally {
      setIsLoading(false);
      setIsWorldPromptDialogOpen(false); // Close dialog after generation
      setWorldDialogPrompt(''); // Clear dialog prompt after generation
    }
  };

  const handleGenerateWorld = async () => {
    generateWorld('');
  };

  const handleGenerateWorldWithPrompt = async () => {
    generateWorld(worldDialogPrompt);
  };

  const generateAIStyle = async (prompt?: string) => {
    setIsLoading(true);
    try {
      const body: { aiStyle?: string } = {};
      if (prompt !== undefined && prompt !== '') {
        body.aiStyle = prompt;
      }
      const response = await fetch('/api/generate/ai-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        setAiStyle(data.aiStyle);
      } else {
        console.error('Failed to generate AI style:', data.error);
        alert('Error generating AI style: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating AI style:', error);
      alert('An unexpected error occurred while generating the AI style.');
    } finally {
      setIsLoading(false);
      setIsAiStylePromptDialogOpen(false); // Close dialog after generation
      setAiStyleDialogPrompt(''); // Clear dialog prompt after generation
    }
  };

  const handleGenerateAIStyle = async () => {
    generateAIStyle('');
  };

  const handleGenerateAIStyleWithPrompt = async () => {
    generateAIStyle(aiStyleDialogPrompt);
  };

  const handleClearAllData = () => {
    clearParleyData();
    clearEntityData();
    setIsClearDataDialogOpen(false);
  };

  return (
        <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">World Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <div className="flex items-center gap-2 md:col-span-1 md:justify-end">
                <label htmlFor="worldDescription" className="font-medium">
                  World Description
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate World (no prompt)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <Dialog open={isWorldPromptDialogOpen} onOpenChange={setIsWorldPromptDialogOpen}>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Type className="h-4 w-4" />
                            <span className="sr-only">Generate with Prompt</span>
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate World with Custom Prompt</p>
                      </TooltipContent>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Generate World with Custom Prompt</DialogTitle>
                          <DialogDescription>
                            Enter your desired prompt for world creation here.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Textarea
                            id="worldCustomPrompt"
                            value={worldDialogPrompt}
                            onChange={(e) => setWorldDialogPrompt(e.target.value)}
                            className="min-h-[150px]"
                            rows={6}
                            placeholder="e.g., 'A post-apocalyptic world where nature has reclaimed cities.'"
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleGenerateWorldWithPrompt} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="worldDescription"
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                className="col-span-3 min-h-[200px]"
                rows={10}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
              <div className="flex items-center gap-2 md:col-span-1 md:justify-end">
                <label htmlFor="aiStyle" className="font-medium">
                  AI Style
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleGenerateAIStyle}
                        disabled={isLoading}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="sr-only">Generate AI Style</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate AI Style (no prompt)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <Dialog open={isAiStylePromptDialogOpen} onOpenChange={setIsAiStylePromptDialogOpen}>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Type className="h-4 w-4" />
                            <span className="sr-only">Generate with Prompt</span>
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate AI Style with Custom Prompt</p>
                      </TooltipContent>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Generate AI Style with Custom Prompt</DialogTitle>
                          <DialogDescription>
                            Enter your desired prompt for AI style creation here.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Textarea
                            id="aiStyleCustomPrompt"
                            value={aiStyleDialogPrompt}
                            onChange={(e) => setAiStyleDialogPrompt(e.target.value)}
                            className="min-h-[150px]"
                            rows={6}
                            placeholder="e.g., 'A formal and verbose style, like a Victorian novel.'"
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleGenerateAIStyleWithPrompt} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="aiStyle"
                value={aiStyle}
                onChange={(e) => setAiStyle(e.target.value)}
                className="col-span-3 min-h-[200px]"
                rows={10}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Dialog open={isClearDataDialogOpen} onOpenChange={setIsClearDataDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all your data from the application.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsClearDataDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleClearAllData}>
                  Yes, delete everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
