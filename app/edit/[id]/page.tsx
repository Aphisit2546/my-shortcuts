'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export default function EditShortcutPage({ params }: { params: Promise<{ id: string }> }) {
    // แก้ไขการดึง params ใน Next.js 15+ (ต้อง await หรือใช้ React.use)
    const { id } = use(params);

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({ title: '', url: '', image_url: '' });
    const [newFile, setNewFile] = useState<File | null>(null);

    // ดึงข้อมูลเก่ามาแสดง
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
                setLoading(false);
            }
        };
        fetchShortcut();
    }, [id, router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let finalImageUrl = form.image_url;

            // ถ้ามีการเลือกรูปใหม่ ให้อัปโหลดทับ
            if (newFile) {
                const fileName = `${Date.now()}-${newFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('shortcut-images')
                    .upload(fileName, newFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('shortcut-images')
                    .getPublicUrl(fileName);
                finalImageUrl = data.publicUrl;
            }

            // Update ข้อมูล
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
            alert('เกิดข้อผิดพลาด: ' + error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <form onSubmit={handleUpdate} className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-2xl font-bold text-slate-800">แก้ไขทางลัด</h2>

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
                        <label className="text-sm font-medium text-slate-700">URL ลิงก์</label>
                        <input
                            required type="url"
                            className="mt-1 w-full rounded-md border p-2 text-slate-900"
                            value={form.url}
                            onChange={e => setForm({ ...form, url: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">เปลี่ยนรูปภาพ (ถ้าต้องการ)</label>

                        {/* แสดงรูปปัจจุบัน */}
                        {form.image_url && !newFile && (
                            <div className="relative mb-2 h-32 w-full overflow-hidden rounded-lg border">
                                <Image src={form.image_url} alt="Current" fill className="object-cover" />
                            </div>
                        )}

                        <input
                            type="file" accept="image/*"
                            className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700"
                            onChange={e => setNewFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link href="/" className="w-full rounded-lg border py-2 text-center text-slate-600 hover:bg-slate-50">
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                    </button>
                </div>
            </form>
        </div>
    );
}