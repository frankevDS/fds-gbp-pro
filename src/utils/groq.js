import { getSettings } from './storage.js'
const GROQ_MODEL = 'qwen/qwen3.6-27b'
async function callGroq(system, user, maxTokens=1024) {
  const key = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API || getSettings().groqKey
  if (!key) throw new Error('NO_KEY')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST',
    headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:GROQ_MODEL,max_tokens:maxTokens,temperature:0.7,reasoning_effort:'none',messages:[{role:'system',content:system},{role:'user',content:user}]})
  })
  if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message||`Groq error ${res.status}`) }
  const data = await res.json()
  let content = data.choices?.[0]?.message?.content?.trim()||''
  content = content.replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1').trim()
  return content
}
export async function generateReviewResponse({reviewText,reviewerName,rating,businessName,businessType,city}){
  return callGroq(`You are a Google Business Profile manager for ${businessName}, a ${businessType} in ${city}. Write ONLY the final owner response — no thinking, no notes. Under 150 words. Thank ${reviewerName||'the customer'} by name. Sound human. No markdown.`,`Write the owner response for this ${rating}-star review from ${reviewerName||'a customer'}: "${reviewText}"`,200)
}
export async function generateGooglePost({postType,businessName,businessType,city,topic,offer,eventDate}){
  const guide={'Whats New':'Share a business update. End with call to action.','Offer':`Limited-time offer: ${offer||topic}. Include urgency.`,'Event':`Promote event: ${topic}. Date: ${eventDate||'upcoming'}.`,'Product':`Highlight: ${topic}. Focus on benefits.`}
  return callGroq(`You write Google Business Profile posts for ${businessName}, a ${businessType} in ${city}. Output ONLY the post text. Under 300 words. No hashtags. No markdown.`,`Write a ${postType} Google Post. ${guide[postType]||''} Topic: ${topic||offer||'general update'}`,400)
}
export async function generateQandAs({businessName,businessType,city,services,targetCustomers}){
  return callGroq(`Generate Q&As for ${businessName}, ${businessType} in ${city}. Output ONLY 10 Q&As. No intro. No markdown.`,`Generate 10 Q&As.\nServices: ${services||'general'}\nCustomers: ${targetCustomers||'local'}\nFormat:\nQ: [question]\nA: [answer]`,1200)
}
export async function generateBusinessDescription({businessName,businessType,city,services,uniquePoints,targetCustomers,founded,awards,languages}){
  return callGroq('Write a Google Business Profile description. Output ONLY the description. Max 750 characters. No links. No prices. No "best" or "#1". Human and warm.',`Business: ${businessName}, ${businessType} in ${city}\nServices: ${services||''}\nDifferent: ${uniquePoints||''}\nCustomers: ${targetCustomers||''}\nFounded: ${founded||''}\nAwards: ${awards||''}\nLanguages: ${languages||'English'}`,250)
}
export async function generateMonthlyReport({businessName,businessType,city,month,views,searches,calls,directions,websiteClicks,reviews,photosViews,topPosts,notes}){
  return callGroq('Write a monthly GBP performance report. 3 paragraphs then 3 action points. Plain text only. No markdown.',`Business: ${businessName} (${businessType}, ${city})\nMonth: ${month}\nViews: ${views||0}\nSearches: ${searches||0}\nCalls: ${calls||0}\nDirections: ${directions||0}\nWebsite clicks: ${websiteClicks||0}\nNew reviews: ${reviews||0}\nPhoto views: ${photosViews||0}\nTop post: ${topPosts||'N/A'}\nNotes: ${notes||'None'}`,700)
}
export async function generateKeywords({businessName,businessType,city,area,services,competitors}){
  return callGroq('You are a local SEO expert. Output ONLY the keyword report. No intro. No markdown asterisks.',`Generate keyword strategy for:\nBusiness: ${businessName}, ${businessType} in ${city}\nAreas: ${area||'surrounding'}\nServices: ${services||'general'}\nCompetitors: ${competitors||'not specified'}\n\nFormat:\nPRIMARY KEYWORDS:\n1-8.\n\nLONG-TAIL KEYWORDS:\n1-10.\n\nNEAR ME SEARCHES:\n1-6.\n\nCOMPETITOR KEYWORDS:\n1-6.\n\nGOOGLE MAPS SEARCHES:\n1-6.\n\nLOCAL TERMS:\n1-4.\n\nWHERE TO USE:\n[guide]`,1200)
}
