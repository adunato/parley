import { generateAIStylePrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const { aiStyle } = await request.json();
    const prompt = generateAIStylePrompt(aiStyle);
    const parsedResult = await generateJSON(prompt);
    const generatedStyle = parsedResult.aiStyle;
    return new Response(JSON.stringify({ aiStyle: generatedStyle }), { status: 200 });
  } catch (error) {
    console.error('Error generating AI style:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI style' }), { status: 500 });
  }
}