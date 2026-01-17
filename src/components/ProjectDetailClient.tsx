"use client";

import { useState } from "react";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Example data - normally this would come from a CMS or API
const projectsData: Record<string, { 
  title: string; 
  location: string; 
  year: string;
  descriptionPt: string;
  descriptionPr: string; // Meaning English here based on previous file "Pr"? "En"? previous was "About"
  mainImage: string;
  gallery: string[];
}> = {
  "1": {
    title: "Kitchen Interior",
    location: "Lisboa, Portugal",
    year: "2024",
    descriptionPt: "Este projecto explora a relação entre a luz e a a matéria, criando espaços que respiram e evoluem com o passar do dia.",
    descriptionPr: "This project explores the relationship between light and matter, creating spaces that breathe and evolve throughout the day.",
    mainImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2670&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80&w=2671&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2669&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
    ]
  },
  "2": {
    title: "A CASA DO PÃO",
    location: "Porto, Portugal",
    year: "2023",
    descriptionPt: "Renovação completa de uma padaria histórica, mantendo a traça original e introduzindo elementos modernos.",
    descriptionPr: "Complete renovation of a historic bakery, keeping the original features while introducing modern elements.",
    mainImage: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2676&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2676&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2670&auto=format&fit=crop",
    ]
  },
  // Fallback for others
  "default": {
    title: "Project Detail",
    location: "Portugal",
    year: "2024",
    descriptionPt: "Descrição do projeto.",
    descriptionPr: "Project description.",
    mainImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80&w=2671&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2669&auto=format&fit=crop",
       "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2670&auto=format&fit=crop"
    ]
  }
};

export function ProjectDetailClient({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const project = projectsData[id] || projectsData["default"];
  // Update title if falling back to default but preserving the ID in title for debugging/visual
  if (!projectsData[id]) project.title = `Project ${id}`; 

  const slides = project.gallery.map(src => ({ src }));

  return (
    <div className="w-full max-w-[1200px] px-8 md:px-16 pb-24 mx-auto">
        {/* Project Header */}
        <div className="mb-16 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest text-black mb-4">{project.title}</h1>
            <p className="text-lg text-gray-400 font-light uppercase tracking-widest">{project.location} — {project.year}</p>
        </div>

        {/* Main Image */}
        <div 
          className="w-full aspect-video bg-gray-100 mb-16 overflow-hidden cursor-pointer group"
          onClick={() => { setIndex(0); setOpen(true); }}
        >
             <img 
                src={project.mainImage} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
        </div>

        {/* Project Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
            <div className="col-span-1 text-sm space-y-6 text-gray-500 font-light">
                <div>
                    <span className="block text-black font-bold uppercase tracking-widest text-xs mb-1">Client</span>
                    Private
                </div>
                <div>
                    <span className="block text-black font-bold uppercase tracking-widest text-xs mb-1">Area</span>
                    250 sqm
                </div>
                <div>
                    <span className="block text-black font-bold uppercase tracking-widest text-xs mb-1">Services</span>
                    Visualização 3D, Modelação
                </div>
            </div>
            <div className="col-span-2 text-base text-gray-700 font-light leading-relaxed text-justify">
                <p className="mb-6">
                    {project.descriptionPt}
                </p>
                <p className="text-gray-400">
                    {project.descriptionPr}
                </p>
            </div>
        </div>

        {/* Gallery Grid - Click to open lightbox */}
        <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-8 border-b border-gray-100 pb-4">Galeria Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.gallery.map((src, i) => (
                <div 
                    key={i} 
                    className="w-full aspect-4/3 bg-gray-50 overflow-hidden cursor-pointer relative group"
                    onClick={() => { setIndex(i); setOpen(true); }}
                >
                    <img 
                        src={src} 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 ease-out" 
                        alt={`Gallery image ${i + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
            ))}
        </div>

        {/* Back Link */}
        <div className="mt-24 text-center">
             <Link href="/" className="text-xs font-bold uppercase tracking-widest text-black hover:text-gray-500 transition-colors border-b border-black pb-1">Back to Projects</Link>
        </div>

        {/* Lightbox */}
        <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            slides={slides}
        />
    </div>
  );
}
