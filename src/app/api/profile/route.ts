import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let profile = await prisma.profile.findUnique({
      where: { id: 1 }
    });
    
    // Default mock data if no profile exists
    if (!profile) {
       return NextResponse.json({
         name: "José Eugênio",
         email: "soujoseeugenio@gmail.com",
         location: "Brasília, Distrito Federal",
         education: "Universidade Católica de Brasília",
         bioPt: "José Eugênio é estudante...",
         bioEn: "José Eugênio is an Architecture..."
       });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const profile = await prisma.profile.upsert({
      where: { id: 1 },
      update: {
        name: data.name,
        email: data.email,
        location: data.location,
        education: data.education,
        bioPt: data.bioPt,
        bioEn: data.bioEn,
      },
      create: {
        id: 1,
        name: data.name,
        email: data.email,
        location: data.location,
        education: data.education,
        bioPt: data.bioPt,
        bioEn: data.bioEn,
      }
    });
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
