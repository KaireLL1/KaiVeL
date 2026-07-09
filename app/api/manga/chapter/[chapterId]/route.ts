import { NextRequest, NextResponse } from 'next/server'
import { getChapterPages } from '@/lib/api'

const CDN = 'https://storage.shngm.id'

export async function GET(_: NextRequest, { params }: { params: Promise<{ chapterId: string }> }) {
  try {
    const { chapterId } = await params
    const raw = await getChapterPages(chapterId)

    let pages: { page: number; url: string }[] = []
    let baseUrl = ''
    let path = ''
    let rawPages: string[] = []

    if (raw?.data?.chapter) {
      const d = raw.data
      baseUrl = d.base_url || d.base_url_low || ''
      path = d.chapter?.path || ''
      rawPages = d.chapter?.data || []
    } else if (raw?.page_list?.chapter_page) {
      const pl = raw.page_list.chapter_page
      baseUrl = CDN
      path = pl.path || ''
      rawPages = pl.pages || []
    } else if (raw?.pages) {
      rawPages = raw.pages
      baseUrl = raw.base_url || CDN
      path = raw.path || ''
    } else if (Array.isArray(raw)) {
      pages = raw.map((p: any, i: number) => ({ page: i + 1, url: p.image_url || p.url || p }))
    }

    if (pages.length === 0 && rawPages.length > 0) {
      pages = rawPages.map((p, i) => ({ page: i + 1, url: `${baseUrl}${path}${p}` }))
    }

    return NextResponse.json({
      chapter_id: chapterId,
      total_pages: pages.length,
      pages,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
