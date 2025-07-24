import { NextResponse } from 'next/server';
import { generateRelationshipDeltaPrompt } from '@/lib/prompts/generatorPrompts';
import { Character, Persona, Relationship } from '@/lib/types';
import { Message } from '@ai-sdk/react';
import { generateJSON, getLlm } from '@/lib/llm';

export async function POST(req: Request) {
    try {
        const { character, persona, chatHistory, latestExchange, worldDescription, aiStyle, generationModel } = await req.json();
        const currentRelationship = character.relationships.find((rel: any) => rel.personaId === persona.id);

        const prompt = generateRelationshipDeltaPrompt(
            character as Character,
            persona as Persona,
            chatHistory as Message[],
            latestExchange as { userMessage: string; characterResponse: string },
            currentRelationship as Relationship,
            worldDescription as string,
            aiStyle as string
        );

        const relationshipDelta = await generateJSON(prompt, generationModel);

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
