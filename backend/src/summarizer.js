import OpenAI from 'openai';

export function createOpenAIClient({ OPENAI_API_KEY }) {
  return new OpenAI({ apiKey: OPENAI_API_KEY });
}

export async function summarizeInput({ openai, content }) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Concise bullet summary under 100 words' },
      {
        role: 'user',
        content:
          `Summarize this input in under 100 words and use exactly this format:\nSummary: [text]\nFacts:\n- fact 1\n- fact 2\n- fact 3\n\nInput:\n${content}`
      }
    ]
  });

  return completion.choices?.[0]?.message?.content?.trim() || 'Summary: No summary generated\nFacts:\n- None';
}
