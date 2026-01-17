import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-16 text-center text-[10px] text-gray-600 uppercase tracking-wider font-medium flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 relative group">
        <span>Brasília, Distrito Federal</span>
        <span>Email: <a href="mailto:soujoseeugenio@gmail.com" className="hover:text-black transition-colors">soujoseeugenio@gmail.com</a></span>
        
        {/* Secret Admin Link */}
        <Link 
          href="/admin" 
          className="absolute bottom-4 right-4 text-[5px] text-gray-600 cursor-pointer hover:text-gray-300 transition-colors"
          aria-hidden="true"
        >
          Admin
        </Link>
    </footer>
  );
}
