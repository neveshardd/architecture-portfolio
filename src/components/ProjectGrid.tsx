"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";



interface Project {
  id: number;
  title: string;
  location: string;
  year?: string;
  thumbnail: string; // DB field is thumbnail
  gallery: string[]; 
}

export function ProjectGrid() {
  const [open, setOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Fetch projects from API
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axios.get('/api/projects');
      return data;
    }
  });

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 md:px-8 lg:px-16 pb-32 max-w-screen-2xl mx-auto w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative w-full aspect-4/3 bg-gray-200 overflow-hidden animate-pulse rounded-sm">
             <div className="absolute inset-0 bg-linear-to-t from-gray-300/50 via-transparent to-transparent" />
             <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10 flex flex-col gap-2 w-full max-w-[70%]">
                <div className="h-4 md:h-3 lg:h-4 bg-gray-300 w-3/4 rounded-sm" />
                <div className="h-3 md:h-[9px] lg:h-[10px] bg-gray-200 w-1/2 rounded-sm" />
             </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 md:px-8 lg:px-16 pb-32 max-w-screen-2xl mx-auto">
        {projects.map((project) => (
            <div 
                key={project.id} 
                onClick={() => handleOpenProject(project)}
                className="relative group w-full aspect-4/3 bg-gray-100 overflow-hidden cursor-pointer block"
            >
            {/* Image with zoom effect */}
            {project.thumbnail && (
                <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
            )}
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Text Content - Always Bottom Left */}
            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10 flex flex-col gap-1 items-start">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm md:text-xs lg:text-sm font-sans drop-shadow-md">
                    {project.title}
                </h3>
                <p className="text-gray-200 text-[10px] md:text-[9px] lg:text-[10px] uppercase tracking-widest font-light drop-shadow-md">
                    {project.location} {project.year ? `— ${project.year}` : ''}
                </p>
            </div>
            </div>
        ))}
        </div>

        {/* Lightbox */}
        <Lightbox
            open={open}
            close={() => setOpen(false)}
            plugins={[Fullscreen, Counter, Thumbnails]}
            counter={{ container: { style: { top: -10, left: 16, bottom: "unset", right: "unset", height: 56, display: "flex", alignItems: "center" } } }}
            thumbnails={{ 
              position: "bottom",
              border: 2,
              padding: 0,
              gap: 16,
              imageFit: "cover"
            }}
            carousel={{ finite: true }}
            on={{ click: () => setOpen(false) }}
            slides={[
              ...(currentProject?.thumbnail ? [{ src: currentProject.thumbnail }] : []),
              ...(currentProject?.gallery.filter(src => src && src.trim() !== '').map(src => ({ src })) || [])
            ]}
        />
    </>
  );
}
