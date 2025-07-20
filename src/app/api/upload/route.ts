import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';



export async function POST(req: Request): Promise<Response> {
  const form = new IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public', 'avatars');
  form.keepExtensions = true;

  return new Promise<Response>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) {
        reject(new Response(JSON.stringify({ error: 'Upload error' }), { status: 500 }));
        return;
      }

      const file = files.avatar?.[0] ?? files.avatar;
      if (!file) {
        reject(new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 }));
        return;
      }

      const filename = path.basename(file.filepath);

      resolve(
        new Response(JSON.stringify({ url: `/avatars/${filename}` }), {
          status: 200,
        })
      );
    });
  });
}
