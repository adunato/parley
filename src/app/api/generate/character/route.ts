import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterPrompt } from '@/lib/generatorPrompts';
import { llm } from '@/lib/llm';
import { HumanMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    const { characterDescription } = await req.json();

    if (!characterDescription) {
      return NextResponse.json({ error: 'Character description is required' }, { status: 400 });
    }

    const prompt = generateCharacterPrompt(characterDescription);
    const result = await llm.generate([[new HumanMessage(prompt)]]);

    const responseContent = result.generations[0][0].text;
    const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("Could not parse JSON from LLM response.");
    }

    const parsedResult = JSON.parse(jsonMatch[1]);

    return NextResponse.json({ character: parsedResult });
  } catch (error) {
    console.error('Error generating character data:', error);
    return NextResponse.json({ error: 'Failed to generate character data' }, { status: 500 });
  }
}
