import { NextRequest, NextResponse } from 'next/server'
import { getChapterList } from '@/lib/api'

export async function GET(_: NextRequest, { params }: { params: Promise<{ mangaId: string }> }) {
  try {
    const { mangaId } = await params
    const raw = await getChapterList(mangaId)
    let list: any[] = []
    if (Array.isArray(raw)) list = raw
    else if (raw?.data) list = raw.data
    else if (raw?.chapter_list) list = raw.chapter_list

    const chapters = list.map((item: any) => {
      const num = String(item.chapter_number || item.number || '').replace('.0', '')
      const titlePart = item.chapter_title || item.title || ''
      return {
        chapter_id: item.chapter_id || item.id || '',
        name: titlePart ? `Chapter ${num} - ${titlePart}` : `Chapter ${num}`,
        date: item.release_date || item.date || null,
      }
    })

    return NextResponse.json({ chapters, total: chapters.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
