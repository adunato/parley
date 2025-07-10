'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useParleyStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function WorldInfoPage() {
  const { worldDescription, setWorldDescription } = useParleyStore();
  const [description, setDescription] = useState(worldDescription);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setWorldDescription(description);
  }, [description, setWorldDescription]);

  const handleGenerateWorld = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worldDescription: description }),
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
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">World Information</h1>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="worldDescription" className="text-right">
            World Description
          </label>
          <Textarea
            id="worldDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="col-span-3"
            rows={10}
          />
        </div>
        <div className="col-span-4 flex justify-end">
          <Button onClick={handleGenerateWorld} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate World'}
          </Button>
        </div>
      </div>
    </div>
  );
}
