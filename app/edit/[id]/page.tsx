'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, X } from 'lucide-react';

export default function EditShortcutPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params for Next.js 15+
    const { id } = use(params);

    const router = useRouter();
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [form, setForm] = useState({ title: '', url: '', image_url: '' });
    const [file, setFile] = useState<File | null>(null);

    // State เช็คว่าเรากำลังใช้รูปเดิมอยู่ไหม
    const [usingCurrentImg, setUsingCurrentImg] = useState(true);

    // 1. ดึงข้อมูลเก่า
    useEffect(() => {
        const fetchShortcut = async () => {
            const { data, error } = await supabase
                .from('shortcuts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('ไม่พบข้อมูล');
                router.push('/');
            } else {
                setForm(data);
                setUsingCurrentImg(!!data.image_url);
                setLoadingData(false);
            }
        };
        fetchShortcut();
    }, [id, router]);

    // 2. บันทึกข้อมูล
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let finalImageUrl = form.image_url;

            // กรณี: ผู้ใช้เลือกไฟล์ใหม่ -> อัปโหลด
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
            // กรณี: ผู้ใช้ลบรูปเดิมออก และไม่ได้เลือกไฟล์ใหม่ -> ดึง Auto Icon
            else if (!usingCurrentImg && !file) {
                try {
                    const res = await fetch(`/api/search-icon?q=${encodeURIComponent(form.title)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.url) finalImageUrl = data.url;
                    }
                } catch (err) {
                    console.error("Auto icon failed", err);
                }

                // Fallback Avatar
                if (!finalImageUrl) {
                    finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.title)}&background=random&color=fff&size=256`;
                }
            }
            // กรณี: ใช้รูปเดิม (usingCurrentImg = true) -> ไม่ต้องทำอะไรกับ finalImageUrl

            // Update Database
            const { error: updateError } = await supabase
                .from('shortcuts')
                .update({
                    title: form.title,
                    url: form.url,
                    image_url: finalImageUrl,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            router.push('/');
            router.refresh();

        } catch (error) {
            alert('Error: ' + error);
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) return <div className="p-20 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <form onSubmit={handleUpdate} className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-2xl font-bold text-slate-800">แก้ไขข้อมูล</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">ชื่อเว็บ</label>
                        <input
                            required
                            className="mt-1 w-full rounded-md border p-2 text-slate-900"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">URL</label>
                        <input
                            required type="url"
                            className="mt-1 w-full rounded-md border p-2 text-slate-900"
                            value={form.url}
                            onChange={e => setForm({ ...form, url: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">รูปภาพ</label>

                        {/* แสดงรูปปัจจุบัน ถ้ามี */}
                        {usingCurrentImg && form.image_url && !file && (
                            <div className="relative mt-2 mb-4 h-40 w-full overflow-hidden rounded-lg border bg-gray-100">
                                <Image src={form.image_url} alt="Current" fill className="object-cover" />
                                {/* ปุ่มลบรูปเดิม เพื่อจะเปลี่ยนใหม่ */}
                                <button
                                    type="button"
                                    onClick={() => { setUsingCurrentImg(false); setForm({ ...form, image_url: '' }); }}
                                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                                    title="ลบรูปนี้ (จะใช้ Auto Icon แทน)"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* ช่องเลือกไฟล์ (แสดงเมื่อไม่ได้ใช้รูปเดิม หรือ อยากเปลี่ยนไฟล์) */}
                        {(!usingCurrentImg || file) && (
                            <div className="mt-1">
                                <input
                                    type="file" accept="image/*"
                                    className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700"
                                    onChange={e => {
                                        setFile(e.target.files?.[0] || null);
                                        setUsingCurrentImg(false); // ถ้าเลือกไฟล์ แปลว่าไม่เอาอันเก่าแล้ว
                                    }}
                                />
                                <p className="mt-2 text-xs text-slate-400">*หากไม่เลือกรูป ระบบจะค้นหาไอคอนให้ใหม่อัตโนมัติจากชื่อเว็บ</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link href="/" className="w-full rounded-lg border py-2 text-center text-slate-600 hover:bg-slate-50">
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : 'บันทึกการแก้ไข'}
                    </button>
                </div>
            </form>
        </div>
    );
}