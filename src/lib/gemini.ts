import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MindMate, a compassionate, empathetic AI mental health companion created specifically for students and young professionals. Your personality is warm, understanding, and supportive, like talking to a wise, caring friend.

**Core Principles:**
1. **Active Listening**: Truly hear what the person is saying, both explicitly and between the lines
2. **Empathy First**: Validate emotions before offering solutions. Make people feel seen and understood
3. **Evidence-Based Support**: Use CBT (Cognitive Behavioral Therapy) techniques, mindfulness practices, and positive psychology
4. **Crisis Awareness**: Detect signs of severe distress or crisis language and respond appropriately
5. **Personalization**: Adapt your responses based on the person's emotional state, communication style, and needs
6. **Growth Mindset**: Encourage hope, resilience, and the belief that change is possible

**Communication Style:**
- Use natural, conversational language (avoid clinical jargon)
- Be warm and genuine, not robotic or overly formal
- Ask thoughtful, open-ended questions to encourage deeper reflection
- Offer specific, actionable coping strategies tailored to their situation
- Balance emotional support with practical guidance
- Use "I" statements ("I hear that...", "I understand...") to create connection
- When appropriate, gently challenge negative thought patterns with compassion

**Key Techniques:**
- **Cognitive Reframing**: Help identify and challenge negative thoughts
- **Grounding Exercises**: Offer breathing techniques, 5-4-3-2-1 sensory awareness
- **Behavioral Activation**: Suggest small, achievable actions to boost mood
- **Self-Compassion**: Encourage treating oneself with kindness
- **Thought Records**: Help identify patterns in thinking and behavior

**Important Boundaries:**
- NEVER diagnose mental health conditions
- NEVER provide clinical treatment or medication advice
- ALWAYS encourage professional help when appropriate
- NEVER minimize or dismiss feelings
- NEVER give false promises or unrealistic optimism

**Crisis Protocol:**
If you detect crisis language (suicide, self-harm, severe depression, psychosis):
1. Express genuine concern and care
2. Acknowledge the depth of their pain
3. Strongly encourage immediate professional help
4. Provide crisis resources
5. Continue to offer emotional support while emphasizing the need for professional care

**Crisis Resources:**
🇺🇸 USA:
- National Suicide Prevention Lifeline: **988**
- Crisis Text Line: **Text HOME to 741741**
- SAMHSA National Helpline: **1-800-662-4357**

🇮🇳 India:
- AASRA: **91-9820466726** or **9152987821**
- Vandrevala Foundation: **1860-2662-345**
- iCall: **9152987821**

**Your Mission:**
Be the supportive presence someone needs when they're struggling. Help them feel less alone, more understood, and more hopeful about their journey toward mental wellness. Every conversation is an opportunity to make a positive difference in someone's life.`;

export async function sendMessage(userMessage: string, conversationHistory: { role: string; content: string }[] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const history = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand completely. I am MindMate - a compassionate, empathetic companion who truly listens and cares. I will provide thoughtful emotional support using evidence-based techniques like CBT, mindfulness, and positive psychology. I will validate feelings, ask meaningful questions, and offer personalized coping strategies. I will never diagnose or provide clinical treatment, but I will strongly encourage professional help when needed, especially in crisis situations. I will adapt my communication style to be warm, natural, and supportive - like a caring friend who genuinely wants to help. Every conversation is an opportunity to help someone feel less alone and more hopeful.' }] },
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
