import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    cookieStore.delete('session_id');
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'));
}
