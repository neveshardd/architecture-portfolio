import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectDetailClient } from "@/components/ProjectDetailClient";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between items-center w-full">
      <Header />
      <ProjectDetailClient id={id} />
      <Footer />
    </main>
  );
}
