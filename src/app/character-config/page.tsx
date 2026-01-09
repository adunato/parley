'use client';

import CharacterConfiguration from '@/components/character-configuration';

export default function CharacterConfigPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="type-h2 mb-4">Character Configuration</h1>
      <CharacterConfiguration />
    </div>
  );
}
