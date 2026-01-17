export function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 md:px-8 lg:px-16 pb-32 max-w-screen-2xl mx-auto">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="relative w-full aspect-4/3 bg-gray-800 overflow-hidden animate-pulse"
        >
          {/* Gradient Overlay Placeholder */}
          <div className="absolute inset-0 bg-linear-to-t from-gray-300/50 via-transparent to-transparent" />

          {/* Text Content Placeholders */}
          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10 flex flex-col gap-2 w-full max-w-[70%]">
            {/* Title Placeholder */}
            <div className="h-4 md:h-3 lg:h-4 bg-gray-400 w-3/4 rounded-sm" />
            
            {/* Subtitle Placeholder */}
            <div className="h-3 md:h-[9px] lg:h-[10px] bg-gray-300 w-1/2 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
