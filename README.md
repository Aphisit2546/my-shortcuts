# 🚀 My Shortcuts

เว็บแอปสำหรับจัดการทางลัดเว็บไซต์ที่ใช้บ่อย พัฒนาด้วย Next.js และ Supabase

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)

## ✨ Features

- 📌 **เพิ่ม/แก้ไข/ลบ** ทางลัดเว็บไซต์
- 🔍 **ค้นหา** ทางลัดตามชื่อหรือ URL
- 🖼️ **อัปโหลดรูปภาพ** หรือสร้างไอคอนอัตโนมัติจากชื่อ
- 📱 **Responsive Design** รองรับทุกขนาดหน้าจอ
- ⚡ **Real-time Loading** พร้อม Skeleton UI

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Black | `#000000` | Headings, primary text |
| Cyan | `#00c9c8` | Buttons, accents |
| Light Cyan | `#bffcf9` | Background |
| Dark Teal | `#47817f` | Labels, borders |

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Icons:** Lucide React

## 📦 Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd my-shortcuts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   สร้างไฟล์ `.env.local` และใส่ค่าต่อไปนี้:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. เปิด [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Table: `shortcuts`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | ชื่อเว็บไซต์ |
| url | text | URL ของเว็บไซต์ |
| image_url | text | URL รูปภาพ/ไอคอน |
| created_at | timestamp | วันที่สร้าง |

### Storage Bucket: `shortcut-images`

สำหรับเก็บรูปภาพที่ผู้ใช้อัปโหลด

## 📁 Project Structure

```
my-shortcuts/
├── app/
│   ├── add-shortcut/
│   │   └── page.tsx       # หน้าเพิ่มทางลัด
│   ├── edit/
│   │   └── [id]/
│   │       └── page.tsx   # หน้าแก้ไขทางลัด
│   ├── api/               # API Routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # หน้าหลัก
├── components/
│   ├── ShortcutCard.tsx   # Card แสดงทางลัด
│   └── SkeletonCard.tsx   # Loading skeleton
├── lib/
│   └── supabase.ts        # Supabase client
└── public/                # Static files
```

## 🚀 Deployment

### Vercel (แนะนำ)

1. Push code ไปยัง GitHub
2. Import project บน [Vercel](https://vercel.com)
3. เพิ่ม Environment Variables
4. Deploy!

## 📝 License

MIT License

---

Made with ❤️ using Next.js & Supabase
