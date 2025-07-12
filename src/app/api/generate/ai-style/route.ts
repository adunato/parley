import { generateAIStylePrompt } from '@/lib/prompts/generatorPrompts';
import { llm } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const { aiStyle } = await request.json();
    const prompt = generateAIStylePrompt(aiStyle || '');
    const result = await llm.invoke(prompt);
    const generatedStyle = result.content;
    return new Response(JSON.stringify({ aiStyle: generatedStyle }), { status: 200 });
  } catch (error) {
    console.error('Error generating AI style:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI style' }), { status: 500 });
  }
}