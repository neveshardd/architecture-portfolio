import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { id: 'desc' } // Newest first
    });
    
    // Map 'thumbnail' from DB to 'image' for frontend
    const mappedProjects = projects.map(project => ({
      ...project,
      image: project.thumbnail
    }));
    
    return NextResponse.json(mappedProjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const project = await prisma.project.create({
      data: {
        title: data.title,
        location: data.location,
        year: data.year,
        thumbnail: data.image, // Mapping 'image' from frontend to 'thumbnail' in DB
        gallery: data.gallery || [],
        descriptionPt: data.descriptionPt,
        descriptionEn: data.descriptionEn,
      }
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
