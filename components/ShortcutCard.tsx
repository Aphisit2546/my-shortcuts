'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
    id: string;
    title: string;
    url: string;
    imageUrl: string | null; // รองรับ null ได้
    onDelete: (id: string) => void;
}

export default function ShortcutCard({ id, title, url, imageUrl, onDelete }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 🧠 Logic: ถ้ามีรูปใช้รูปเดิม ถ้าไม่มีให้สร้าง Avatar จากชื่อ
    // - background=random: สุ่มสีพื้นหลัง
    // - color=fff: ตัวหนังสือสีขาว
    // - size=256: ขนาดรูปชัดๆ
    // - font-size=0.5: ขนาดตัวอักษรครึ่งหนึ่งของพื้นที่
    const displayImage = imageUrl
        ? imageUrl
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&color=fff&size=256&font-size=0.33&bold=true`;

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm('ยืนยันที่จะลบทางลัดนี้?')) return;

        setIsDeleting(true);
        const { error } = await supabase.from('shortcuts').delete().eq('id', id);

        if (error) {
            alert('ลบไม่สำเร็จ: ' + error.message);
            setIsDeleting(false);
        } else {
            onDelete(id);
        }
    };

    return (
        <div className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">

            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative h-40 w-full bg-gray-100">
                    <Image
                        src={displayImage} // ✅ ใช้ตัวแปรที่เราคำนวณไว้
                        alt={title}
                        fill
                        // ถ้าเป็นรูป Avatar ให้ใช้ object-contain (ไม่โดนตัด) หรือ cover ตามชอบ
                        // แต่เพื่อให้สวยงามเสมอ ใช้ cover จะเต็มกรอบดีที่สุด
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 truncate pr-6">{title}</h3>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                </div>
            </a>

            {/* ส่วนปุ่ม Menu เหมือนเดิม... */}
            <div className="absolute top-2 right-2">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className="rounded-full bg-white/80 p-1.5 text-gray-700 shadow-sm backdrop-blur hover:bg-white hover:text-blue-600"
                >
                    <MoreVertical size={18} />
                </button>

                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
                        />
                        <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl">
                            <Link href={`/edit/${id}`} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit size={14} /> แก้ไข
                            </Link>
                            <button onClick={handleDelete} disabled={isDeleting} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 size={14} /> {isDeleting ? '...' : 'ลบ'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ExternalLink className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
    );
}