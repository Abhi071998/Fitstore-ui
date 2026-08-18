export function parseImages(product) {
  try {
    return JSON.parse(product.images || '[]')
  } catch {
    return []
  }
}

export function firstImage(product) {
  return parseImages(product)[0] || null
}
