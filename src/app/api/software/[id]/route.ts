import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const data = await req.json();
    
    const software = await prisma.software.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon,
        description: data.description,
        order: data.order,
      }
    });
    return NextResponse.json(software);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update software' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.software.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete software' }, { status: 500 });
  }
}
