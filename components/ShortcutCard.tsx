'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// 🎨 Color Palette สำหรับพื้นหลังการ์ด (จะวนลูปสีไปเรื่อยๆ) - สีไม่ซ้ำกัน!
const CARD_COLORS = [
    { bg: '#1a1a2e', border: '#4a4a6a', avatar: '4a4a6a' }, // Deep Navy
    { bg: '#1e3a2f', border: '#3d7a5f', avatar: '3d7a5f' }, // Forest Green
    { bg: '#2d1b3d', border: '#6b3d8a', avatar: '6b3d8a' }, // Royal Purple
    { bg: '#3d2b1b', border: '#8a6b3d', avatar: '8a6b3d' }, // Warm Brown
    { bg: '#1b2d3d', border: '#3d6b8a', avatar: '3d6b8a' }, // Ocean Blue
    { bg: '#3d1b2d', border: '#8a3d6b', avatar: '8a3d6b' }, // Berry Pink
    { bg: '#2d3d1b', border: '#6b8a3d', avatar: '6b8a3d' }, // Olive Green
    { bg: '#3d2d2d', border: '#8a5a5a', avatar: '8a5a5a' }, // Dusty Rose
    { bg: '#1a2e2e', border: '#00c9c8', avatar: '00c9c8' }, // Cyan Teal
    { bg: '#2e1a2e', border: '#ff6b9d', avatar: 'ff6b9d' }, // Hot Pink
    { bg: '#2e2e1a', border: '#ffd93d', avatar: 'ffd93d' }, // Golden Yellow
    { bg: '#1a2e1a', border: '#6bcb77', avatar: '6bcb77' }, // Fresh Green
];

interface Props {
    id: string;
    title: string;
    url: string;
    imageUrl: string | null;
    index: number; // ลำดับของการ์ด (ใช้กำหนดสี)
    onDelete: (id: string) => void;
}

export default function ShortcutCard({ id, title, url, imageUrl, index, onDelete }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 🎨 เลือกสีจาก palette ตาม index (วนลูป)
    const colorScheme = CARD_COLORS[index % CARD_COLORS.length];

    // 🎨 สร้าง avatar URL พร้อมสีเฉพาะของ card นี้
    const generateAvatarUrl = (name: string) =>
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorScheme.avatar}&color=fff&size=256&font-size=0.33&bold=true`;

    // ถ้า imageUrl เป็น ui-avatars URL ให้สร้างใหม่พร้อมสีเฉพาะ, ไม่งั้นใช้ค่าเดิม
    const isUiAvatarsUrl = imageUrl?.includes('ui-avatars.com');
    const displayImage = !imageUrl || isUiAvatarsUrl
        ? generateAvatarUrl(title)
        : imageUrl;

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
        <div
            className="group relative block overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{
                backgroundColor: colorScheme.bg,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colorScheme.border
            }}
        >

            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative h-40 w-full" style={{ backgroundColor: colorScheme.bg }}>
                    <Image
                        src={displayImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-4 bg-white">
                    <h3 className="font-bold text-black truncate pr-6">{title}</h3>
                    <p className="text-xs text-gray-600 truncate">{url}</p>
                </div>
            </a>

            {/* Menu Button */}
            <div className="absolute top-2 right-2">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className="rounded-full bg-[#000000]/80 p-1.5 text-[#c6c6c6] shadow-sm backdrop-blur hover:bg-[#111111] hover:text-white"
                >
                    <MoreVertical size={18} />
                </button>

                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
                        />
                        <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-[#5e5e5e] bg-[#111111] shadow-xl">
                            <Link href={`/edit/${id}`} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#c6c6c6] hover:bg-[#1a1a1a]">
                                <Edit size={14} /> แก้ไข
                            </Link>
                            <button onClick={handleDelete} disabled={isDeleting} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#1a1a1a]">
                                <Trash2 size={14} /> {isDeleting ? '...' : 'ลบ'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ExternalLink className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 text-[#c6c6c6] opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
    );
}