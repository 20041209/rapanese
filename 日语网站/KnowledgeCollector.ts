'use client';

import React, { useState, useEffect } from 'react';

interface KnowledgeCollectorProps {
  userId: number;
  onCollect?: (type: 'vocabulary' | 'grammar', id: number) => void;
}

const KnowledgeCollector: React.FC<KnowledgeCollectorProps> = ({ userId, onCollect }) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [lastCollected, setLastCollected] = useState<{
    type: 'vocabulary' | 'grammar';
    id: number;
    word?: string;
    pattern?: string;
    timestamp: number;
  } | null>(null);
  
  // 收集词汇
  const collectVocabulary = async (vocabularyId: number, word: string) => {
    if (isCollecting) return;
    
    setIsCollecting(true);
    
    try {
      // 在实际应用中，这里会调用API收集词汇
      // const response = await fetch('/api/knowledge/collectVocabulary', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, vocabularyId })
      // });
      // const data = await response.json();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 记录最后收集的词汇
      setLastCollected({
        type: 'vocabulary',
        id: vocabularyId,
        word,
        timestamp: Date.now()
      });
      
      // 调用回调函数
      if (onCollect) {
        onCollect('vocabulary', vocabularyId);
      }
    } catch (error) {
      console.error('收集词汇失败:', error);
    } finally {
      setIsCollecting(false);
    }
  };
  
  // 收集语法点
  const collectGrammar = async (grammarId: number, pattern: string) => {
    if (isCollecting) return;
    
    setIsCollecting(true);
    
    try {
      // 在实际应用中，这里会调用API收集语法点
      // const response = await fetch('/api/knowledge/collectGrammar', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, grammarId })
      // });
      // const data = await response.json();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 记录最后收集的语法点
      setLastCollected({
        type: 'grammar',
        id: grammarId,
        pattern,
        timestamp: Date.now()
      });
      
      // 调用回调函数
      if (onCollect) {
        onCollect('grammar', grammarId);
      }
    } catch (error) {
      console.error('收集语法点失败:', error);
    } finally {
      setIsCollecting(false);
    }
  };
  
  // 清除最后收集的提示
  useEffect(() => {
    if (lastCollected) {
      const timer = setTimeout(() => {
        setLastCollected(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [lastCollected]);
  
  return {
    collectVocabulary,
    collectGrammar,
    isCollecting,
    lastCollected
  };
};

export default KnowledgeCollector;
