'use client';

import PersonaConfiguration from '@/components/persona-configuration';

export default function PersonaConfigPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Player Persona Configuration</h1>
      <PersonaConfiguration />
    </div>
  );
}
