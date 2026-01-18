import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma"; // We need to ensure lib/prisma exists or create it

import { isAuthenticated } from '@/lib/auth';

export async function POST(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Validate File Size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, message: 'File too large (Max 5MB)' }, { status: 400 });
    }

    // Validate Mime Type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        return NextResponse.json({ success: false, message: 'Invalid file type. Only images allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to Base64 Data URL for DB storage (Vercel compatible)
    const base64Data = buffer.toString('base64');
    const publicUrl = `data:${file.type};base64,${base64Data}`;

    const category = data.get('category') as string || 'general';
    const projectName = data.get('projectName') as string || null;

    // Save to DB (FileSystem write removed for Vercel compatibility)
    const media = await prisma.media.create({
        data: {
            name: file.name,
            url: publicUrl,
            type: file.type,
            category,
            projectName
        }
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
