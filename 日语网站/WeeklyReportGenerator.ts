'use client';

import React, { useState, useEffect } from 'react';

interface WeeklyReportGeneratorProps {
  userId: number;
}

const WeeklyReportGenerator: React.FC<WeeklyReportGeneratorProps> = ({ userId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 生成每周学习报告
  const generateWeeklyReport = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // 在实际应用中，这里会调用API生成每周学习报告
      // const response = await fetch('/api/knowledge/generateWeeklyReport', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId })
      // });
      // const data = await response.json();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 记录最后生成时间
      setLastGenerated(new Date());
    } catch (error) {
      console.error('生成每周学习报告失败:', error);
      setError('生成报告失败，请稍后再试');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 检查是否可以生成报告（每周日可以生成）
  const canGenerateReport = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
    
    // 如果今天是周日，并且今天还没有生成报告，则可以生成
    if (dayOfWeek === 0) {
      if (!lastGenerated) return true;
      
      // 检查最后生成时间是否是今天
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastGen = new Date(lastGenerated);
      lastGen.setHours(0, 0, 0, 0);
      
      return today.getTime() !== lastGen.getTime();
    }
    
    return false;
  };
  
  return {
    generateWeeklyReport,
    isGenerating,
    lastGenerated,
    canGenerateReport: canGenerateReport(),
    error
  };
};

export default WeeklyReportGenerator;
