
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AnimatedWaveform from './AnimatedWaveform';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';

interface VoiceAssistantProps {
  className?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: "Hello, I'm Jarvis. How can I assist you today?",
    sender: 'jarvis',
    timestamp: new Date(),
  },
];

const RESPONSES: Record<string, string[]> = {
  'weather': [
    "The weather today is sunny with a high of 75°F.",
    "It looks like there's a chance of rain later today with temperatures around 68°F.",
    "Today's forecast shows clear skies with temperatures reaching 82°F."
  ],
  'time': [
    "The current time is {time}.",
    "It's currently {time}.",
    "Right now, it's {time}."
  ],
  'joke': [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "I told my wife she was drawing her eyebrows too high. She looked surprised."
  ],
  'hello': [
    "Hello! How can I assist you today?",
    "Hi there! What can I help you with?",
    "Greetings! How may I be of service?"
  ],
  'name': [
    "I'm Jarvis, your virtual assistant.",
    "My name is Jarvis. I'm here to help you.",
    "I am Jarvis, at your service."
  ],
  'help': [
    "I can help with various tasks like checking the weather, telling the time, or providing information on different topics. Just ask!",
    "You can ask me questions, request information, or just chat. How may I assist you?",
    "I'm here to assist you with information, tasks, and more. What would you like to know?"
  ],
  'thanks': [
    "You're welcome! Is there anything else I can help with?",
    "My pleasure! Let me know if you need anything else.",
    "Happy to help! Feel free to ask if you have other questions."
  ],
  'default': [
    "I'm still learning, but I'd be happy to help with that if I can.",
    "I don't have specific information on that yet, but I'm designed to learn and improve.",
    "I'm not sure I understand. Could you please rephrase your question?",
    "That's an interesting question. Let me look into that for you."
  ]
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => setInputValue(text),
    onEnd: () => console.log('Speech recognition ended'),
    onError: (error) => {
      console.error('Speech recognition error:', error);
      toast({
        title: "Speech Recognition Error",
        description: "There was an issue with speech recognition. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const { speak, isSpeaking } = useSpeechSynthesis({
    onStart: () => console.log('Speech started'),
    onEnd: () => console.log('Speech ended'),
    onError: (error) => {
      console.error('Speech synthesis error:', error);
      toast({
        title: "Speech Synthesis Error",
        description: "There was an issue with speech synthesis. Please try again.",
        variant: "destructive",
      });
    },
    rate: 1.0,
    pitch: 1.0,
  });

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setProcessing(true);
    
    // Simulate response processing
    setTimeout(() => {
      const jarvisResponse = generateResponse(userMessage.text);
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: jarvisResponse,
        sender: 'jarvis',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setProcessing(false);
      
      // Speak the response
      speak(jarvisResponse);
    }, 1000);
  };

  const generateResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    let responseArray: string[] | undefined;
    
    if (lowerMessage.includes('weather')) {
      responseArray = RESPONSES.weather;
    } else if (lowerMessage.includes('time')) {
      responseArray = RESPONSES.time.map(r => r.replace('{time}', getCurrentTime()));
    } else if (lowerMessage.includes('joke')) {
      responseArray = RESPONSES.joke;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      responseArray = RESPONSES.hello;
    } else if (lowerMessage.includes('name') || lowerMessage.includes('who are you')) {
      responseArray = RESPONSES.name;
    } else if (lowerMessage.includes('help')) {
      responseArray = RESPONSES.help;
    } else if (lowerMessage.includes('thank')) {
      responseArray = RESPONSES.thanks;
    } else {
      responseArray = RESPONSES.default;
    }
    
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`px-4 py-2 max-w-[80%] shadow-soft ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'glass-morphism'
                }`}
              >
                <p>{message.text}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </Card>
            </motion.div>
          ))}
          
          {processing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <Card className="px-4 py-3 glass-morphism shadow-soft">
                <AnimatedWaveform isActive={true} color="#2196F3" />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t glass-morphism">
        <div className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary"
            disabled={isListening}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={toggleListening} 
                  variant={isListening ? "destructive" : "secondary"}
                  size="icon"
                  className="relative"
                >
                  {isListening && <span className="circle-ripple opacity-20"></span>}
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListening ? 'Stop Listening' : 'Start Listening'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleSendMessage} 
                  variant="default"
                  size="icon"
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send Message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-center text-sm text-muted-foreground"
          >
            <p>Listening... Say something</p>
            <AnimatedWaveform isActive={true} className="mt-1 mx-auto" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
