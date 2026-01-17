import { NextRequest, NextResponse } from 'next/server';
import { generateLifeEvents } from '@/lib/generator/lifeEventGenerator';
import { generateSpineEvents } from '@/lib/generator/spineEventGenerator';

export async function POST(req: NextRequest) {
  try {
    const { sourceEntity, count, existingEvents, userPrompt, type, phase } = await req.json();

    if (!count) {
      return NextResponse.json(
        { error: 'Missing required parameter: count' },
        { status: 400 }
      );
    }

    if (type && type !== 'LIFE_EVENT') {
        // Spine Node Generation
        const { events, newTags } = await generateSpineEvents(
            phase || 'Childhood',
            count,
            existingEvents || [], // Reusing this field name from UI for existing items
            userPrompt
        );
        return NextResponse.json({ events, newTags });
    }

    // Life Event Generation (Default)
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
      { error: 'Failed to generate events' },
      { status: 500 }
    );
  }
}
