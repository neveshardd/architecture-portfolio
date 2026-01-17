"use client";

import { useState, useEffect } from "react";

interface Media {
  id: number;
  url: string;
  name: string;
  type: string;
  category: string;
  projectName?: string;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  onMultiSelect?: (urls: string[]) => void;
  multiSelect?: boolean;
  initialCategory?: string;
  projectName?: string;  // Filter by project name
}

export function MediaLibrary({ onSelect, onMultiSelect, multiSelect = false, initialCategory = "all", projectName }: MediaLibraryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory === "all" ? "thumbnail" : initialCategory);
  const [projectFilter, setProjectFilter] = useState<string>(projectName || "all");

  // Upload State - usa initialCategory para definir categoria padrão
  const defaultUploadCategory = initialCategory === "all" || initialCategory === "thumbnail" ? "thumbnail" : initialCategory;
  const [uploadCategory, setUploadCategory] = useState<string>(defaultUploadCategory);
  const [uploadProjectName, setUploadProjectName] = useState<string>(projectName || "");

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    
    const files = Array.from(e.target.files);
    setUploadProgress({ current: 0, total: files.length });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', uploadCategory);
      if (uploadProjectName) formData.append('projectName', uploadProjectName);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        console.error(e);
        failCount++;
      }
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    e.target.value = '';
    
    if (successCount > 0) {
      fetchMedia();
    }
    
    if (failCount > 0) {
      alert(`${successCount} uploaded, ${failCount} failed`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this image? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMedia();
      } else {
        alert('Delete failed');
      }
    } catch (e) {
      console.error(e);
      alert('Delete error');
    }
  };

  // Filter Logic
  const filteredMedia = media.filter(item => {
    const catMatch = selectedCategory === "all" || (item.category === selectedCategory);
    const projMatch = projectFilter === "all" || (item.projectName === projectFilter);
    return catMatch && projMatch;
  });

  // Get unique projects
  const projects = Array.from(new Set(media.map(m => m.projectName).filter(Boolean))) as string[];

  return (
    <div className="flex flex-col h-full bg-white font-sans text-black">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-50/50">
            <div className="flex gap-4 items-center">
                <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase font-bold tracking-widest text-gray-400">Category</label>
                    <select 
                        value={selectedCategory} 
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="bg-white border border-gray-200 text-xs px-2 py-1 focus:outline-none focus:border-black"
                    >
                        <option value="all">All Categories</option>
                        <option value="thumbnail">Thumbnails</option>
                        <option value="gallery">Gallery</option>
                        <option value="general">General</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase font-bold tracking-widest text-gray-400">Project Filter</label>
                    <select 
                        value={projectFilter} 
                        onChange={e => setProjectFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-xs px-2 py-1 focus:outline-none focus:border-black min-w-[120px]"
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex gap-4 items-end border-l border-gray-200 pl-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase font-bold tracking-widest text-gray-400">Upload to:</label>
                    <div className="flex gap-2">
                        <select 
                            value={uploadCategory} 
                            onChange={e => setUploadCategory(e.target.value)}
                            className="bg-white border border-gray-200 text-xs px-2 py-1 focus:outline-none focus:border-black"
                        >
                            <option value="thumbnail">Thumbnail</option>
                            <option value="gallery">Gallery</option>
                            <option value="general">General</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder="Project Name (Optional)" 
                            value={uploadProjectName}
                            onChange={e => setUploadProjectName(e.target.value)}
                            className="bg-white border border-gray-200 text-xs px-2 py-1 focus:outline-none focus:border-black w-32"
                        />
                    </div>
                </div>
                <label className={`cursor-pointer bg-black text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2 hover:bg-gray-800 transition-colors h-[26px] flex items-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : '+ Upload'}
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleUpload} disabled={uploading} />
                </label>
            </div>
        </div>
        
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loading ? (
                <div className="text-center py-10 text-gray-400 text-xs uppercase tracking-widest">Loading media...</div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs uppercase tracking-widest">
                    No images found for this category/project.
                </div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {filteredMedia.map((item) => {
                        const isSelected = selectedUrls.has(item.url);
                        return (
                            <div 
                                key={item.id} 
                                className={`aspect-square bg-gray-50 relative group cursor-pointer border-2 transition-all overflow-hidden ${
                                    isSelected ? 'border-black ring-2 ring-black/20' : 'border-gray-100 hover:border-black'
                                }`}
                                onClick={() => {
                                    if (multiSelect) {
                                        setSelectedUrls(prev => {
                                            const next = new Set(prev);
                                            if (next.has(item.url)) {
                                                next.delete(item.url);
                                            } else {
                                                next.add(item.url);
                                            }
                                            return next;
                                        });
                                    } else if (onSelect) {
                                        onSelect(item.url);
                                    }
                                }}
                            >
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.projectName || item.category}
                                </div>
                                
                                {/* Multi-select checkbox */}
                                {multiSelect && (
                                    <div className={`absolute top-2 right-2 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-black border-black text-white' : 'bg-white/80 border-gray-400'
                                    }`}>
                                        {isSelected && '✓'}
                                    </div>
                                )}
                                
                                {/* Single select indicator */}
                                {!multiSelect && onSelect && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black text-white text-[8px] px-2 py-1 uppercase font-bold tracking-widest">
                                        Select
                                    </div>
                                )}
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id);
                                    }}
                                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white text-[8px] px-2 py-1 uppercase font-bold tracking-widest transition-colors"
                                    title="Delete image"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        
        {/* Multi-select confirm button */}
        {multiSelect && selectedUrls.size > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <span className="text-xs text-gray-500">{selectedUrls.size} selected</span>
                <button
                    onClick={() => {
                        if (onMultiSelect) {
                            onMultiSelect(Array.from(selectedUrls));
                            setSelectedUrls(new Set());
                        }
                    }}
                    className="bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                    Add Selected
                </button>
            </div>
        )}
    </div>
  );
}

