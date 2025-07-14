import { NextResponse } from 'next/server';
import { generateRelationshipDeltaPrompt } from '@/lib/prompts/generatorPrompts';
import { Character, PlayerPersona, Relationship } from '@/lib/store';
import { Message } from '@ai-sdk/react';
import { generateJSON } from '@/lib/llm';

export async function POST(req: Request) {
    try {
        const { character, persona, chatHistory, latestExchange } = await req.json();
        const currentRelationship = character.relationships.find((rel: any) => rel.personaAlias === persona.alias);

        const prompt = generateRelationshipDeltaPrompt(
            character as Character,
            persona as PlayerPersona,
            chatHistory as Message[],
            latestExchange as { userMessage: string; characterResponse: string },
            currentRelationship as Relationship
        );

        const relationshipDelta = await generateJSON(prompt);

        console.log('Generated relationship delta:', relationshipDelta);
        return NextResponse.json({ relationshipDelta });
    } catch (error) {
        console.error('Error in /api/generate/relationship-delta:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: `Failed to generate relationship delta: ${error.message}` }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'Failed to generate relationship delta: An unknown error occurred.' }, { status: 500 });
        }
    }
}
