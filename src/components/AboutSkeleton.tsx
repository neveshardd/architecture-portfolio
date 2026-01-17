export function AboutSkeleton() {
  return (
    <div className="flex-1 w-full max-w-[1800px] px-16 flex flex-col md:flex-row gap-16 pb-16 animate-pulse">
      {/* Left Column - Contact Info */}
      <div className="w-full md:w-1/3 pt-12">
        <div className="mb-12">
          {/* Title Placeholder */}
          <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
          
          {/* Contact Content Placeholders */}
          <div className="space-y-4">
            <div className="h-3 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>

        <div>
          {/* Education Title Placeholder */}
          <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
          
          {/* Education Content Placeholders */}
          <div className="space-y-2">
            <div className="h-3 w-full max-w-[200px] bg-gray-100 rounded" />
            <div className="h-3 w-full max-w-[150px] bg-gray-100 rounded" />
            <div className="h-3 w-full max-w-[100px] bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* Right Column - Bio & Skills */}
      <div className="w-full md:w-2/3 flex flex-col gap-16 pt-12">
        
        {/* Bio Section */}
        <div className="w-full flex flex-col gap-8">
          {/* Bio PT */}
          <div className="space-y-3">
            <div className="h-6 w-full bg-gray-200 rounded" />
            <div className="h-6 w-full bg-gray-200 rounded" />
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
          </div>
          
          {/* Bio EN */}
          <div className="space-y-3">
            <div className="h-6 w-full bg-gray-100 rounded" />
            <div className="h-6 w-full bg-gray-100 rounded" />
            <div className="h-6 w-3/4 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Software Skills */}
        <div>
          <div className="h-4 w-40 bg-gray-200 rounded mb-8 border-t border-gray-100 pt-8" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-4 p-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
