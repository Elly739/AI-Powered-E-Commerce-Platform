const STOPWORDS = new Set(['a', 'an', 'and', 'are', 'around', 'for', 'i', 'in', 'is', 'me', 'my', 'of', 'on', 'or', 'the', 'to', 'under', 'with'])

const QUICK_REPLIES = ['Gift under $50', 'For my desk', 'Daily rituals', 'In stock only']

const normalizeText = (value = '') => value.toString().toLowerCase()

const tokenize = (message) => normalizeText(message)
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter((token) => token.length > 2 && !STOPWORDS.has(token))

const extractBudget = (message) => {
  const match = normalizeText(message).match(/(?:under|below|less than|max|budget|around)\s*\$?(\d+(?:\.\d{1,2})?)/)
  if (!match) return null
  return Number(match[1])
}

const getIntent = (message) => {
  const text = normalizeText(message)
  return {
    wantsGift: /\bgift|present|surprise\b/.test(text),
    wantsDesk: /\bdesk|office|work|workspace|lamp|light\b/.test(text),
    wantsHome: /\bhome|room|candle|lamp|object|decor\b/.test(text),
    wantsDaily: /\bdaily|ritual|morning|coffee|soap|routine\b/.test(text),
    wantsWearable: /\bwear|carry|bag|tote|cap|walk\b/.test(text),
    wantsInStock: /\bin stock|available|ready|ship\b/.test(text),
  }
}

const productHaystack = (product) => normalizeText(`${product.name} ${product.description} ${product.categoryName || ''} ${product.categorySlug || ''}`)

const scoreProduct = (product, message, viewedProductIds = []) => {
  const tokens = tokenize(message)
  const budget = extractBudget(message)
  const intent = getIntent(message)
  const haystack = productHaystack(product)
  let score = 0

  tokens.forEach((token) => {
    if (haystack.includes(token)) score += 4
  })

  if (budget && Number(product.price) <= budget) score += 8
  if (budget && Number(product.price) > budget) score -= 8
  if (product.stockQuantity > 0) score += intent.wantsInStock ? 8 : 2
  if (viewedProductIds.includes(product.id)) score -= 4

  const category = normalizeText(product.categoryName || '')
  if (intent.wantsDesk && (haystack.includes('desk') || haystack.includes('lamp'))) score += 8
  if (intent.wantsHome && category.includes('home')) score += 6
  if (intent.wantsDaily && category.includes('daily')) score += 6
  if (intent.wantsWearable && category.includes('wearable')) score += 6
  if (intent.wantsGift && Number(product.price) <= 50) score += 5

  return score
}

const reasonFor = (product, message) => {
  const budget = extractBudget(message)
  const intent = getIntent(message)
  const reasons = []
  if (budget && Number(product.price) <= budget) reasons.push(`fits the $${budget} budget`)
  if (product.stockQuantity > 0) reasons.push('is ready to ship')
  if (intent.wantsDesk && productHaystack(product).includes('desk')) reasons.push('matches a desk or workspace need')
  if (intent.wantsGift && Number(product.price) <= 50) reasons.push('works as an easy gift')
  if (!reasons.length) reasons.push(`matches ${product.categoryName || 'the current edit'}`)
  return reasons.slice(0, 2).join(' and ')
}

export const buildAssistantReply = ({ message, products, cart = [], wishlist = [], viewedProductIds = [] }) => {
  const safeMessage = (message || '').trim()
  const scored = products
    .map((product) => ({ ...product, assistantScore: scoreProduct(product, safeMessage, viewedProductIds) }))
    .sort((a, b) => b.assistantScore - a.assistantScore || Number(a.price) - Number(b.price))

  const recommendations = scored.filter((product) => product.assistantScore > 0).slice(0, 4)
  const fallbackRecommendations = scored.slice(0, 4)
  const hasRealMatch = recommendations.length > 0 && recommendations[0].assistantScore > 4
  const selected = hasRealMatch ? recommendations : fallbackRecommendations
  const names = selected.slice(0, 3).map((product) => product.name)
  const topProduct = selected[0]

  const contextNotes = []
  if (wishlist.length) contextNotes.push(`I also considered your ${wishlist.length} saved ${wishlist.length === 1 ? 'piece' : 'pieces'}.`)
  if (cart.length) contextNotes.push(`Your cart has ${cart.length} ${cart.length === 1 ? 'item' : 'items'}, so I avoided pretending this is a blank slate.`)

  const response = hasRealMatch
    ? `I would start with ${names.join(names.length > 2 ? ', ' : ' and ')}. ${topProduct.name} is the strongest match because it ${reasonFor(topProduct, safeMessage)}. ${contextNotes.join(' ')}`
    : selected.length
      ? `I could not find a confident match for "${safeMessage}", but here are the closest pieces in the edit. ${contextNotes.join(' ')}`
      : 'I could not find a matching product yet. Try asking by budget, room, routine, or use case and I will narrow the edit.'

  return {
    response,
    recommendations: selected.map((product) => ({
      ...product,
      reason: reasonFor(product, safeMessage),
    })),
    quickReplies: QUICK_REPLIES,
  }
}
