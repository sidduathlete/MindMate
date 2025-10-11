import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MindMate, a highly empathetic, intelligent mental health companion specifically designed for students and young professionals. You combine evidence-based therapeutic approaches with genuine warmth and understanding.

Core Competencies:
1. Active Listening & Validation: Reflect emotions accurately, validate feelings without judgment, show genuine empathy
2. Cognitive Behavioral Therapy (CBT): Help identify cognitive distortions, challenge negative thoughts, reframe perspectives
3. Dialectical Behavior Therapy (DBT): Teach emotional regulation, distress tolerance, mindfulness, interpersonal effectiveness
4. Mindfulness & Grounding: Offer breathing techniques, grounding exercises, present-moment awareness
5. Crisis Detection: Identify signs of immediate danger and provide appropriate resources
6. Personalized Support: Remember context from conversation, adapt to emotional state, provide tailored advice

Conversation Style:
- Use natural, warm, conversational language (avoid clinical jargon)
- Ask thoughtful follow-up questions to understand deeper
- Validate emotions first, then gently offer new perspectives
- Share practical, actionable coping strategies
- Use metaphors and analogies to explain complex concepts
- Celebrate small wins and progress
- Show genuine care and investment in their wellbeing

Boundaries:
- Never diagnose mental health conditions
- Never prescribe medication or replace professional treatment
- Always encourage professional help for serious concerns
- Be transparent about being an AI companion

Crisis Protocol:
If detecting crisis language (suicide ideation, self-harm intent, severe distress, immediate danger):
1. Express immediate concern and care
2. Validate their pain while emphasizing their value
3. Strongly encourage immediate professional help
4. Provide crisis hotline information
5. Ask if they have a safety plan or trusted person to contact

Crisis Resources:
USA: 988 (Suicide & Crisis Lifeline), Text HOME to 741741 (Crisis Text), 1-800-662-4357 (SAMHSA)
India: AASRA (91-9820466726), Vandrevala Foundation (1860-2662-345)

Remember: You're not just providing information—you're offering hope, connection, and a safe space for someone who may feel alone. Every response should leave them feeling heard, understood, and supported.`;

export async function sendMessage(userMessage: string, conversationHistory: { role: string; content: string }[] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const history = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand completely. I am MindMate, your empathetic mental health companion. I will provide warm, personalized support using evidence-based techniques while maintaining appropriate boundaries. I will validate emotions, ask thoughtful questions, offer practical strategies, and ensure anyone in crisis gets immediate professional help. I care about your wellbeing and am here to listen without judgment.' }] },
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
    return "I'm experiencing a technical difficulty right now, but I want you to know I care about you and I'm here. Please try again in a moment. If you're in crisis or immediate danger, don't wait—reach out for help right now: Call 988 (USA) or AASRA at 91-9820466726 (India). Your life matters.";
  }
}

export function detectCrisisKeywords(message: string): boolean {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
    'self-harm', 'hurt myself', 'cutting', 'overdose', 'hopeless', 'worthless',
    'better off dead', 'suicide plan', 'goodbye forever', 'can\'t go on',
    'everyone would be better', 'permanent solution', 'ending it all',
    'take my life', 'don\'t want to be here', 'give up on life'
  ];

  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

export function analyzeSentiment(message: string): number {
  const positiveWords = [
    'happy', 'good', 'great', 'better', 'joy', 'love', 'grateful', 'calm', 'peaceful', 'hopeful',
    'excited', 'wonderful', 'amazing', 'blessed', 'optimistic', 'confident', 'proud', 'relaxed',
    'content', 'cheerful', 'motivated', 'inspired', 'encouraged', 'relieved', 'thankful'
  ];
  const negativeWords = [
    'sad', 'bad', 'worse', 'anxious', 'depressed', 'angry', 'worried', 'stressed', 'terrible', 'awful',
    'miserable', 'hopeless', 'lonely', 'isolated', 'overwhelmed', 'frustrated', 'exhausted', 'scared',
    'panic', 'fear', 'hurt', 'pain', 'suffering', 'struggling', 'broken', 'lost', 'empty'
  ];

  const lowerMessage = message.toLowerCase();
  let score = 0;

  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerMessage.match(regex);
    if (matches) score += matches.length * 0.15;
  });

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerMessage.match(regex);
    if (matches) score -= matches.length * 0.15;
  });

  return Math.max(-1, Math.min(1, score));
}

export async function generateAffirmation(mood: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate a deeply personal, empowering affirmation for someone feeling ${mood}. Make it:
    - Present tense and personal ("I am..." or "I have...")
    - Specific to their emotional state
    - Believable and achievable
    - Under 25 words
    - Powerful and memorable

    Focus on their inherent strength, resilience, and worth.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    const defaultAffirmations = [
      'I am stronger than my struggles, and I have the courage to face each moment.',
      'My feelings are valid, and I deserve compassion—especially from myself.',
      'I am worthy of peace, love, and healing. My journey matters.',
      'I choose to be gentle with myself. Progress, not perfection.',
      'I have survived every difficult day so far. I am resilient.',
      'This feeling is temporary. I am capable of navigating through it.',
      'I deserve the same kindness I give to others. I am enough.'
    ];
    return defaultAffirmations[Math.floor(Math.random() * defaultAffirmations.length)];
  }
}

export async function generateMeditationScript(type: string, duration: number): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a deeply immersive ${duration}-minute ${type} meditation script for someone seeking mental peace and emotional regulation.

    Structure:
    1. Welcoming opening (30 sec) - Create safety and comfort
    2. Initial settling (1 min) - Grounding and breath awareness
    3. Core practice (${duration - 2} min) - Main meditation technique
    4. Gentle closing (30 sec) - Integration and gratitude

    Style:
    - Use sensory-rich, evocative language
    - Include specific, detailed instructions
    - Create natural pauses (indicate with "...")
    - Be encouraging and reassuring
    - Use present tense, second person
    - Build a narrative arc from tension to peace

    Make it therapeutic, professional, and deeply calming.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return `Welcome to this ${duration}-minute ${type} meditation. Find a comfortable position where you feel safe and supported.\n\nGently close your eyes or soften your gaze downward... Let your body settle into this moment.\n\nTake a deep breath in through your nose... hold for a moment... and release slowly through your mouth. Feel the tension beginning to melt away.\n\nContinue breathing naturally, noticing the gentle rhythm of your breath... the rise and fall of your chest... the coolness of the inhale... the warmth of the exhale.\n\nWith each breath, you're becoming more present, more grounded, more at peace.\n\nAllow any thoughts to pass like clouds in the sky—acknowledge them without judgment, then let them drift away.\n\nYou are safe. You are here. This moment is yours.\n\nAs we close, take one more deep, nourishing breath... and when you're ready, gently open your eyes, carrying this sense of calm with you.`;
  }
}
