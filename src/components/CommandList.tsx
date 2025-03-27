
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface CommandListProps {
  className?: string;
}

const COMMAND_EXAMPLES = [
  "What's the weather today?",
  "Set a timer for 5 minutes",
  "Tell me a joke",
  "What time is it?",
  "Play some music",
  "Tell me about artificial intelligence",
  "How tall is Mount Everest?",
  "What's on my calendar today?",
];

const CommandList: React.FC<CommandListProps> = ({ className = '' }) => {
  const [commands, setCommands] = useState<string[]>([]);

  useEffect(() => {
    // Randomly select 4 commands from the examples
    const shuffled = [...COMMAND_EXAMPLES].sort(() => 0.5 - Math.random());
    setCommands(shuffled.slice(0, 4));
  }, []);

  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {commands.map((command, index) => (
        <motion.div
          key={command}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Badge 
            variant="secondary" 
            className="px-3 py-1 text-sm font-medium rounded-full cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            "{command}"
          </Badge>
        </motion.div>
      ))}
    </div>
  );
};

export default CommandList;
