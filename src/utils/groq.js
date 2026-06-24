// ─── GROQ AI UTILITY ─────────────────────────────────────────────────────────
import { getSettings } from './storage.js'

async function callGroq(systemPrompt, userPrompt, maxTokens = 1024) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || getSettings().groqKey
  if (!groqKey) throw new Error('NO_KEY')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq API error ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

// ─── AI FEATURES ──────────────────────────────────────────────────────────────

export async function generateReviewResponse({ reviewText, reviewerName, rating, businessName, businessType, city }) {
  const system = `You are an expert Google Business Profile manager for ${businessName}, a ${businessType} in ${city}. 
Write professional, warm, keyword-rich responses to customer reviews. 
Rules: Under 200 words. Thank the customer by name. Address their specific points. 
For negative reviews: apologise sincerely, acknowledge the issue, offer to resolve offline, stay professional.
For positive reviews: thank genuinely, highlight a keyword naturally, invite return visit.
Never be defensive. Never copy-paste generic responses. Sound human and specific.`

  const user = `Write an owner response to this ${rating}-star review from ${reviewerName || 'a customer'}:
"${reviewText}"
Return only the response text, nothing else.`

  return callGroq(system, user, 300)
}

export async function generateGooglePost({ postType, businessName, businessType, city, topic, offer, eventDate }) {
  const system = `You are a local SEO expert writing Google Business Profile posts for ${businessName}, a ${businessType} in ${city}.
Write engaging, action-driven posts that rank in local search.
Rules: Natural keyword use. Clear call to action. Under 300 words. No hashtags. No emojis unless appropriate.
Sound like a real, local business owner — not corporate, not spammy.`

  const postGuide = {
    'Whats New': 'Share a business update, new service, or general news. End with a call to action.',
    'Offer': `Create a compelling limited-time offer about: ${offer || topic}. Include urgency. Clear terms.`,
    'Event': `Promote an event about: ${topic}. Date: ${eventDate || 'upcoming'}. Include what, when, where, why attend.`,
    'Product': `Highlight a product or service: ${topic}. Focus on benefits, not features.`,
  }

  const user = `Write a ${postType} Google Post. ${postGuide[postType] || ''}
Topic/Context: ${topic || offer || 'general business update'}
Return only the post text, nothing else.`

  return callGroq(system, user, 400)
}

export async function generateQandAs({ businessName, businessType, city, services, targetCustomers }) {
  const system = `You are a local SEO expert. Generate realistic, keyword-rich Q&As for a Google Business Profile.
Business: ${businessName} — ${businessType} in ${city}.
Rules: Questions must be what real customers actually search. Answers must be helpful, specific, and include natural keywords.
Each answer 2–4 sentences. Professional and human tone.`

  const user = `Generate 10 Q&As for this business.
Services: ${services || 'general services'}
Target customers: ${targetCustomers || 'local customers'}
Format each as:
Q: [question]
A: [answer]
Return only the 10 Q&As, nothing else.`

  return callGroq(system, user, 1200)
}

export async function generateBusinessDescription({ businessName, businessType, city, services, uniquePoints, targetCustomers, founded, awards, languages }) {
  const system = `You are a local SEO copywriter. Write a Google Business Profile description.
Rules: Max 750 characters. No links, no URLs, no prices, no promotional language like "best" or "#1".
Natural keyword placement. First person or third person — be consistent. Human, warm, specific.
Focus on: what they do, who they serve, what makes them different.`

  const user = `Write a GBP description for:
Business: ${businessName}
Type: ${businessType} in ${city}
Services: ${services || ''}
What makes them different: ${uniquePoints || ''}
Target customers: ${targetCustomers || ''}
Founded: ${founded || ''}
Awards/accreditations: ${awards || ''}
Languages: ${languages || 'English'}
Return only the description text under 750 characters, nothing else.`

  return callGroq(system, user, 250)
}

export async function generateMonthlyReport({ businessName, businessType, city, month, views, searches, calls, directions, websiteClicks, reviews, photosViews, topPosts, notes }) {
  const system = `You are a Google Business Profile consultant writing a monthly performance report for a client.
Write in a professional, clear tone. Explain what the numbers mean in plain language.
Highlight wins, explain any dips, give 3 specific action recommendations for next month.`

  const user = `Write a monthly GBP performance summary for:
Business: ${businessName} (${businessType}, ${city})
Month: ${month}
Stats:
- Profile views: ${views || 0}
- Search appearances: ${searches || 0}
- Phone calls from GBP: ${calls || 0}
- Direction requests: ${directions || 0}
- Website clicks: ${websiteClicks || 0}
- New reviews this month: ${reviews || 0}
- Photo views: ${photosViews || 0}
- Top performing post: ${topPosts || 'N/A'}
Additional notes: ${notes || 'None'}
Write a clear 3-paragraph summary + 3 bullet action points. Return only the report text.`

  return callGroq(system, user, 600)
}
