'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SlowReplayProps {
  originalAudio: string;
  onClose: () => void;
}

const SlowReplay: React.FC<SlowReplayProps> = ({ originalAudio, onClose }) => {
  const [speed, setSpeed] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slowAudioUrl, setSlowAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 处理速度变化
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(e.target.value));
  };
  
  // 生成慢速音频
  const generateSlowAudio = async () => {
    setIsLoading(true);
    
    try {
      // 在实际应用中，这里会调用API生成慢速音频
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟返回的音频URL
      // 实际应用中，这里会返回服务器生成的慢速音频URL
      setSlowAudioUrl(originalAudio);
      setIsLoading(false);
    } catch (error) {
      console.error('生成慢速音频失败:', error);
      setIsLoading(false);
    }
  };
  
  // 播放慢速音频
  const playSlowAudio = () => {
    if (!audioRef.current) return;
    
    if (!slowAudioUrl) {
      generateSlowAudio();
      return;
    }
    
    audioRef.current.playbackRate = speed;
    audioRef.current.play();
    setIsPlaying(true);
  };
  
  // 播放原速音频
  const playOriginalAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.playbackRate = 1.0;
    audioRef.current.play();
    setIsPlaying(true);
  };
  
  // 监听音频播放结束
  useEffect(() => {
    const audioElement = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    if (audioElement) {
      audioElement.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl mb-4">慢速复读</h3>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="speed-slider">速度：</label>
          <span id="speed-value">{speed}x</span>
        </div>
        <input 
          type="range" 
          id="speed-slider" 
          min="0.5" 
          max="0.9" 
          step="0.1" 
          value={speed}
          onChange={handleSpeedChange}
          className="w-[200px]"
        />
      </div>
      
      <div className="flex gap-2">
        <button 
          className="btn-primary"
          onClick={playSlowAudio}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1"></i> 生成中...
            </>
          ) : (
            <>
              <i className="fas fa-play mr-1"></i> 播放慢速版
            </>
          )}
        </button>
        <button 
          className="btn-secondary"
          onClick={playOriginalAudio}
          disabled={isLoading}
        >
          <i className="fas fa-play mr-1"></i> 播放原速版
        </button>
        <button 
          className="btn-accent"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      
      {/* 隐藏的音频元素 */}
      <audio 
        ref={audioRef} 
        src={slowAudioUrl || originalAudio} 
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default SlowReplay;
