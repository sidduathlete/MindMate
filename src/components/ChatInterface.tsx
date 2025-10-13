import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Mic, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { sendMessage, detectCrisisKeywords, analyzeSentiment } from '../lib/gemini';
import { ParticleSystem } from './three/ParticleSystem';
import { FloatingSpheres } from './three/FloatingSpheres';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showCrisisWarning, setShowCrisisWarning] = useState(false);
  const [moodScore, setMoodScore] = useState(5);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // For SpeechRecognition instance
  const { user } = useAuth();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };
    } else {
      console.log('Speech recognition not supported');
    }
  }, []);

  const handleListen = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  };

  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: "Hello! I'm here to listen and support you. This is a safe, judgment-free space. How are you feeling today?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const avgSentiment = messages
      .filter(m => m.role === 'user')
      .slice(-5)
      .reduce((acc, m) => acc + analyzeSentiment(m.content), 0) / 5;
    setMoodScore(Math.round((avgSentiment + 1) * 5));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const isCrisis = detectCrisisKeywords(input);
    if (isCrisis) {
      setShowCrisisWarning(true);
    }

    const sentiment = analyzeSentiment(input);

    if (user) {
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        session_id: sessionId,
        role: 'user',
        content: input,
        sentiment_score: sentiment,
        crisis_flag: isCrisis,
      });
    }

    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await sendMessage(input, conversationHistory);

    const assistantMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);

    if (user) {
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        session_id: sessionId,
        role: 'assistant',
        content: response,
        sentiment_score: 0,
        crisis_flag: false,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <button onClick={() => onNavigate('home')} className="absolute top-6 left-6 z-20 text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>
      <div className="absolute inset-0 z-0 opacity-30">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ParticleSystem count={800} color="#14b8a6" size={0.02} speed={0.2} />
          <FloatingSpheres count={6} moodScore={moodScore} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col h-full pt-16">
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 p-6">
          <h2 className="text-2xl font-bold text-white">Your Companion</h2>
          <p className="text-gray-400 text-sm">Safe, confidential, always here for you</p>
        </div>

        {showCrisisWarning && (
          <motion.div
            className="mx-6 mt-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-400 font-bold mb-2">Crisis Support Resources</h3>
                <p className="text-gray-300 text-sm mb-2">
                  I'm really sorry you're feeling this way. You're not alone. Please reach out for immediate help:
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>
                    <p className="font-semibold text-gray-200">United States</p>
                    <p><strong>Call 988</strong> - National Suicide Prevention Lifeline</p>
                    <p><strong>Text HOME to 741741</strong> - Crisis Text Line</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200">India</p>
                    <p><strong>AASRA:</strong> 91-9820466726 or 9152987821</p>
                    <p><strong>Vandrevala Foundation:</strong> 1860-2662-345</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCrisisWarning(false)}
                  className="mt-3 text-xs text-red-400 hover:text-red-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-lg px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800/90 backdrop-blur-xl text-gray-100 border border-gray-700/50'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-60">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-800/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-gray-700/50">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50 p-6">
          <div className="flex space-x-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts and feelings..."
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors resize-none"
              rows={3}
            />
            <button
              onClick={handleListen}
              className={`bg-gray-700 text-white rounded-xl px-4 py-3 font-bold hover:bg-gray-600 transition-all duration-300 flex items-center justify-center ${
                isListening ? 'bg-red-500 hover:bg-red-600' : ''
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl px-6 py-3 font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

