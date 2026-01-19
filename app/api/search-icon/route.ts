import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. ตั้งค่า OAuth 1.0a
    const oauth = new OAuth({
        consumer: {
            key: process.env.NOUN_API_KEY!,
            secret: process.env.NOUN_API_SECRET!,
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
            return crypto.createHmac('sha1', key).update(base_string).digest('base64');
        },
    });

    // 2. เตรียม URL (ค้นหาไอคอนแบบ Public domain หรือ Creative Commons)
    const requestData = {
        url: `https://api.thenounproject.com/v2/icon?query=${encodeURIComponent(query)}&limit=1`,
        method: 'GET',
    };

    // 3. เซ็นลายเซ็น (Sign Request)
    const token = {
        key: '',
        secret: '',
    };

    // สร้าง Header Authorization
    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    try {
        // 4. ยิง Request ไป The Noun Project
        const res = await fetch(requestData.url, {
            headers: {
                ...authHeader,
                'Accept': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Noun Project API Error: ${res.statusText}`);
        }

        const data = await res.json();

        // 5. ดึง URL ของรูปแรกที่เจอ
        // API v2 จะ return structure ประมาณ icons[0].thumbnail_url หรือ preview_url
        const iconUrl = data.icons?.[0]?.thumbnail_url || data.icons?.[0]?.preview_url;

        if (!iconUrl) {
            return NextResponse.json({ error: 'No icon found' }, { status: 404 });
        }

        return NextResponse.json({ url: iconUrl });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch icon' }, { status: 500 });
    }
}