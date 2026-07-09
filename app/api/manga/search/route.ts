import { NextRequest, NextResponse } from 'next/server'
import { searchManga } from '@/lib/api'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q     = searchParams.get('q') || ''
  const page  = parseInt(searchParams.get('page')  || '1')
  const limit = parseInt(searchParams.get('limit') || '30')

  if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  try {
    const data = await searchManga(q, page, limit)
    return NextResponse.json({
      data: data.data || [],
      has_next_page: (data.meta?.page || 1) < (data.meta?.total_page || 1),
      total_record: data.meta?.total_record || 0,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
