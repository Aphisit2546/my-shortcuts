'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function AddShortcutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({ title: '', url: '' });
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = '';

            // 1. ถ้ามีการเลือกไฟล์ -> อัปโหลด
            if (file) {
                const fileName = `${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('shortcut-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('shortcut-images')
                    .getPublicUrl(fileName);

                finalImageUrl = data.publicUrl;
            }
            // 2. ถ้าไม่เลือกไฟล์ -> ใช้ UI Avatars สร้างจากชื่อทันที
            else {
                finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.title)}&background=5e5e5e&color=c6c6c6&size=256&font-size=0.33&bold=true`;
            }

            // 3. บันทึกข้อมูล
            const { error: insertError } = await supabase.from('shortcuts').insert({
                title: form.title,
                url: form.url,
                image_url: finalImageUrl,
            });

            if (insertError) throw insertError;

            router.push('/');
            router.refresh();

        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#000000] p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-[#111111] p-8 shadow-lg border border-[#5e5e5e]">
                <h2 className="mb-6 text-2xl font-bold text-[#c6c6c6]">เพิ่มทางลัดใหม่</h2>

                <div className="space-y-4">
                    {/* Input ชื่อเว็บ */}
                    <div>
                        <label className="text-sm font-medium text-[#c6c6c6]">ชื่อเว็บ</label>
                        <input
                            required
                            className="mt-1 w-full rounded-md border border-[#5e5e5e] bg-[#1a1a1a] p-2 text-[#c6c6c6] focus:ring-2 focus:ring-[#c6c6c6] focus:border-[#c6c6c6] outline-none transition placeholder:text-[#5e5e5e]"
                            placeholder="Ex. Facebook, Work, Design"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    {/* Input URL */}
                    <div>
                        <label className="text-sm font-medium text-[#c6c6c6]">URL ลิงก์</label>
                        <input
                            required type="url"
                            className="mt-1 w-full rounded-md border border-[#5e5e5e] bg-[#1a1a1a] p-2 text-[#c6c6c6] focus:ring-2 focus:ring-[#c6c6c6] focus:border-[#c6c6c6] outline-none transition placeholder:text-[#5e5e5e]"
                            placeholder="https://..."
                            value={form.url}
                            onChange={e => setForm({ ...form, url: e.target.value })}
                        />
                    </div>

                    {/* Input เลือกรูป */}
                    <div>
                        <label className="text-sm font-medium text-[#c6c6c6]">
                            รูปภาพ <span className="text-[#5e5e5e] font-normal">(ถ้าไม่ใส่ จะสร้างไอคอนจากชื่อให้)</span>
                        </label>
                        <input
                            type="file" accept="image/*"
                            className="mt-1 w-full text-sm text-[#5e5e5e] file:mr-4 file:rounded-full file:border-0 file:bg-[#5e5e5e] file:px-4 file:py-2 file:text-[#000000] file:font-medium hover:file:bg-[#c6c6c6] transition"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    <Link href="/" className="w-full rounded-lg border border-[#5e5e5e] py-2 text-center text-[#c6c6c6] hover:bg-[#1a1a1a] transition">
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center w-full rounded-lg bg-[#c6c6c6] py-2 text-[#000000] font-medium hover:bg-[#5e5e5e] hover:text-[#c6c6c6] disabled:opacity-50 transition shadow-md"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" size={18} />
                                กำลังประมวลผล...
                            </>
                        ) : 'บันทึก'}
                    </button>
                </div>
            </form>
        </div>
    );
}