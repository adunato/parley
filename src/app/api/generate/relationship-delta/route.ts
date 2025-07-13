import { NextResponse } from 'next/server';
import { generateRelationshipDeltaPrompt } from '@/lib/prompts/generatorPrompts';
import { Character, PlayerPersona, Relationship } from '@/lib/store';
import { Message } from '@ai-sdk/react';
import { generateJSON } from '@/lib/llm';

export async function POST(req: Request) {
    try {
        const { character, persona, chatHistory, latestExchange, currentRelationship } = await req.json();

        const prompt = generateRelationshipDeltaPrompt(
            character as Character,
            persona as PlayerPersona,
            chatHistory as Message[],
            latestExchange as { userMessage: string; characterResponse: string },
            currentRelationship as Relationship
        );

        const relationshipDelta = await generateJSON(prompt);

        return NextResponse.json({ relationshipDelta });
    } catch (error) {
        console.error('Error generating relationship delta:', error);
        return NextResponse.json({ error: 'Failed to generate relationship delta' }, { status: 500 });
    }
}
