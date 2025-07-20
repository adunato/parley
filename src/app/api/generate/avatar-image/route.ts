import { NextRequest, NextResponse } from 'next/server';
import { getCharacterAvatarWorkflow } from '@/lib/imageWorkflowAdapter';
import { generateImage } from '@/lib/comfyui';

export async function POST(req: NextRequest) {
  try {
    const { imageDescription } = await req.json();

    if (!imageDescription) {
      return NextResponse.json({ error: 'Image description is required' }, { status: 400 });
    }

    const workflow = getCharacterAvatarWorkflow(imageDescription);
    const imageData = await generateImage(workflow);

    return NextResponse.json({ imageData }, { status: 200 });
  } catch (error) {
    console.error('Error generating avatar image:', error);
    return NextResponse.json({ error: 'Failed to generate avatar image' }, { status: 500 });
  }
}