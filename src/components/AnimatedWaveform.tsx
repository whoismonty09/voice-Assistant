
import React, { useEffect, useState } from 'react';

interface AnimatedWaveformProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
  color?: string;
}

const AnimatedWaveform: React.FC<AnimatedWaveformProps> = ({
  isActive,
  className = '',
  barCount = 9,
  color = 'currentColor',
}) => {
  const [bars, setBars] = useState<number[]>([]);
  
  useEffect(() => {
    // Create array for the specified number of bars
    setBars(Array.from({ length: barCount }, (_, i) => i));
  }, [barCount]);

  return (
    <div className={`flex items-end justify-center h-8 gap-1 ${className}`}>
      {bars.map((i) => (
        <div
          key={i}
          className={`waveform-bar w-1 rounded-full ${isActive ? 'opacity-100' : 'opacity-40'}`}
          style={{
            backgroundColor: color,
            height: isActive ? `${Math.random() * 60 + 40}%` : '30%',
            animationPlayState: isActive ? 'running' : 'paused',
          }}
        ></div>
      ))}
    </div>
  );
};

export default AnimatedWaveform;
