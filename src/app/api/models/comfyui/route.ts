
import { NextResponse } from 'next/server';
import { getAvailableModels } from '@/lib/comfyui';

export async function GET() {
    const models = await getAvailableModels();
    // Map strings to Model interface structure for consistency if needed, 
    // but for now sending raw strings or mapped objects is fine.
    // The frontend expects a list of models to populate the dropdown.
    // Let's return the list of strings and handle mapping in frontend or return objects.
    // The plan said "expose models to frontend". The existing /api/models returns objects.
    // Let's just return the list of strings here, it's specific for this dropdown.
    return NextResponse.json({ models });
}
