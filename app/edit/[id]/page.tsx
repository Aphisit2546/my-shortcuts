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
                finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.title)}&background=00c9c8&color=fff&size=256&font-size=0.33&bold=true`;
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
        <div className="flex min-h-screen items-center justify-center bg-[#bffcf9]">
            <div className="text-[#47817f] flex items-center gap-2">
                <Loader2 className="animate-spin" /> กำลังโหลดข้อมูล...
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#bffcf9] p-4">
            <form onSubmit={handleUpdate} className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-[#47817f]/20">
                <h2 className="mb-6 text-2xl font-bold text-[#000000]">แก้ไขข้อมูล</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[#47817f]">ชื่อเว็บ</label>
                        <input
                            required
                            className="mt-1 w-full rounded-md border border-[#47817f]/30 p-2 text-[#000000] focus:ring-2 focus:ring-[#00c9c8] focus:border-[#00c9c8] outline-none transition"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[#47817f]">URL</label>
                        <input
                            required type="url"
                            className="mt-1 w-full rounded-md border border-[#47817f]/30 p-2 text-[#000000] focus:ring-2 focus:ring-[#00c9c8] focus:border-[#00c9c8] outline-none transition"
                            value={form.url}
                            onChange={e => setForm({ ...form, url: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[#47817f]">รูปภาพ</label>

                        {/* แสดงรูปปัจจุบัน ถ้ามี */}
                        {usingCurrentImg && form.image_url && !file && (
                            <div className="relative mt-2 mb-4 h-40 w-full overflow-hidden rounded-lg border border-[#47817f]/20 bg-[#bffcf9]">
                                <Image src={form.image_url} alt="Current" fill className="object-cover" />
                                {/* ปุ่มลบรูปเดิม */}
                                <button
                                    type="button"
                                    onClick={() => { setUsingCurrentImg(false); setForm({ ...form, image_url: '' }); }}
                                    className="absolute top-2 right-2 rounded-full bg-[#00c9c8] p-1 text-white shadow hover:bg-[#47817f] transition"
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
                                    className="w-full text-sm text-[#47817f] file:mr-4 file:rounded-full file:border-0 file:bg-[#00c9c8]/10 file:px-4 file:py-2 file:text-[#00c9c8] hover:file:bg-[#00c9c8]/20 transition"
                                    onChange={e => {
                                        setFile(e.target.files?.[0] || null);
                                        setUsingCurrentImg(false);
                                    }}
                                />
                                <p className="mt-2 text-xs text-[#47817f]/60">*หากไม่เลือกรูป ระบบจะสร้างไอคอนจากชื่อเว็บให้</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link href="/" className="w-full rounded-lg border border-[#47817f]/30 py-2 text-center text-[#47817f] hover:bg-[#bffcf9] transition">
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center rounded-lg bg-[#00c9c8] py-2 text-white hover:bg-[#47817f] disabled:opacity-50 transition shadow-md"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : 'บันทึกการแก้ไข'}
                    </button>
                </div>
            </form>
        </div>
    );
}