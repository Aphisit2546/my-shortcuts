'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ShortcutCard from '@/components/ShortcutCard';
import SkeletonCard from '@/components/SkeletonCard'; // ✅ 1. Import Skeleton
import { Plus } from 'lucide-react';

export default function Home() {
  const [shortcuts, setShortcuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // ✅ 2. เพิ่ม State Loading

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('shortcuts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setShortcuts(data);
    setLoading(false); // ✅ 3. โหลดเสร็จแล้ว ปิด Loading
  };

  // ฟังก์ชันลบ state ออกจากหน้าจอ
  const handleRemoveItem = (id: string) => {
    setShortcuts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">ทางลัดไปยังเว็บที่ใช้บ่อย</h1>
          <Link
            href="/add-shortcut"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            <Plus size={20} /> เพิ่มรายการ
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* ✅ 4. เช็คเงื่อนไข: ถ้า Loading อยู่ ให้โชว์ Skeleton 8 อัน */}
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            // ถ้าโหลดเสร็จแล้ว ให้โชว์ข้อมูลจริง
            shortcuts.map((item) => (
              <ShortcutCard
                key={item.id}
                id={item.id}
                title={item.title}
                url={item.url}
                imageUrl={item.image_url}
                onDelete={handleRemoveItem}
              />
            ))
          )}
        </div>

        {/* ✅ 5. (แถม) ถ้าโหลดเสร็จแล้วแต่ไม่มีข้อมูลเลย ให้ขึ้นข้อความบอก */}
        {!loading && shortcuts.length === 0 && (
          <div className="mt-20 text-center text-slate-400">
            <p>ยังไม่มีข้อมูล กดปุ่ม "เพิ่มรายการ" ด้านบนได้เลย</p>
          </div>
        )}

      </div>
    </main>
  );
}