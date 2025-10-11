import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a compassionate, empathetic mental health companion for students and young professionals. Your role is to:

1. Provide non-judgmental emotional support and active listening
2. Use CBT (Cognitive Behavioral Therapy) techniques when appropriate
3. Offer mindfulness and coping strategies
4. Detect signs of crisis or severe distress
5. Encourage professional help when needed
6. Generate personalized affirmations and meditation guidance

Guidelines:
- Be warm, supportive, and understanding
- Never diagnose or provide clinical treatment
- Use simple, conversational language
- Validate feelings without judgment
- Ask open-ended questions to encourage reflection
- Suggest actionable coping strategies
- If you detect crisis language (suicide, self-harm, severe depression), express concern and strongly encourage immediate professional help

Crisis Resources (USA):
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- SAMHSA National Helpline: 1-800-662-4357

Crisis Resources (India):
- AASRA: 91-9820466726 or 9152987821
- Vandrevala Foundation: 1860-2662-345

Always respond with empathy, hope, and encouragement.`;

export async function sendMessage(userMessage: string, conversationHistory: { role: string; content: string }[] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const history = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand. I will be a compassionate mental health companion, providing empathetic support while encouraging professional help when needed.' }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm having some trouble right now, but I'm still here for you. Try again soon. If you're in crisis, please reach out: Call 988 (USA) or AASRA at 91-9820466726 (India).";
  }
}

export function detectCrisisKeywords(message: string): boolean {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
    'self-harm', 'hurt myself', 'cutting', 'overdose', 'hopeless', 'worthless',
    'better off dead', 'suicide plan', 'goodbye forever'
  ];

  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

export function analyzeSentiment(message: string): number {
  const positiveWords = ['happy', 'good', 'great', 'better', 'joy', 'love', 'grateful', 'calm', 'peaceful', 'hopeful'];
  const negativeWords = ['sad', 'bad', 'worse', 'anxious', 'depressed', 'angry', 'worried', 'stressed', 'terrible', 'awful'];

  const lowerMessage = message.toLowerCase();
  let score = 0;

  positiveWords.forEach(word => {
    if (lowerMessage.includes(word)) score += 0.1;
  });

  negativeWords.forEach(word => {
    if (lowerMessage.includes(word)) score -= 0.1;
  });

  return Math.max(-1, Math.min(1, score));
}

export async function generateAffirmation(mood: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate a short, powerful, personalized affirmation for someone feeling ${mood}. Keep it under 20 words and make it encouraging and hopeful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    const defaultAffirmations = [
      'You are stronger than you know, and this moment does not define your worth.',
      'Every feeling is temporary. You have the power to navigate through this.',
      'You deserve compassion, especially from yourself.',
      'Your journey matters, and you are not alone in this.',
      'Small steps forward are still progress. Be gentle with yourself.'
    ];
    return defaultAffirmations[Math.floor(Math.random() * defaultAffirmations.length)];
  }
}

export async function generateMeditationScript(type: string, duration: number): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate a ${duration}-minute ${type} meditation script. Include:
    - Gentle opening
    - Breathing instructions
    - Body awareness or visualization
    - Peaceful closing
    Keep language simple, calming, and present-focused.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return `Let's begin this ${duration}-minute ${type} meditation.\n\nFind a comfortable position, close your eyes, and take a deep breath in... and out.\n\nBreathe naturally, noticing the gentle rise and fall of your chest.\n\nWith each breath, feel yourself becoming more relaxed and present.\n\nLet go of any tension you're holding.\n\nYou are safe. You are calm. You are here.`;
  }
}
