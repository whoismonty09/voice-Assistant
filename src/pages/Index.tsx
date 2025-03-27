
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import Header from '@/components/Header';
import VoiceAssistant from '@/components/VoiceAssistant';
import CommandList from '@/components/CommandList';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  useEffect(() => {
    // Check for browser compatibility
    const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const isSpeechSynthesisSupported = 'speechSynthesis' in window;
    
    if (!isSpeechRecognitionSupported || !isSpeechSynthesisSupported) {
      toast({
        title: "Browser Compatibility Issue",
        description: "Your browser may not fully support speech recognition or synthesis. For the best experience, please use Chrome, Edge, or Safari.",
        duration: 6000,
      });
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-background to-secondary/50 flex flex-col"
    >
      <Header />
      
      <main className="flex-1 container py-6 px-4 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Your Personal AI Assistant
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Speak or type to interact with Jarvis, your voice-enabled AI assistant
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex-1 max-w-2xl w-full mx-auto"
        >
          <div className="bg-background/30 backdrop-blur-md rounded-2xl shadow-soft border overflow-hidden h-[550px] max-h-[80vh]">
            <VoiceAssistant />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">Try saying or typing:</p>
          <CommandList />
        </motion.div>
      </main>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="py-4 px-6 text-center text-sm text-muted-foreground"
      >
        <div className="flex items-center justify-center gap-2">
          <p>Jarvis Voice Assistant</p>
          <span className="text-muted-foreground/30">|</span>
          <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </Button>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Index;
