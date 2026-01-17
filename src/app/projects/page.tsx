import { Header } from "@/components/Header";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Footer } from "@/components/Footer";

export default function Projects() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between items-center w-full">
      <Header />
      <ProjectGrid />
      <Footer />
    </main>
  );
}
