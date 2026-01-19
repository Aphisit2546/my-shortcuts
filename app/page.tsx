'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ShortcutCard from '@/components/ShortcutCard';
import SkeletonCard from '@/components/SkeletonCard';
import { Plus, Search, X } from 'lucide-react';

export default function Home() {
  const [shortcuts, setShortcuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('shortcuts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setShortcuts(data);
    setLoading(false);
  };

  const handleRemoveItem = (id: string) => {
    setShortcuts((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shortcuts, searchQuery]);

  return (
    <main className="min-h-screen bg-[#bffcf9] p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header & Search Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#000000]">เว็บที่ใช้บ่อย 🚀</h1>
            <p className="text-[#47817f] text-sm mt-1">จัดการทางลัดเว็บไซต์ของคุณ</p>
          </div>

          <div className="flex gap-3">
            {/* 🔍 Search Bar */}
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#47817f]">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อเว็บ..."
                className="w-full md:w-64 rounded-lg border border-[#47817f]/30 bg-white py-2 pl-10 pr-8 text-[#000000] shadow-sm outline-none transition focus:border-[#00c9c8] focus:ring-1 focus:ring-[#00c9c8]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#47817f] hover:text-[#00c9c8]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* ปุ่มเพิ่ม */}
            <Link
              href="/add-shortcut"
              className="flex items-center gap-2 rounded-lg bg-[#00c9c8] px-4 py-2 text-white shadow-md transition hover:bg-[#47817f] hover:shadow-lg whitespace-nowrap"
            >
              <Plus size={20} /> <span className="hidden sm:inline">เพิ่มใหม่</span>
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredShortcuts.length > 0 ? (
            filteredShortcuts.map((item) => (
              <ShortcutCard
                key={item.id}
                id={item.id}
                title={item.title}
                url={item.url}
                imageUrl={item.image_url}
                onDelete={handleRemoveItem}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00c9c8]/10">
                <Search className="text-[#00c9c8]" size={32} />
              </div>
              <h3 className="text-lg font-medium text-[#000000]">ไม่พบเว็บไซต์ที่ค้นหา</h3>
              <p className="text-[#47817f]">ลองใช้คำค้นอื่น หรือเพิ่มรายการใหม่</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}