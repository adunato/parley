import { generateAIStyle } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const { aiStyle } = await request.json();
    const generatedStyle = await generateAIStyle(aiStyle);
    return new Response(JSON.stringify({ aiStyle: generatedStyle }), { status: 200 });
  } catch (error) {
    console.error('Error generating AI style:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI style' }), { status: 500 });
  }
}