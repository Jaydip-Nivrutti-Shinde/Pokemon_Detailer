export default function ShimmerCard() {
  return (
    <div className="bg-white p-5 rounded-xl shadow overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 opacity-60 animate-shimmer"></div>
      <div className="relative">
        <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="flex justify-between mt-6">
            <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
            <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -500px 0; }
          100% { background-position: 500px 0; }
        }
        .animate-shimmer {
          background-size: 1000px 100%;
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
