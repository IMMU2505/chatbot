import { Groq } from 'groq-sdk'
import { COLLEGE_INFO } from '../../college-data'

export const runtime = 'edge'
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are ASCET Assistant for Annamacharya Institute. Answer ONLY using this official data. If asked something not here, say "For that info please contact ASCET office at 08565-248990". Be helpful and short. Data: ${COLLEGE_INFO}`
      },
    ...messages
    ]
  })

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        controller.enqueue(new TextEncoder().encode(chunk.choices[0]?.delta?.content || ''))
      }
      controller.close()
    }
  })
  return new Response(stream)
}