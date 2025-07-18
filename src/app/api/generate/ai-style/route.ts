import { generateAIStylePrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON, getLlm } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const { aiStyle, generationModel } = await request.json();
    const prompt = generateAIStylePrompt(aiStyle);
    const parsedResult = await generateJSON(prompt, generationModel);
    const generatedStyle = parsedResult.aiStyle;
    return new Response(JSON.stringify({ aiStyle: generatedStyle }), { status: 200 });
  } catch (error) {
    console.error('Error generating AI style:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI style' }), { status: 500 });
  }
}