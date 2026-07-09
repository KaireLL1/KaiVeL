import { NextRequest, NextResponse } from 'next/server'
import { getMangaDetail } from '@/lib/api'

export async function GET(_: NextRequest, { params }: { params: Promise<{ mangaId: string }> }) {
  try {
    const { mangaId } = await params
    const data = await getMangaDetail(mangaId)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
