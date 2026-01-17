"use client";

import { useState } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [softwareToDelete, setSoftwareToDelete] = useState<Software | null>(null);
  const [formData, setFormData] = useState<Partial<Software>>({});
  
  // Media Library State
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  // Fetch software
  const { data: software = [], isLoading } = useQuery<Software[]>({
    queryKey: ['software'],
    queryFn: async () => {
      const { data } = await axios.get('/api/software');
      return data;
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const method = editingSoftware ? 'put' : 'post';
      const url = editingSoftware ? `/api/software/${editingSoftware.id}` : '/api/software';
      await axios[method](url, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      closeModal();
    },
    onError: () => alert('Failed to save software')
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/software/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      closeModal();
    },
    onError: () => alert('Failed to delete software')
  });

  const handleOpenCreate = () => {
    setEditingSoftware(null);
    setFormData({ order: software.length });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Software) => {
    setEditingSoftware(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item: Software) => {
    setSoftwareToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsMediaLibraryOpen(false);
    setEditingSoftware(null);
    setSoftwareToDelete(null);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (softwareToDelete) {
      deleteMutation.mutate(softwareToDelete.id);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-light">Software Manager</h1>
          <button 
            onClick={handleOpenCreate}
            className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            + New Software
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 font-light">Loading Software...</div>
          ) : (
            <>
              {software.map((item) => (
                <div key={item.id} className="bg-white p-6 border border-gray-100 flex justify-between items-center group hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                      {item.icon ? (
                        <img src={item.icon} className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all" alt={item.name} />
                      ) : (
                        <span className="text-gray-300 text-[8px] uppercase font-bold tracking-widest">NO ICON</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 font-light uppercase tracking-wider">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(item)}
                      className="text-xs font-bold uppercase tracking-widest text-red-300 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {software.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-light">
                  No software found. Click "+ New Software" to add your skills.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {(isModalOpen || isDeleteModalOpen || isMediaLibraryOpen) && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          {/* Delete Modal */}
          {isDeleteModalOpen && softwareToDelete && (
            <div className="bg-white p-8 w-full max-w-md shadow-2xl flex flex-col gap-6" onClick={e => e.stopPropagation()}>
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
                  className="py-3 text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}

          {/* Media Library Modal - Higher Z-Index Context */}
          {isMediaLibraryOpen && (
             <div className="bg-white w-full max-w-6xl h-[85vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Select Icon</h3>
                    <button onClick={() => setIsMediaLibraryOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                </div>
                <div className="flex-1 overflow-hidden">
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

          {/* Create/Edit Modal */}
          {isModalOpen && !isMediaLibraryOpen && (
            <div className="bg-white w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase tracking-widest">
                  {editingSoftware ? "Edit Software" : "New Software"}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-black">✕</button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name</label>
                      <input 
                        type="text" 
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                        placeholder="e.g. Photoshop"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                      <input 
                        type="text" 
                        value={formData.category || ''}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50"
                        placeholder="e.g. Design"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Icon</label>
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-200 flex items-center justify-center">
                            {formData.icon ? (
                                <img src={formData.icon} alt="Preview" className="w-10 h-10 object-contain" />
                            ) : (
                                <span className="text-[8px] text-gray-300 font-bold uppercase">None</span>
                            )}
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                value={formData.icon || ''}
                                onChange={e => setFormData({...formData, icon: e.target.value})}
                                className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50 flex-1"
                                placeholder="https://..."
                            />
                            <button 
                                type="button"
                                onClick={() => setIsMediaLibraryOpen(true)}
                                className="bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-widest px-4 transition-colors"
                            >
                                Select
                            </button>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description (Optional)</label>
                    <textarea 
                      className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-gray-50/50 h-24 resize-none"
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description..."
                    />
                  </div>

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
                  {saveMutation.isPending ? 'Saving...' : (editingSoftware ? "Save Changes" : "Create Software")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
