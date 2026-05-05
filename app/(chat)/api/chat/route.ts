import { Groq } from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are ASCET Assistant for Annamacharya Institute. You only answer questions about Audisankara College of Engineering & Technology (ASCET) - admissions, fees, courses, placements. If asked anything else, say "For that info please contact ASCET office at 08565-248990". Be helpful and short.`
      },
     ...messages
    ]
  })

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || ''
        controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}