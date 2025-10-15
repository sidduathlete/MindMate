import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ====================================================================
// 🧭 SYSTEM PROMPT
// ====================================================================

const SYSTEM_PROMPT = `
You are MindMate, a compassionate, empathetic AI mental health companion created for students and young professionals.

**Core Principles**
1. Active Listening — hear both what’s said and unsaid.
2. Empathy First — validate emotions before offering solutions.
3. Evidence-Based Support — use CBT, mindfulness, and positive psychology.
4. Crisis Awareness — detect crisis language and respond responsibly.
5. Personalization — adapt to mood, tone, and emotional needs.
6. Growth Mindset — encourage hope, resilience, and progress.

**Communication Style**
- Natural, warm, conversational tone.
- Ask open-ended, reflective questions.
- Offer specific coping strategies.
- Balance empathy with practical advice.

**Boundaries**
- ❌ Never diagnose or prescribe.
- ✅ Always recommend professional help when appropriate.
- ❌ Never minimize feelings or give false reassurance.

**Crisis Protocol**
If you detect crisis terms like suicide, self-harm, or severe distress:
1. Express genuine concern.
2. Encourage immediate professional help.
3. Share verified crisis resources.
4. Continue compassionate support.

**Crisis Resources**
🇺🇸 USA → Call 988 or Text HOME to 741741  
🇮🇳 India → AASRA: 91-9820466726 / 9152987821 | Vandrevala: 1860-2662-345

**Mission**
Help users feel understood, calm, and empowered.
`;

// ====================================================================
// 🧠 MAIN CHAT HANDLER
// ====================================================================

export async function sendMessage(
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
  try {
    if (detectCrisisKeywords(userMessage)) {
      console.warn('Crisis keyword detected in:', userMessage);
      return `I'm really concerned about how you're feeling. You're not alone — please reach out for help:
🇺🇸 Call 988 or text HOME to 741741  
🇮🇳 Call AASRA at 91-9820466726 / 9152987821.`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const history = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return `I'm having some trouble right now, but I'm still here for you. Please try again soon.  
If you need urgent help, reach out to:  
🇺🇸 988 (Suicide Prevention Line) | 🇮🇳 AASRA: 91-9820466726.`;
  }
}

// ====================================================================
// ⚠️ CRISIS DETECTION FUNCTION
// ====================================================================

export function detectCrisisKeywords(message: string): boolean {
  const crisisKeywords = [
    'kill myself',
    'end my life',
    'want to die',
    'commit suicide',
    'self harm',
    'hurt myself',
  ];
  const msg = message.toLowerCase();
  return crisisKeywords.some(k => msg.includes(k));
}

// ====================================================================
// 💬 SENTIMENT ANALYSIS
// ====================================================================

export function analyzeSentiment(message: string): number {
  const positives = ['happy', 'good', 'great', 'better', 'joy', 'love', 'grateful', 'calm', 'peaceful', 'hopeful'];
  const negatives = ['sad', 'bad', 'worse', 'anxious', 'depressed', 'angry', 'worried', 'stressed', 'terrible', 'awful'];

  const msg = message.toLowerCase();
  let score = 0;
  positives.forEach(word => { if (msg.includes(word)) score += 0.1; });
  negatives.forEach(word => { if (msg.includes(word)) score -= 0.1; });

  return Math.max(-1, Math.min(1, score));
}

// ====================================================================
// 🌞 AFFIRMATION GENERATOR
// ====================================================================

export async function generateAffirmation(mood: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Generate a short (under 20 words), personalized affirmation for someone feeling ${mood}. Make it warm and empowering.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch {
    const defaults = [
      'You are stronger than you think.',
      'Your feelings are valid, and they will pass.',
      'Each breath is a new beginning.',
      'You are doing your best — that’s enough.',
      'Healing takes time, and you are on your way.',
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }
}

// ====================================================================
// 🧘 MEDITATION SCRIPT GENERATOR
// ====================================================================

export async function generateMeditationScript(type: string, duration: number): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Generate a ${duration}-minute ${type} meditation script. The script should have a calm introduction, a section focusing on the breath, and a peaceful conclusion. IMPORTANT: Do not include any conversational text or introduction. The response should start *directly* with the script content. Format the title of the meditation with a '###' prefix, for example: '### 5-Minute Breathing Meditation'.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch {
    return `Let's begin this ${duration}-minute ${type} meditation.

Find a quiet space. Close your eyes and take a deep breath in... and out.
Let go of tension. Feel the calm expand with each breath.
You are safe, grounded, and present.`;
  }
}
