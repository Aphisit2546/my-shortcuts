export default function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-[#5e5e5e] bg-[#111111] shadow-sm">
            {/* Image placeholder */}
            <div className="h-40 w-full bg-[#1a1a1a] animate-pulse" />

            {/* Content placeholder */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 w-3/4 rounded bg-[#5e5e5e]/30 animate-pulse" />
                {/* URL */}
                <div className="h-3 w-1/2 rounded bg-[#5e5e5e]/20 animate-pulse" />
            </div>
        </div>
    );
}