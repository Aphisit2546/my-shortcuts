export default function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* ส่วนรูปภาพ - ใช้ animate-pulse ให้กระพริบวิบวับ */}
            <div className="h-40 w-full bg-gray-200 animate-pulse" />

            {/* ส่วนเนื้อหา */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                {/* URL */}
                <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
        </div>
    );
}