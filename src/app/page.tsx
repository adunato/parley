"use client";

import { useState } from 'react';
import { CharacterSelectionDialog } from '@/components/character-selection-dialog';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEntityStore } from '@/lib/entityStore';
import { useGameStore } from '@/lib/store/gameStore';
import { useParleyStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

import { LoadingScreen } from '@/components/ui/loading-screen';

export default function MainMenu() {
  const router = useRouter();
  const { characters, locations, characterGroups, _hasHydrated: isEntityHydrated } = useEntityStore();
  const { startGame, isGameActive, _hasHydrated: isGameHydrated } = useGameStore();
  const { setAppState } = useParleyStore();

  /* State for Character Selection */
  const [isCharacterSelectionOpen, setIsCharacterSelectionOpen] = useState(false);

  if (!isEntityHydrated || !isGameHydrated) {
    return <LoadingScreen />;
  }

  const handleNewGame = () => {
    setIsCharacterSelectionOpen(true);
  };

  const handleCharacterSelected = (character: any) => {
    // Start the game with the specific character
    startGame({
      characters,
      locations,
      characterGroups
    }, character.id);

    setAppState('game');
    router.push('/world_map');
  };

  const handleContinue = () => {
    setAppState('game');
    router.push('/world_map');
  };

  const handleConfiguration = () => {
    setAppState('configuration');
    // No need to push, Link handles it? No, button does.
    // Wait, the original button used Link. We should intercept or just use onClick handler + router.push for consistency
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-md text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter font-display text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground uppercase">
            PARLEY
          </h1>
          <p className="text-sm text-muted-foreground font-sans tracking-[0.2em] uppercase font-bold">
            Interactive Fiction Engine
          </p>
        </div>

        <div className="flex flex-col gap-4 w-64 mx-auto">
          {/* Main Menu Buttons */}
          <Button
            className="w-full h-14 text-sm font-display uppercase tracking-widest font-bold bg-secondary/50 hover:bg-secondary border border-border hover:border-foreground/20 transition-all rounded-sm text-foreground"
            onClick={handleNewGame}
          >
            New Game
          </Button>

          <Button
            className={cn(
              "w-full h-14 text-sm font-display uppercase tracking-widest font-bold bg-secondary/50 hover:bg-secondary border border-border hover:border-foreground/20 transition-all rounded-sm text-foreground",
              !isGameActive && "opacity-50 cursor-not-allowed"
            )}
            disabled={!isGameActive}
            onClick={handleContinue}
          >
            Continue
          </Button>

          <Button
            className="w-full h-14 text-sm font-display uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 border-0 transition-all rounded-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            onClick={() => {
              setAppState('configuration');
              router.push('/character-config');
            }}
          >
            Configuration
          </Button>
        </div>

        <div className="pt-12 text-xs text-gray-600 font-mono">
          v0.1.0 • Pre-Alpha Build
        </div>
      </div>

      <CharacterSelectionDialog
        open={isCharacterSelectionOpen}
        onOpenChange={setIsCharacterSelectionOpen}
        characters={characters}
        onSelect={handleCharacterSelected}
      />
    </div>
  );
}
