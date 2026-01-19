'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, X } from 'lucide-react';

export default function EditShortcutPage({ params }: { params: Promise<{ id: string }> }) {
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

            // กรณี: อัปโหลดรูปใหม่
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
            // กรณี: ลบรูปเดิมออก และไม่ได้เลือกไฟล์ใหม่ -> สร้าง Avatar จากชื่อ
            else if (!usingCurrentImg && !file) {
                finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.title)}&background=5e5e5e&color=c6c6c6&size=256&font-size=0.33&bold=true`;
            }

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

    if (loadingData) return (
        <div className="flex min-h-screen items-center justify-center bg-[#000000]">
            <div className="text-[#c6c6c6] flex items-center gap-2">
                <Loader2 className="animate-spin" /> กำลังโหลดข้อมูล...
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#000000] p-4">
            <form onSubmit={handleUpdate} className="w-full max-w-md rounded-xl bg-[#111111] p-8 shadow-lg border border-[#5e5e5e]">
                <h2 className="mb-6 text-2xl font-bold text-[#c6c6c6]">แก้ไขข้อมูล</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[#c6c6c6]">ชื่อเว็บ</label>
                        <input
                            required
                            className="mt-1 w-full rounded-md border border-[#5e5e5e] bg-[#1a1a1a] p-2 text-[#c6c6c6] focus:ring-2 focus:ring-[#c6c6c6] focus:border-[#c6c6c6] outline-none transition"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[#c6c6c6]">URL</label>
                        <input
                            required type="url"
                            className="mt-1 w-full rounded-md border border-[#5e5e5e] bg-[#1a1a1a] p-2 text-[#c6c6c6] focus:ring-2 focus:ring-[#c6c6c6] focus:border-[#c6c6c6] outline-none transition"
                            value={form.url}
                            onChange={e => setForm({ ...form, url: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[#c6c6c6]">รูปภาพ</label>

                        {/* แสดงรูปปัจจุบัน ถ้ามี */}
                        {usingCurrentImg && form.image_url && !file && (
                            <div className="relative mt-2 mb-4 h-40 w-full overflow-hidden rounded-lg border border-[#5e5e5e] bg-[#1a1a1a]">
                                <Image src={form.image_url} alt="Current" fill className="object-cover" />
                                {/* ปุ่มลบรูปเดิม */}
                                <button
                                    type="button"
                                    onClick={() => { setUsingCurrentImg(false); setForm({ ...form, image_url: '' }); }}
                                    className="absolute top-2 right-2 rounded-full bg-[#5e5e5e] p-1 text-[#000000] shadow hover:bg-[#c6c6c6] transition"
                                    title="ลบรูปนี้ (จะใช้ Auto Icon แทน)"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* ช่องเลือกไฟล์ */}
                        {(!usingCurrentImg || file) && (
                            <div className="mt-1">
                                <input
                                    type="file" accept="image/*"
                                    className="w-full text-sm text-[#5e5e5e] file:mr-4 file:rounded-full file:border-0 file:bg-[#5e5e5e] file:px-4 file:py-2 file:text-[#000000] file:font-medium hover:file:bg-[#c6c6c6] transition"
                                    onChange={e => {
                                        setFile(e.target.files?.[0] || null);
                                        setUsingCurrentImg(false);
                                    }}
                                />
                                <p className="mt-2 text-xs text-[#5e5e5e]">*หากไม่เลือกรูป ระบบจะสร้างไอคอนจากชื่อเว็บให้</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link href="/" className="w-full rounded-lg border border-[#5e5e5e] py-2 text-center text-[#c6c6c6] hover:bg-[#1a1a1a] transition">
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center rounded-lg bg-[#c6c6c6] py-2 text-[#000000] font-medium hover:bg-[#5e5e5e] hover:text-[#c6c6c6] disabled:opacity-50 transition shadow-md"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : 'บันทึกการแก้ไข'}
                    </button>
                </div>
            </form>
        </div>
    );
}