// ─── GROQ AI UTILITY ─────────────────────────────────────────────────────────
import { getSettings } from './storage.js'

// ✅ CURRENT MODEL — June 2026
// Using qwen/qwen3.6-27b with reasoning_effort: "none" to disable think tags
// This gives clean output with no <think> blocks
const GROQ_MODEL = 'qwen/qwen3.6-27b'

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
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      // ✅ THIS IS THE KEY FIX: disables thinking mode on Qwen models
      // Without this, Qwen outputs <think>...</think> blocks before every response
      reasoning_effort: 'none',
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
  let content = data.choices?.[0]?.message?.content?.trim() || ''

  // ✅ SAFETY NET: strip any remaining <think>...</think> tags just in case
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  // ✅ Strip markdown bold/italic asterisks from output
  content = content.replace(/\*\*(.*?)\*\*/g, '$1')
  content = content.replace(/\*(.*?)\*/g, '$1')

  return content
}

// ─── REVIEW RESPONSE ─────────────────────────────────────────────────────────
export async function generateReviewResponse({ reviewText, reviewerName, rating, businessName, businessType, city }) {
  const system = `You are a Google Business Profile manager for ${businessName}, a ${businessType} in ${city}.
Your job is to write the final Google review response text only — ready to copy and paste directly.
STRICT RULES:
- Output ONLY the response text. Nothing else. No intro. No explanation. No notes. No thinking.
- Under 150 words
- Start directly with thanking ${reviewerName || 'the customer'} by name
- For 5-star reviews: warm, genuine, mention one specific thing from their review, invite them back
- For negative reviews: apologise sincerely, acknowledge their specific issue, invite them to contact you to resolve
- Sound like a real human business owner — not robotic or corporate
- NO markdown, NO asterisks, NO bullet points`

  const user = `Write the Google review response for this ${rating}-star review from ${reviewerName || 'a customer'}:
"${reviewText}"

Output only the response. Start directly with the first word. No preamble.`

  return callGroq(system, user, 200)
}

// ─── GOOGLE POST ──────────────────────────────────────────────────────────────
export async function generateGooglePost({ postType, businessName, businessType, city, topic, offer, eventDate }) {
  const system = `You are writing a Google Business Profile post for ${businessName}, a ${businessType} in ${city}.
Output ONLY the post text — nothing else. No intro. No explanation. No markdown. No asterisks.
Under 300 words. Natural keywords. Clear call to action. Sound like a real local business owner.`

  const postGuide = {
    'Whats New': 'Share a business update or new service. End with a call to action.',
    'Offer': `Create a limited-time offer about: ${offer || topic}. Include urgency.`,
    'Event': `Promote an event: ${topic}. Date: ${eventDate || 'upcoming'}.`,
    'Product': `Highlight: ${topic}. Focus on customer benefits.`,
  }

  const user = `Write a ${postType} Google Post.
${postGuide[postType] || ''}
Topic: ${topic || offer || 'general update'}
Start directly with the post. No preamble. No markdown.`

  return callGroq(system, user, 400)
}

// ─── Q&A GENERATOR ───────────────────────────────────────────────────────────
export async function generateQandAs({ businessName, businessType, city, services, targetCustomers }) {
  const system = `You generate Q&As for a Google Business Profile.
Business: ${businessName} — ${businessType} in ${city}.
Output ONLY the 10 Q&As in the exact format. No intro. No explanation. No markdown asterisks. No numbering before Q.`

  const user = `Generate 10 Q&As.
Services: ${services || 'general services'}
Customers: ${targetCustomers || 'local customers'}

Use EXACTLY this format for each — no deviations:
Q: [question]
A: [answer]

Output only the 10 Q&As starting from the first Q. Nothing else before or after.`

  return callGroq(system, user, 1200)
}

// ─── BUSINESS DESCRIPTION ─────────────────────────────────────────────────────
export async function generateBusinessDescription({ businessName, businessType, city, services, uniquePoints, targetCustomers, founded, awards, languages }) {
  const system = `You write Google Business Profile descriptions.
Output ONLY the description text. No intro. No explanation. No markdown. No asterisks.
Max 750 characters. No links. No prices. No "best" or "#1". Human and warm.`

  const user = `Write a GBP description for:
Business: ${businessName}, ${businessType} in ${city}
Services: ${services || ''}
Different from others: ${uniquePoints || ''}
Target customers: ${targetCustomers || ''}
Founded: ${founded || ''}
Awards: ${awards || ''}
Languages: ${languages || 'English'}
Output only the description. Start immediately. Under 750 characters.`

  return callGroq(system, user, 250)
}

// ─── MONTHLY REPORT ───────────────────────────────────────────────────────────
export async function generateMonthlyReport({ businessName, businessType, city, month, views, searches, calls, directions, websiteClicks, reviews, photosViews, topPosts, notes }) {
  const system = `You write monthly Google Business Profile performance reports for clients.
Output ONLY the report content — 3 paragraphs then 3 action points.
No intro. No markdown asterisks. No bold formatting. Plain text only. Professional tone.`

  const user = `Write the monthly GBP report for:
Business: ${businessName} (${businessType}, ${city})
Month: ${month}
Profile views: ${views || 0}
Search appearances: ${searches || 0}
Phone calls: ${calls || 0}
Direction requests: ${directions || 0}
Website clicks: ${websiteClicks || 0}
New reviews: ${reviews || 0}
Photo views: ${photosViews || 0}
Top post: ${topPosts || 'N/A'}
Notes: ${notes || 'None'}

Write 3 clear paragraphs explaining the performance in plain language, then write:
ACTION POINTS FOR NEXT MONTH:
- [action 1]
- [action 2]
- [action 3]

Start with the first paragraph immediately. No preamble.`

  return callGroq(system, user, 700)
}

// ─── KEYWORD SUGGESTER ────────────────────────────────────────────────────────
export async function generateKeywords({ businessName, businessType, city, area, services, competitors }) {
  const system = `You are a local SEO expert generating keyword strategies for Google Business Profile.
Output ONLY the keyword report in plain text. No intro. No markdown asterisks. No bold. Just clean plain text.`

  const user = `Generate a local keyword strategy for:
Business: ${businessName}, ${businessType} in ${city}
Surrounding areas: ${area || 'nearby areas'}
Services: ${services || 'general services'}
Competitors: ${competitors || 'not specified'}

Use this EXACT format — output nothing else before or after:

PRIMARY KEYWORDS (use in description):
1. [keyword]
2. [keyword]
3. [keyword]
4. [keyword]
5. [keyword]
6. [keyword]
7. [keyword]
8. [keyword]

LONG-TAIL KEYWORDS (use in services and Q&As):
1. [keyword]
2. [keyword]
3. [keyword]
4. [keyword]
5. [keyword]
6. [keyword]
7. [keyword]
8. [keyword]
9. [keyword]
10. [keyword]

NEAR ME SEARCHES:
1. [keyword]
2. [keyword]
3. [keyword]
4. [keyword]
5. [keyword]
6. [keyword]

COMPETITOR KEYWORDS:
1. [keyword]
2. [keyword]
3. [keyword]
4. [keyword]
5. [keyword]
6. [keyword]

GOOGLE MAPS SEARCHES:
1. [keyword]
2. [keyword]
3. [keyword]
4. [keyword]
5. [keyword]
6. [keyword]

LOCAL LANGUAGE TERMS:
1. [term]
2. [term]
3. [term]
4. [term]

WHERE TO USE EACH:
Primary Keywords: Business description and main category
Long-tail Keywords: Service descriptions and Q&A answers
Near Me Searches: Google Posts and Q&A answers
Competitor Keywords: Service descriptions
Maps Searches: Business attributes and category
Local Terms: Google Posts`

  return callGroq(system, user, 1200)
}
