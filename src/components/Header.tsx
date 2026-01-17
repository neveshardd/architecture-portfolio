import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white w-full">
      <div className="flex justify-between items-center py-3 md:py-4 px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
        <Link href="/" className="shrink-0">
          <img 
            src="/logo.png" 
            alt="José Eugênio Portfolio" 
            className="h-12 md:h-12 lg:h-12 w-auto object-contain"
          />
        </Link>
        
        <nav className="flex gap-3 md:gap-6 lg:gap-8 text-xs md:text-sm text-gray-500 font-medium">
          <Link href="/" className="group whitespace-nowrap">
            <span className="text-black font-semibold group-hover:opacity-70 transition-opacity">Projetos</span>
            <span className="text-gray-400 font-light hidden sm:inline"> Projects</span>
          </Link>
          <Link href="/about" className="group whitespace-nowrap">
            <span className="text-black font-semibold group-hover:opacity-70 transition-opacity">Sobre</span>
            <span className="text-gray-400 font-light hidden sm:inline"> About</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
