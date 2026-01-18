'use client';

import CharacterConfiguration from '@/components/character-configuration';
import { ConfigPage } from '@/components/layout/config-page';

export default function CharacterConfigPage() {
  return (
    <ConfigPage>
      <h1 className="type-h2 mb-4">Character Configuration</h1>
      <CharacterConfiguration />
    </ConfigPage>
  );
}
