import { NextRequest, NextResponse } from 'next/server'
import { getPopular, getLatest, getMangaByCountry, getMangaByGenre } from '@/lib/api'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page  = parseInt(searchParams.get('page')  || '1')
  const limit = parseInt(searchParams.get('limit') || '30')
  const sort  = searchParams.get('sort') || 'popular'
  const type  = searchParams.get('type') || ''
  const genre = searchParams.get('genre') || ''

  try {
    let data: any
    if (genre) {
      data = await getMangaByGenre(genre, page, limit)
    } else if (type) {
      const map: Record<string,string> = { manhwa: 'KR', manhua: 'CN', manga: 'JP' }
      data = await getMangaByCountry(map[type] || type.toUpperCase(), page, limit)
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
