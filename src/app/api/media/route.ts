import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAuthenticated } from '@/lib/auth';

// List Media
export async function GET() {
  try {
    const media = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// Save Media Metadata (from Supabase upload)
export async function POST(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, url, type, category, projectName } = body;

    const media = await prisma.media.create({
        data: { name, url, type, category, projectName }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Save Media Error:', error);
    return NextResponse.json({ error: 'Failed to save media' }, { status: 500 });
  }
}

// Delete Media
export async function DELETE(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
    }

    // Get media info before deleting
    const media = await prisma.media.findUnique({
      where: { id: parseInt(id) }
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: parseInt(id) }
    });

    // Delete from Filesystem (Legacy / Local)
    if (!media.url.startsWith('data:') && !media.url.startsWith('http')) {
      try {
        const filepath = join(process.cwd(), 'public', media.url);
        await unlink(filepath);
      } catch (fileError) {
        // ignore
      }
    }
    
    // Delete from Supabase (New)
    if (media.url.includes('supabase.co')) {
        try {
            const urlObj = new URL(media.url);
            const pathParts = urlObj.pathname.split('/');
            // format: /storage/v1/object/public/[bucket]/[path]
            const publicIndex = pathParts.indexOf('public');
            if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
                const bucket = pathParts[publicIndex + 1];
                const path = pathParts.slice(publicIndex + 2).join('/');
                await supabaseAdmin.storage.from(bucket).remove([path]);
            }
        } catch (e) {
            console.error('Supabase delete error:', e);
        }
    }

    return NextResponse.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
