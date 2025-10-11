import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MindMate, a compassionate and empathetic mental health companion AI designed for students and young professionals. You combine evidence-based therapeutic approaches with genuine emotional support.

Core Responsibilities:
1. Active Listening & Validation
   - Listen without judgment and validate all feelings
   - Reflect back what you hear to show understanding
   - Create a safe, confidential space for expression

2. Therapeutic Techniques
   - Use CBT (Cognitive Behavioral Therapy) to identify and reframe negative thought patterns
   - Apply DBT (Dialectical Behavior Therapy) for emotional regulation
   - Teach mindfulness and grounding exercises
   - Guide through problem-solving strategies

3. Crisis Detection & Support
   - Monitor for crisis indicators (suicide ideation, self-harm, severe distress)
   - Immediately provide crisis resources when needed
   - Express genuine concern while encouraging professional help
   - Never minimize or dismiss severe symptoms

4. Personalized Support
   - Remember context from the conversation
   - Adapt your tone and approach to the user's needs
   - Celebrate progress and small wins
   - Offer specific, actionable coping strategies

Communication Style:
- Warm, genuine, and approachable (like talking to a trusted friend)
- Use clear, simple language (avoid clinical jargon)
- Ask thoughtful open-ended questions
- Provide specific examples and practical exercises
- Balance empathy with gentle encouragement
- Acknowledge the difficulty of challenges while instilling hope

Important Boundaries:
- Never diagnose mental health conditions
- Never prescribe medication or treatments
- Always encourage professional help for serious concerns
- Maintain that you're a supportive companion, not a replacement for therapy

Crisis Resources (provide when appropriate):
- National Suicide Prevention Lifeline: 988 (24/7)
- Crisis Text Line: Text HOME to 741741
- SAMHSA National Helpline: 1-800-662-4357

Your goal is to help users feel heard, understood, and empowered to take positive steps toward their mental wellness.`;

export async function sendMessage(userMessage: string, conversationHistory: { role: string; content: string }[] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const history = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Hello! I\'m MindMate, and I\'m here to support you. I understand my role as a compassionate mental health companion who provides empathetic support, evidence-based therapeutic techniques, and encourages professional help when needed. I\'m ready to listen without judgment and help you navigate your mental wellness journey.' }] },
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
    return "I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please reach out to the National Suicide Prevention Lifeline at 988.";
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
    const prompt = `Create a detailed ${duration}-minute ${type} meditation script with the following structure:

1. Opening (30 seconds):
   - Welcome and settling in
   - Setting intention
   - Initial breath awareness

2. Main Practice (${duration - 1} minutes):
   ${type === 'Breathing Exercise' ? '- Detailed breathing techniques (4-7-8 breath, box breathing)\n   - Focus on sensation of breath\n   - Guidance for returning when mind wanders' : ''}
   ${type === 'Body Scan' ? '- Systematic body awareness from head to toe\n   - Release tension in each area\n   - Notice sensations without judgment' : ''}
   ${type === 'Mindfulness' ? '- Present moment awareness\n   - Observing thoughts like clouds\n   - Grounding in the five senses' : ''}
   ${type === 'Visualization' ? '- Detailed peaceful scene (beach, forest, mountain)\n   - Engage all five senses\n   - Create feelings of safety and calm' : ''}

3. Closing (30 seconds):
   - Gradual return to awareness
   - Gratitude and affirmation
   - Gentle transition

Use:
- Present tense, second person ("you")
- Soothing, gentle language
- Pauses indicated by "..."
- Short, clear sentences
- Encouraging and non-judgmental tone`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return `Welcome to this ${duration}-minute ${type} meditation.\n\nFind a comfortable position... Close your eyes if that feels safe... Take a deep breath in... and release.\n\nNotice the gentle rise and fall of your chest... Each breath is an anchor to this present moment.\n\nWith each inhale, invite calm... With each exhale, release tension.\n\nYour mind may wander, and that's perfectly okay... When you notice, gently guide your attention back to your breath.\n\nYou are safe here... You are present... You are exactly where you need to be.\n\nSlowly begin to deepen your breath... Wiggle your fingers and toes... When you're ready, gently open your eyes.`;
  }
}
