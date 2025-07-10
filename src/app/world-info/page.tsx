'use client';

import { Textarea } from '@/components/ui/textarea';
import { useParleyStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function WorldInfoPage() {
  const { worldDescription, setWorldDescription } = useParleyStore();
  const [description, setDescription] = useState(worldDescription);

  useEffect(() => {
    setWorldDescription(description);
  }, [description, setWorldDescription]);

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
      </div>
    </div>
  );
}
