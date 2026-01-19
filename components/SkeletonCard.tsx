export default function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-[#47817f]/20 bg-white shadow-sm">
            {/* Image placeholder */}
            <div className="h-40 w-full bg-[#00c9c8]/10 animate-pulse" />

            {/* Content placeholder */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 w-3/4 rounded bg-[#00c9c8]/15 animate-pulse" />
                {/* URL */}
                <div className="h-3 w-1/2 rounded bg-[#00c9c8]/10 animate-pulse" />
            </div>
        </div>
    );
}