import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching models: ${response.statusText}`);
    }

    const data = await response.json();
    // Filter and format the models as needed
    const models = data.data.map((model: any) => ({
      id: model.id,
      name: model.name,
      provider: model.context_window, // This is a placeholder, OpenRouter API doesn't directly provide a 'provider' field in the same way.
    }));

    return NextResponse.json(models);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
