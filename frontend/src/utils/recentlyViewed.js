const STORAGE_KEY = "every_market_recently_viewed"
const MAX_ITEMS = 10

export const addRecentlyViewed = (productId) => {
  if (!productId) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const ids = raw ? JSON.parse(raw) : []
    const filtered = ids.filter((id) => String(id) !== String(productId))
    filtered.unshift(productId)
    const trimmed = filtered.slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
}

export const getRecentlyViewedIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
