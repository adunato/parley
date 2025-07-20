import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  console.log('Image upload request received.');
  try {
    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      console.error('No file found in upload.');
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'avatars', filename);

    await writeFile(filePath, buffer);
    const fileUrl = `/avatars/${filename}`;
    console.log(`File uploaded: ${filename}, URL: ${fileUrl}`);

    return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });
  } catch (error) {
    console.error('Error during file upload:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
}