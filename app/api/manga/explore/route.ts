import { NextRequest, NextResponse } from 'next/server'
import { getPopular, getLatest, getMangaByGenre, getMangaByFormat } from '@/lib/api'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page  = parseInt(searchParams.get('page')  || '1')
  const limit = parseInt(searchParams.get('limit') || '30')
  const sort  = searchParams.get('sort') || 'popular'
  const type  = searchParams.get('type') || ''   // manhwa | manhua | manga
  const genre = searchParams.get('genre') || ''

  try {
    let data: any
    if (genre) {
      data = await getMangaByGenre(genre, page, limit)
    } else if (type) {
      // Gunakan parameter 'format' — country_id tidak didukung API
      // type value (manhwa/manhua/manga) = format slug yang valid
      data = await getMangaByFormat(type, page, limit, sort)
    } else if (sort === 'latest') {
      data = await getLatest(page, limit)
    } else {
      data = await getPopular(page, limit)
    }

    return NextResponse.json({
      data: data.data || [],
      has_next_page: (data.meta?.page || 1) < (data.meta?.total_page || 1),
      total_record: data.meta?.total_record || 0,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
