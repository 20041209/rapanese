'use client';

import React, { useState, useEffect } from 'react';

interface DanmakuProps {
  enabled: boolean;
  words: {
    content: string;
    type: 'word' | 'grammar';
  }[];
}

const Danmaku: React.FC<DanmakuProps> = ({ enabled, words }) => {
  const [danmakuItems, setDanmakuItems] = useState<{
    id: number;
    content: string;
    type: 'word' | 'grammar';
    top: number;
    right: number;
  }[]>([]);
  
  useEffect(() => {
    if (!enabled) {
      setDanmakuItems([]);
      return;
    }
    
    // 定时添加新弹幕
    const interval = setInterval(() => {
      // 随机选择一个词
      const randomWord = words[Math.floor(Math.random() * words.length)];
      
      // 随机高度
      const randomTop = Math.floor(Math.random() * 80); // 容器高度的80%范围内
      
      // 添加新弹幕
      const newDanmaku = {
        id: Date.now(),
        content: randomWord.content,
        type: randomWord.type,
        top: randomTop,
        right: -300 // 初始位置在屏幕右侧外
      };
      
      setDanmakuItems(prev => [...prev, newDanmaku]);
      
      // 3秒后移除弹幕
      setTimeout(() => {
        setDanmakuItems(prev => prev.filter(item => item.id !== newDanmaku.id));
      }, 10000);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [enabled, words]);
  
  // 弹幕动画
  useEffect(() => {
    const animationFrames: number[] = [];
    
    const animate = () => {
      setDanmakuItems(prev => 
        prev.map(item => ({
          ...item,
          right: item.right + 2 // 每帧移动2像素
        }))
      );
      
      const frameId = requestAnimationFrame(animate);
      animationFrames.push(frameId);
    };
    
    if (enabled && danmakuItems.length > 0) {
      const frameId = requestAnimationFrame(animate);
      animationFrames.push(frameId);
    }
    
    return () => {
      animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
    };
  }, [enabled, danmakuItems.length]);
  
  if (!enabled) return null;
  
  return (
    <div className="danmaku-container">
      {danmakuItems.map(item => (
        <div
          key={item.id}
          className={`danmaku-item ${item.type === 'word' ? 'word-danmaku' : 'grammar-danmaku'}`}
          style={{
            top: `${item.top}%`,
            right: `${item.right}px`
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default Danmaku;
