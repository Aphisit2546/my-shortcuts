'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ShortcutCard from '@/components/ShortcutCard';
import { Plus } from 'lucide-react';

export default function Home() {
  const [shortcuts, setShortcuts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('shortcuts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setShortcuts(data);
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
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
          >
            <Plus size={20} /> เพิ่มรายการ
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((item) => (
            <ShortcutCard
              key={item.id}
              id={item.id} // ส่ง ID ไปด้วย
              title={item.title}
              url={item.url}
              imageUrl={item.image_url}
              onDelete={handleRemoveItem} // ส่งฟังก์ชันลบไป
            />
          ))}
        </div>
      </div>
    </main>
  );
}