'use client';

import PersonaConfiguration from '@/components/persona-configuration';
import { ConfigPage } from '@/components/layout/config-page';

export default function PersonaConfigPage() {
  return (
    <ConfigPage>
      <h1 className="type-h2 mb-4">Player Persona Configuration</h1>
      <PersonaConfiguration />
    </ConfigPage>
  );
}
