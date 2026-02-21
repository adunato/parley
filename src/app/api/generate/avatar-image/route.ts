import { NextRequest, NextResponse } from 'next/server';
import { getCharacterAvatarPoseWorkflow, getCharacterAvatarWorkflow } from '@/lib/imageWorkflowAdapter';
import { generateImage } from '@/lib/comfyui';

export async function POST(req: NextRequest) {
  try {
    const { imageDescription, overrides, comfyuiAddress } = await req.json();

    if (!imageDescription) {
      return NextResponse.json({ error: 'Image description is required' }, { status: 400 });
    }

    const imageData = await generateImage(imageDescription, overrides, comfyuiAddress);

    return NextResponse.json({ imageData }, { status: 200 });
  } catch (error) {
    console.error('Error generating avatar image:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate avatar image' }, { status: 500 });
  }
}