import Image from 'next/image';

export function RouteLoader() {
  return (
    <div className="min-h-[55vh] flex items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-[#2580eb]/20 to-[#14b8a6]/20 blur-xl animate-pulse-glow-premium" />
          <Image
            src="/logo.jpg"
            alt=""
            width={64}
            height={64}
            className="relative w-16 h-16 object-contain rounded-xl"
          />
        </div>
        <div className="w-40 h-1 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full animate-indeterminate"
            style={{ background: 'linear-gradient(90deg, #2580eb, #14b8a6)' }}
          />
        </div>
      </div>
    </div>
  );
}
