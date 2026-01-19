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
    imageUrl: string | null;
    onDelete: (id: string) => void;
}

export default function ShortcutCard({ id, title, url, imageUrl, onDelete }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const displayImage = imageUrl
        ? imageUrl
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=5e5e5e&color=c6c6c6&size=256&font-size=0.33&bold=true`;

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
        <div className="group relative block overflow-hidden rounded-xl border border-[#5e5e5e] bg-[#111111] shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#c6c6c6]">

            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative h-40 w-full bg-[#1a1a1a]">
                    <Image
                        src={displayImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-[#c6c6c6] truncate pr-6">{title}</h3>
                    <p className="text-xs text-[#5e5e5e] truncate">{url}</p>
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