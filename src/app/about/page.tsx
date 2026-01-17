"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { AboutSkeleton } from "@/components/AboutSkeleton";

// Using simple-icons CDN for consistency where possible, and other sources for specific ones
interface Software {
  id: number;
  name: string;
  icon?: string;
}

export default function About() {
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await axios.get('/api/profile');
      return data;
    }
  });

  const { data: softwareList = [], isLoading: isSoftwareLoading } = useQuery<Software[]>({
    queryKey: ['software'],
    queryFn: async () => {
      const { data } = await axios.get('/api/software');
      return data;
    }
  });

  if (isProfileLoading || isSoftwareLoading) {
    return (
      <main className="min-h-screen bg-white flex flex-col justify-between items-center w-full">
        <Header />
        <AboutSkeleton />
        <Footer />
      </main>
    );
  }

  // Fallbacks if no data
  const location = profile?.location || "Brasília, Brasil";
  const email = profile?.email || "soujoseeugenio@gmail.com";
  const education = profile?.education || "Universidade Católica de Brasília\nCursando Bacharelado\n2023";
  const bioPt = profile?.bioPt || "Bio não disponível.";
  const bioEn = profile?.bioEn || "Bio not available.";

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between items-center w-full">
      <Header />
      
      <div className="flex-1 w-full max-w-[1800px] px-16 flex flex-col md:flex-row gap-16 pb-16">
        {/* Left Column - Contact Info */}
        <div className="w-full md:w-1/3 pt-12">
           <div className="mb-12">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6">Contatos Contacts</h2>
            <div className="space-y-1 text-sm text-gray-600 font-light">
              <p>{location}</p>
              <br />
              <p><a href={`mailto:${email}`} className="hover:text-black">{email}</a></p>
            </div>
           </div>

           <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6">Educação Education</h2>
            <div className="space-y-4 text-sm text-gray-600 font-light whitespace-pre-line">
              <p>{education}</p>
            </div>
           </div>
        </div>

        {/* Right Column - Bio & Skills */}
        <div className="w-full md:w-2/3 flex flex-col gap-16 pt-12">
            
            <div className="w-full text-2xl md:text-3xl font-light text-black leading-tight">
                <p className="mb-8 whitespace-pre-line">
                    {bioPt}
                </p>
                <p className="text-gray-400 whitespace-pre-line">
                    {bioEn}
                </p>
            </div>

            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-8 border-t border-gray-100 pt-8">Software Skills</h2>
                {softwareList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-light">Skills info updating...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8">
                        {softwareList.map((sw) => (
                            <div key={sw.id} className="flex flex-col items-center justify-center gap-4 group cursor-default p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="w-16 h-16 relative flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100 scale-90 group-hover:scale-100">
                                {sw.icon ? (
                                    <img 
                                    src={sw.icon} 
                                    alt={sw.name} 
                                    className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-300">NO ICON</span>
                                )}
                                </div>
                                <span className="text-xs text-gray-500 font-light text-center uppercase tracking-wide group-hover:text-black transition-colors">{sw.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
