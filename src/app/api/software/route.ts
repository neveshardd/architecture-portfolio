import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const software = await prisma.software.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(software);
  } catch (error) {
    console.error('Error fetching software:', error);
    return NextResponse.json({ error: 'Failed to fetch software', details: String(error) }, { status: 500 });
  }
}

import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const software = await prisma.software.create({
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon,
        description: data.description,
        order: data.order || 0,
      }
    });
    return NextResponse.json(software);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create software' }, { status: 500 });
  }
}
