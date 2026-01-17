"use client";

import { useState } from "react";
import Link from "next/link";
import { MediaLibrary } from "@/components/MediaLibrary";
import { SoftwareManager } from "@/components/SoftwareManager";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Project {
  id: number;
  title: string;
  location: string;
  year?: string;
  image?: string; // This maps to 'thumbnail' in DB
  gallery?: string[];
  descriptionPt?: string;
  descriptionEn?: string;
}

interface Profile {
    name: string;
    email: string;
    location: string;
    education: string;
    bioPt: string;
    bioEn: string;
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"projects" | "about" | "software">("projects");
  
  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Media Library Modal
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"thumbnail" | "gallery">("thumbnail");

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [profileData, setProfileData] = useState<Partial<Profile>>({});

  // --- QUERIES ---
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axios.get('/api/projects');
      return data;
    }
  });

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await axios.get('/api/profile');
      setProfileData(data); // Sync form data when fetched
      return data;
    }
  });

  // --- MUTATIONS ---
  const saveProjectMutation = useMutation({
    mutationFn: async (payload: any) => {
        const method = editingProject ? 'put' : 'post';
        const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
        await axios[method](url, payload);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        closeModal();
    },
    onError: () => alert('Failed to save project')
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
        await axios.delete(`/api/projects/${id}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        closeModal();
    },
    onError: () => alert('Failed to delete project')
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
        await axios.post('/api/profile', payload);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        alert('Profile updated!');
    },
    onError: () => alert('Failed to save profile')
  });

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({ gallery: [] }); 
    setIsProjectModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setIsProjectModalOpen(true);
  };

  const handleOpenDelete = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsProjectModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsMediaLibraryOpen(false);
    setEditingProject(null);
    setProjectToDelete(null);
  };

  const handleSaveProject = () => {
    const payload = {
        ...formData,
        gallery: Array.isArray(formData.gallery) ? formData.gallery : (formData.gallery as unknown as string || '').split('\n').filter(Boolean)
    };
    saveProjectMutation.mutate(payload);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
        deleteProjectMutation.mutate(projectToDelete.id);
    }
  };

  const handleSaveProfile = () => {
    saveProfileMutation.mutate(profileData);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTarget === 'thumbnail') {
        setFormData(prev => ({ ...prev, image: url }));
        setIsMediaLibraryOpen(false); 
    } else {
        const currentGallery = Array.isArray(formData.gallery) ? formData.gallery : [];
        setFormData(prev => ({ ...prev, gallery: [...currentGallery, url] }));
        setIsMediaLibraryOpen(false);
    }
  };

  const handleMultiMediaSelect = (urls: string[]) => {
    const currentGallery = Array.isArray(formData.gallery) ? formData.gallery : [];
    setFormData(prev => ({ ...prev, gallery: [...currentGallery, ...urls] }));
    setIsMediaLibraryOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-black relative">
      {/* Admin Header */}
      <header className="bg-white px-8 py-6 flex justify-center items-center sticky top-0 z-40">
        <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            <button 
                onClick={() => setActiveTab("projects")}
                className={`pb-1 border-b-2 transition-colors ${activeTab === "projects" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
                Projects
            </button>
            <button 
                onClick={() => setActiveTab("software")}
                className={`pb-1 border-b-2 transition-colors ${activeTab === "software" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
                Software
            </button>
            <button 
                onClick={() => setActiveTab("about")}
                className={`pb-1 border-b-2 transition-colors ${activeTab === "about" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
                About Info
            </button>
            <Link href="/" className="text-gray-400 hover:text-black border-b-2 border-transparent">
                Exit
            </Link>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full z-0">
        {activeTab === "projects" ? (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-light">Projects Manager</h1>
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-gray-800 transition-colors"
                    >
                        + New Project
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {projectsLoading ? (
                        <div className="text-center py-12 text-gray-400 font-light">Loading Projects...</div>
                    ) : (
                        <>
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white p-6 border border-gray-100 flex justify-between items-center group hover:border-gray-300 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-12 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {project.image ? (
                                            <img src={project.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-300 text-[10px] uppercase font-bold tracking-widest">IMG</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm uppercase tracking-wide">{project.title}</h3>
                                        <p className="text-xs text-gray-500 font-light">{project.location} — {project.year}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleOpenEdit(project)}
                                        className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleOpenDelete(project)}
                                        className="text-xs font-bold uppercase tracking-widest text-red-300 hover:text-red-600 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && (
                            <div className="text-center py-12 text-gray-400 font-light">
                                No projects found. Create one to get started.
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        ) : activeTab === "about" ? (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-light">About Information</h1>
                    <button 
                        onClick={handleSaveProfile}
                        disabled={saveProfileMutation.isPending}
                        className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="bg-white p-8 border border-gray-100 space-y-8">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                            <input 
                                type="text" 
                                value={profileData.name || ''} 
                                onChange={e => setProfileData({...profileData, name: e.target.value})}
                                className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Contact</label>
                            <input 
                                type="email" 
                                value={profileData.email || ''} 
                                onChange={e => setProfileData({...profileData, email: e.target.value})}
                                className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                            />
                        </div>
                         <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Location</label>
                            <input 
                                type="text" 
                                value={profileData.location || ''} 
                                onChange={e => setProfileData({...profileData, location: e.target.value})}
                                className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Education</label>
                            <input 
                                type="text" 
                                value={profileData.education || ''} 
                                onChange={e => setProfileData({...profileData, education: e.target.value})}
                                className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Bio (Português)</label>
                            <textarea 
                                className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50 h-32 leading-relaxed resize-none"
                                value={profileData.bioPt || ''} 
                                onChange={e => setProfileData({...profileData, bioPt: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Bio (English)</label>
                            <textarea 
                                className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50 h-32 leading-relaxed resize-none"
                                value={profileData.bioEn || ''} 
                                onChange={e => setProfileData({...profileData, bioEn: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        ) : activeTab === "software" ? (
            <SoftwareManager />
        ) : null}
      </main>

      {/* MODALS OVERLAY */}
      {(isProjectModalOpen || isDeleteModalOpen || isMediaLibraryOpen) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && projectToDelete && (
                <div className="bg-white p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                    <div className="text-center">
                        <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Delete Project?</h3>
                        <p className="text-sm text-gray-500 font-light">
                            Are you sure you want to delete <span className="text-black font-medium">"{projectToDelete.title}"</span>? This action cannot be undone.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={closeModal}
                            className="py-3 text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeleteProject}
                            className="py-3 text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                        >
                            {deleteProjectMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT PROJECT MODAL */}
            {isProjectModalOpen && (
                <div className="bg-white w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold uppercase tracking-widest">
                            {editingProject ? "Edit Project" : "New Project"}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-black">✕</button>
                    </div>
                    
                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Title</label>
                                    <input 
                                        type="text" 
                                        value={formData.title || ''}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                                        placeholder="e.g. Kitchen Interior"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Year</label>
                                    <input 
                                        type="text" 
                                        value={formData.year || ''}
                                        onChange={e => setFormData({...formData, year: e.target.value})}
                                        className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                                        placeholder="e.g. 2024"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Location</label>
                                <input 
                                    type="text" 
                                    value={formData.location || ''}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                                    placeholder="e.g. Lisboa, Portugal"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex justify-between">
                                    <span>Thumbnail Image</span>
                                    <button 
                                        onClick={() => { setMediaTarget('thumbnail'); setIsMediaLibraryOpen(true); }}
                                        className="text-black hover:underline"
                                    >
                                        + Select from Library
                                    </button>
                                </label>
                                <div className="flex gap-4 items-center">
                                    <input 
                                        type="text" 
                                        value={formData.image || ''}
                                        onChange={e => setFormData({...formData, image: e.target.value})}
                                        className="flex-1 border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                                        placeholder="https://..."
                                    />
                                    {formData.image && (
                                        <div className="w-12 h-12 bg-gray-100 shrink-0">
                                            <img src={formData.image} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex justify-between">
                                    <span>Gallery URLs</span>
                                    <button 
                                        onClick={() => { setMediaTarget('gallery'); setIsMediaLibraryOpen(true); }}
                                        className="text-black hover:underline"
                                    >
                                        + Add from Library
                                    </button>
                                </label>
                                <textarea 
                                    className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50 h-32 leading-relaxed resize-none font-mono"
                                    placeholder="https://..."
                                    value={Array.isArray(formData.gallery) ? formData.gallery.join('\n') : formData.gallery || ''}
                                    onChange={e => setFormData({...formData, gallery: e.target.value.split('\n') })}
                                />
                                <p className="text-[10px] text-gray-400">One URL per line</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
                        <button 
                            onClick={closeModal}
                            className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveProject}
                            className="bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            {saveProjectMutation.isPending ? 'Saving...' : (editingProject ? "Save Changes" : "Create Project")}
                        </button>
                    </div>
                </div>
            )}
            
            {/* MEDIA LIBRARY MODAL */}
            {isMediaLibraryOpen && (
                 <div className="bg-white w-full max-w-4xl h-[80vh] shadow-2xl border border-gray-100 flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold uppercase tracking-widest">Select Media</h3>
                        <button onClick={() => setIsMediaLibraryOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <MediaLibrary 
                          onSelect={handleMediaSelect} 
                          onMultiSelect={handleMultiMediaSelect}
                          multiSelect={mediaTarget === 'gallery'}
                          initialCategory={mediaTarget}
                          projectName={formData.title}
                        />
                    </div>
                 </div>
            )}

        </div>
      )}
    </div>
  );
}
