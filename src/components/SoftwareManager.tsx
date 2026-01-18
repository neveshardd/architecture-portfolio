"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MediaLibrary } from "./MediaLibrary";

interface Software {
  id: number;
  name: string;
  category: string;
  icon?: string;
  description?: string;
  order: number;
}

export function SoftwareManager() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
  
  // Data States
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [softwareToDelete, setSoftwareToDelete] = useState<Software | null>(null);
  const [formData, setFormData] = useState<Partial<Software>>({
    category: "Design",
    order: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Query
  const { data: softwares = [], isLoading } = useQuery<Software[]>({
    queryKey: ['software'],
    queryFn: async () => {
      const { data } = await axios.get('/api/software');
      return data;
    }
  });

  // Mutations
  const saveSoftwareMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingSoftware) {
        await axios.put(`/api/software/${editingSoftware.id}`, payload);
      } else {
        await axios.post('/api/software', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      closeModal();
    },
    onError: () => setErrorModal({ isOpen: true, message: 'Failed to save software' })
  });

  const deleteSoftwareMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/software/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      closeModal();
    },
    onError: () => setErrorModal({ isOpen: true, message: 'Failed to delete software' })
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingSoftware(null);
    setFormData({ category: "Design", order: softwares.length });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sw: Software) => {
    setEditingSoftware(sw);
    setFormData({ ...sw });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (sw: Software) => {
    setSoftwareToDelete(sw);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    // Correctly reset states
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsMediaLibraryOpen(false);
    setErrorModal({ isOpen: false, message: "" });
    setEditingSoftware(null);
    setSoftwareToDelete(null);
  };

  const handleSave = () => {
    saveSoftwareMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (softwareToDelete) {
      deleteSoftwareMutation.mutate(softwareToDelete.id);
    }
  };

  return (
    <div className="w-full">
       {/* List Header */}
       <div className="flex justify-between items-end mb-8">
          <div>
              <h2 className="text-xl font-light uppercase tracking-widest mb-2">Software Skills</h2>
              <p className="text-xs text-gray-400 font-light uppercase tracking-wide">Manage your software stack</p>
          </div>
          <button 
              onClick={handleOpenCreate}
              className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-gray-800 transition-colors shadow-lg"
          >
              + Add Software
          </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
            <div className="col-span-full py-12 text-center text-xs text-gray-400 uppercase tracking-widest animate-pulse">Loading software...</div>
        ) : softwares.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-xs text-gray-400 uppercase tracking-widest">No software added yet</p>
            </div>
        ) : (
            softwares.map((sw) => (
                <div key={sw.id} className="bg-white p-4 border border-gray-100 flex items-center justify-between group hover:border-black transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center shrink-0">
                            {sw.icon ? (
                                <img src={sw.icon} alt={sw.name} className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" />
                            ) : (
                                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide">{sw.name}</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{sw.category}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(sw)} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black">✎</button>
                        <button onClick={() => handleOpenDelete(sw)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500">✕</button>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* PORTAL MODALS */}
      {mounted && (isModalOpen || isDeleteModalOpen || isMediaLibraryOpen || errorModal.isOpen) && createPortal(
         <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          {/* Error Modal */}
          {errorModal.isOpen && (
             <div className="bg-white p-8 w-full max-w-sm shadow-2xl border border-gray-100 flex flex-col gap-6 text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                        <span className="text-red-600 text-xl font-bold">!</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-black mb-1">Error</h3>
                        <p className="text-sm text-gray-500 font-light">{errorModal.message}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setErrorModal({ isOpen: false, message: "" })}
                    className="bg-black text-white text-xs font-bold uppercase tracking-widest w-full py-3 hover:bg-gray-800 transition-colors"
                >
                    Close
                </button>
             </div>
          )}

          {/* Delete Modal */}
          {isDeleteModalOpen && softwareToDelete && (
            <div className="bg-white p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Delete Software?</h3>
                    <p className="text-sm text-gray-500 font-light">
                        Are you sure you want to delete <span className="text-black font-medium">"{softwareToDelete.name}"</span>?
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
                        onClick={handleDelete}
                        className="py-3 text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        {deleteSoftwareMutation.isPending ? 'Deleting...' : 'Confirm'}
                    </button>
                </div>
            </div>
          )}

          {/* Media Library */}
          {isMediaLibraryOpen && (
             <div className="bg-white w-full max-w-4xl h-[80vh] shadow-2xl border border-gray-100 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold uppercase tracking-widest">Select Media</h3>
                    <button onClick={() => setIsMediaLibraryOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <MediaLibrary 
                        initialCategory="general"
                        onSelect={(url) => {
                            setFormData({...formData, icon: url});
                            setIsMediaLibraryOpen(false);
                        }} 
                    />
                </div>
             </div>
          )}

          {/* Edit/Create Modal */}
          {isModalOpen && (
            <div className="bg-white w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase tracking-widest">
                  {editingSoftware ? "Edit Software" : "New Software"}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-black">✕</button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                 <div className="space-y-6">
                    {/* Name */}
                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Software Name</label>
                        <input 
                            type="text" 
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                            placeholder="e.g. Photoshop"
                        />
                    </div>
                    {/* Category */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                        <select
                            value={formData.category || 'Design'}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50 appearance-none"
                        >
                            <option value="Design">Design</option>
                            <option value="Modeling">Modeling</option>
                            <option value="Rendering">Rendering</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    {/* Icon */}
                     <div className="flex flex-col gap-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex justify-between">
                            <span>Icon URL</span>
                            <button 
                                onClick={() => setIsMediaLibraryOpen(true)}
                                className="text-black hover:underline cursor-pointer"
                            >
                                + Select from Library
                            </button>
                        </label>
                        <div className="flex gap-4 items-center">
                            <input 
                                type="text" 
                                value={formData.icon || ''}
                                onChange={e => setFormData({...formData, icon: e.target.value})}
                                className="flex-1 border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                                placeholder="https://..."
                            />
                            <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                                {formData.icon ? (
                                    <img src={formData.icon} alt="Preview" className="w-8 h-8 object-contain" />
                                ) : (
                                    <span className="text-[10px] text-gray-300">NONE</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Order */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Order</label>
                         <input 
                            type="number" 
                            value={formData.order || 0}
                            onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                            className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50 w-24"
                        />
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
                  onClick={handleSave}
                  className="bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-gray-800 transition-colors shadow-lg"
                >
                  {saveSoftwareMutation.isPending ? 'Saving...' : (editingSoftware ? "Save Changes" : "Create Software")}
                </button>
              </div>
            </div> 
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
