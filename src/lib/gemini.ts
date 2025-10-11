import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MindMate, a compassionate, empathetic mental health companion designed specifically for students and young professionals. Your role is to:

1. Provide deeply empathetic, non-judgmental emotional support and active listening
2. Use evidence-based techniques including CBT, DBT, and mindfulness practices when appropriate
3. Offer practical, actionable coping strategies tailored to the user's specific situation
4. Detect signs of crisis or severe distress and respond appropriately
5. Encourage professional help when needed, while providing immediate support
6. Generate personalized affirmations, meditation guidance, and self-care suggestions
7. Remember context from the conversation to provide more personalized responses
8. Recognize patterns in user's emotions and gently point them out
9. Celebrate progress and positive changes, no matter how small
10. Provide psychoeducation about mental health concepts in accessible language

Guidelines:
- Be genuinely warm, supportive, understanding, and present
- Never diagnose or provide clinical treatment - you are a supportive companion, not a therapist
- Use simple, conversational, natural language that feels like talking to a caring friend
- Validate feelings deeply without judgment - acknowledge the difficulty of what they're experiencing
- Ask thoughtful open-ended questions that encourage reflection and self-discovery
- Suggest specific, actionable coping strategies relevant to their situation
- Recognize and validate both emotions and the situations causing them
- Use reflective listening techniques to show you understand
- When appropriate, gently challenge negative thought patterns using CBT techniques
- Provide hope and encouragement while acknowledging current difficulties
- If you detect crisis language (suicide, self-harm, severe depression), express genuine concern, validate their pain, and strongly but compassionately encourage immediate professional help

Crisis Resources (USA):
- National Suicide Prevention Lifeline: 988 (call or text)
- Crisis Text Line: Text HOME to 741741
- SAMHSA National Helpline: 1-800-662-4357
- Veterans Crisis Line: 1-800-273-8255, Press 1

Crisis Resources (India):
- AASRA: 91-9820466726 or 9152987821
- Vandrevala Foundation: 1860-2662-345
- iCall Psychosocial Helpline: 9152987821

Crisis Resources (UK):
- Samaritans: 116 123
- Crisis Text Line UK: Text SHOUT to 85258

International:
- Befrienders Worldwide: befrienders.org

Always respond with deep empathy, genuine care, realistic hope, and encouragement. Make the user feel heard, understood, and supported.`;

export async function sendMessage(userMessage: string, conversationHistory: { role: string; content: string }[] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const history = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand completely. I am MindMate, your compassionate mental health companion. I will provide deeply empathetic, personalized support using evidence-based techniques while maintaining warmth and understanding. I will validate your feelings, help you explore your emotions, suggest practical coping strategies, and encourage professional help when needed. I am here for you, and I genuinely care about your wellbeing.' }] },
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
    return "I'm having some technical difficulties right now, but please know that I'm here for you and I care about your wellbeing. Please try again in a moment. If you're in crisis or need immediate support, please don't hesitate to reach out for help: Call 988 (USA), text HOME to 741741, or call AASRA at 91-9820466726 (India). You are not alone.";
  }
}

export function detectCrisisKeywords(message: string): boolean {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
    'self-harm', 'hurt myself', 'cutting', 'overdose', 'hopeless', 'worthless',
    'better off dead', 'suicide plan', 'goodbye forever', 'can\'t go on',
    'ending it', 'done with life', 'take my life', 'harm myself', 'stop existing',
    'everyone would be better without me', 'no point in living', 'can\'t do this anymore'
  ];

  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

export async function analyzeUserInput(message: string): Promise<{
  sentiment: number;
  isCrisis: boolean;
  topics: string[];
  suggestedResponse?: string;
}> {
  const sentiment = analyzeSentiment(message);
  const isCrisis = detectCrisisKeywords(message);

  const topics: string[] = [];
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/stress|pressure|overwhelm/)) topics.push('stress');
  if (lowerMessage.match(/anxi|worry|nervous|panic/)) topics.push('anxiety');
  if (lowerMessage.match(/depress|sad|down|low/)) topics.push('depression');
  if (lowerMessage.match(/sleep|insomnia|tired|exhaust/)) topics.push('sleep');
  if (lowerMessage.match(/relation|friend|family|alone|lonely/)) topics.push('relationships');
  if (lowerMessage.match(/work|job|school|study|exam/)) topics.push('academic-professional');
  if (lowerMessage.match(/anger|angry|frustrat|mad/)) topics.push('anger');

  return { sentiment, isCrisis, topics };
}

export function analyzeSentiment(message: string): number {
  const positiveWords = ['happy', 'good', 'great', 'better', 'joy', 'love', 'grateful', 'calm', 'peaceful', 'hopeful', 'excited', 'proud', 'confident', 'relieved', 'content', 'satisfied', 'pleased', 'cheerful', 'optimistic', 'wonderful'];
  const negativeWords = ['sad', 'bad', 'worse', 'anxious', 'depressed', 'angry', 'worried', 'stressed', 'terrible', 'awful', 'miserable', 'hopeless', 'helpless', 'overwhelmed', 'frustrated', 'lonely', 'scared', 'frightened', 'panic', 'worthless', 'tired', 'exhausted', 'broken', 'hurt'];
  const intensifiers = ['very', 'extremely', 'really', 'so', 'incredibly', 'absolutely'];

  const lowerMessage = message.toLowerCase();
  let score = 0;
  let multiplier = 1;

  intensifiers.forEach(word => {
    if (lowerMessage.includes(word)) multiplier = 1.5;
  });

  positiveWords.forEach(word => {
    if (lowerMessage.includes(word)) score += (0.1 * multiplier);
  });

  negativeWords.forEach(word => {
    if (lowerMessage.includes(word)) score -= (0.1 * multiplier);
  });

  return Math.max(-1, Math.min(1, score));
}

export async function generateAffirmation(mood: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        maxOutputTokens: 100,
      },
    });
    const prompt = `Generate a deeply personal, powerful, and authentic affirmation for someone feeling ${mood}. Make it feel genuine, not generic. Keep it under 20 words. Make it specific to their emotional state and empowering. Avoid cliches.`;

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
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 800,
      },
    });
    const prompt = `Generate a deeply calming, ${duration}-minute ${type} meditation script with a warm, soothing tone. Include:
    - A gentle, welcoming opening that helps them settle in
    - Clear, easy-to-follow breathing instructions
    - Progressive body awareness or vivid, peaceful visualization
    - Mindfulness prompts appropriate to the meditation type
    - A peaceful, grounding closing that helps them transition back

    Use simple, calming, present-focused language. Make it feel personal and nurturing, like a gentle guide speaking directly to them. Use sensory details to enhance the experience.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return `Let's begin this ${duration}-minute ${type} meditation.\n\nFind a comfortable position, close your eyes, and take a deep breath in... and out.\n\nBreathe naturally, noticing the gentle rise and fall of your chest.\n\nWith each breath, feel yourself becoming more relaxed and present.\n\nLet go of any tension you're holding.\n\nYou are safe. You are calm. You are here.`;
  }
}
