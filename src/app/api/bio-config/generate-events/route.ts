import { NextRequest, NextResponse } from 'next/server';
import { generateLifeEvents } from '@/lib/generator/lifeEventGenerator';

export async function POST(req: NextRequest) {
  try {
    const { sourceEntity, count, existingEvents, userPrompt } = await req.json();

    if (!sourceEntity || !count) {
      return NextResponse.json(
        { error: 'Missing required parameters: sourceEntity and count' },
        { status: 400 }
      );
    }

    const { lifeEvents, newTags } = await generateLifeEvents(
      sourceEntity,
      count,
      existingEvents || [],
      userPrompt
    );

    return NextResponse.json({ events: lifeEvents, newTags });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate life events' },
      { status: 500 }
    );
  }
}
