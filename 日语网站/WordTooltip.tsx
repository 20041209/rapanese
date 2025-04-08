'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WordTooltipProps {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  level: string;
  position: { top: number; left: number };
  onClose: () => void;
}

const WordTooltip: React.FC<WordTooltipProps> = ({ 
  word, 
  reading, 
  meaning, 
  example, 
  level, 
  position, 
  onClose 
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // 调整位置，确保不超出屏幕
  const adjustedPosition = {
    top: Math.min(position.top, window.innerHeight - 250),
    left: Math.min(position.left, window.innerWidth - 300)
  };
  
  return (
    <div 
      ref={tooltipRef}
      className="word-tooltip" 
      style={{ 
        top: adjustedPosition.top, 
        left: adjustedPosition.left,
        position: 'fixed',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        maxWidth: '300px'
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="word-tooltip-word font-bold text-lg">{word}</div>
        <div className="word-tooltip-reading text-gray-600">{reading}</div>
      </div>
      <div className="word-tooltip-meaning mb-2">{meaning}</div>
      <div className="word-tooltip-example italic text-gray-600 border-l-2 border-primary pl-2 mb-2">{example}</div>
      <div className="flex justify-between items-center">
        <span className="bg-primary text-white px-2 py-1 rounded text-xs">{level}</span>
        <button 
          className="btn-secondary text-sm px-2 py-1" 
          onClick={(e) => {
            e.stopPropagation();
            // 在实际应用中，这里会调用API保存词汇
            console.log('收藏词汇:', word);
          }}
        >
          收藏
        </button>
      </div>
    </div>
  );
};

export default WordTooltip;
