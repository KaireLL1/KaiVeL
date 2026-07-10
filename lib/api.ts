const BASE = process.env.SHINIGAMI_API_URL || 'https://api.shngm.io'
const ORIGIN = process.env.SHINIGAMI_ORIGIN || 'https://app.shinigami.asia'

const HEADERS = {
  Accept: 'application/json',
  DNT: '1',
  Origin: ORIGIN,
  'Sec-GPC': '1',
  'X-Requested-With': 'KaiVelApp',
}

export async function shngmFetch(path: string, params?: Record<string, string | number>) {
  const url = new URL(`${BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  const res = await fetch(url.toString(), {
    headers: HEADERS,
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

// ── Manga List ────────────────────────────────
export async function getPopular(page = 1, limit = 30) {
  return shngmFetch('/v1/manga/list', { page, page_size: limit, sort: 'popularity' })
}

export async function getLatest(page = 1, limit = 30) {
  return shngmFetch('/v1/manga/list', { page, page_size: limit, sort: 'latest' })
}

export async function searchManga(q: string, page = 1, limit = 30) {
  return shngmFetch('/v1/manga/list', { page, page_size: limit, q })
}

export async function getMangaByGenre(genre: string, page = 1, limit = 30) {
  return shngmFetch('/v1/manga/list', { page, page_size: limit, genre })
}

export async function getMangaByCountry(countryId: string, page = 1, limit = 30) {
  return shngmFetch('/v1/manga/list', { page, page_size: limit, country_id: countryId })
}

// Filter by format slug (manhwa/manhua/manga) — parameter yang benar dari API
export async function getMangaByFormat(format: string, page = 1, limit = 30, sort = 'popular') {
  return shngmFetch('/v1/manga/list', {
    page,
    page_size: limit,
    format,
    sort: sort === 'latest' ? 'latest' : 'popularity',
  })
}

// ── Manga Detail ──────────────────────────────
export async function getMangaDetail(mangaId: string) {
  return shngmFetch(`/v1/manga/detail/${mangaId}`)
}

// ── Chapters ──────────────────────────────────
export async function getChapterList(mangaId: string) {
  return shngmFetch(`/v1/chapter/${mangaId}/list`, { page_size: 3000 })
}

// ── Chapter Pages ─────────────────────────────
export async function getChapterPages(chapterId: string) {
  return shngmFetch(`/v1/chapter/detail/${chapterId}`)
}
