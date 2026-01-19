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

            // ---------------------------------------------------------
            // กรณีที่ 1: ผู้ใช้เลือกไฟล์รูปภาพ (Upload File)
            // ---------------------------------------------------------
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
            // ---------------------------------------------------------
            // กรณีที่ 2: ไม่ได้เลือกไฟล์ -> ระบบหา ICON ให้อัตโนมัติ
            // ---------------------------------------------------------
            else {
                try {
                    // เรียก API ที่เราทำไว้ (Noun Project)
                    const res = await fetch(`/api/search-icon?q=${encodeURIComponent(form.title)}`);

                    if (res.ok) {
                        const data = await res.json();
                        if (data.url) {
                            finalImageUrl = data.url;
                        }
                    }
                } catch (err) {
                    console.error("หาไอคอนไม่เจอ:", err);
                }

                // Fallback: ถ้าหาไอคอนจาก Noun Project ไม่ได้จริงๆ ให้ใช้ตัวอักษรย่อ (UI Avatars) แทน
                if (!finalImageUrl) {
                    finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.title)}&background=random&color=fff&size=256`;
                }
            }

            // ---------------------------------------------------------
            // 3. บันทึกข้อมูลลง Database
            // ---------------------------------------------------------
            const { error: insertError } = await supabase.from('shortcuts').insert({
                title: form.title,
                url: form.url,
                image_url: finalImageUrl,
            });

            if (insertError) throw insertError;

            // กลับหน้าหลัก
            router.push('/');
            router.refresh();

        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-2xl font-bold text-slate-800">เพิ่มทางลัดใหม่</h2>

                <div className="space-y-4">
                    {/* Input ชื่อเว็บ */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">ชื่อเว็บ (Keyword หาไอคอน)</label>
                        <input
                            required
                            className="mt-1 w-full rounded-md border p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex. Facebook, Work, Design"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    {/* Input URL */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">URL ลิงก์</label>
                        <input
                            required type="url"
                            className="mt-1 w-full rounded-md border p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://..."
                            value={form.url}
                            onChange={e => setForm({ ...form, url: e.target.value })}
                        />
                    </div>

                    {/* Input เลือกรูป */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            รูปภาพ <span className="text-slate-400 font-normal">(ถ้าไม่ใส่ จะดึงไอคอนให้เอง)</span>
                        </label>
                        <input
                            type="file" accept="image/*"
                            className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100 transition"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    <Link href="/" className="w-full rounded-lg border py-2 text-center text-slate-600 hover:bg-slate-50 transition">
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
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