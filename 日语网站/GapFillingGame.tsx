'use client';

import React, { useState, useEffect } from 'react';

interface GapFillingGameProps {
  sentence: string;
  translation: string;
  gapWords: string[];
  options: string[][];
  onClose: () => void;
}

const GapFillingGame: React.FC<GapFillingGameProps> = ({ 
  sentence, 
  translation, 
  gapWords, 
  options, 
  onClose 
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(Array(gapWords.length).fill(''));
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // 替换句子中的空格
  const sentenceWithGaps = sentence.replace(/___/g, '____');
  
  // 处理选项选择
  const handleOptionSelect = (gapIndex: number, option: string) => {
    if (isChecked) return; // 已经检查过答案，不允许再选择
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[gapIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
  };
  
  // 检查答案
  const checkAnswers = () => {
    let correctCount = 0;
    
    for (let i = 0; i < gapWords.length; i++) {
      if (selectedAnswers[i] === gapWords[i]) {
        correctCount++;
      }
    }
    
    const newScore = Math.round((correctCount / gapWords.length) * 100);
    setScore(newScore);
    setIsChecked(true);
    setShowResult(true);
  };
  
  // 重新开始
  const restart = () => {
    setSelectedAnswers(Array(gapWords.length).fill(''));
    setIsChecked(false);
    setShowResult(false);
  };
  
  // 构建带有空格的句子显示
  const buildSentenceDisplay = () => {
    const parts = sentenceWithGaps.split('____');
    
    return (
      <div className="text-lg mb-6">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span 
                className={`px-2 py-1 rounded ${
                  isChecked 
                    ? selectedAnswers[index] === gapWords[index]
                      ? 'bg-green-200 border-2 border-green-500'
                      : 'bg-red-200 border-2 border-red-500'
                    : selectedAnswers[index]
                      ? 'bg-blue-200 border-2 border-blue-500'
                      : 'bg-gray-200 border-2 border-gray-300'
                }`}
              >
                {selectedAnswers[index] || '　　　'}
                {isChecked && selectedAnswers[index] !== gapWords[index] && (
                  <span className="ml-1 text-green-600">({gapWords[index]})</span>
                )}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <div className="gap-filling-game">
      <h3 className="text-xl mb-4">趣味填空游戏</h3>
      
      <div className="mb-2">
        <span className="text-gray-600">中文翻译：</span> {translation}
      </div>
      
      {buildSentenceDisplay()}
      
      {gapWords.map((word, gapIndex) => (
        <div key={gapIndex} className="mb-4">
          <h4 className="mb-2">第{gapIndex + 1}个空格：</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {options[gapIndex].map((option, optionIndex) => (
              <div 
                key={optionIndex}
                className={`
                  bg-gray-100 border-2 rounded p-2 text-center cursor-pointer hover:bg-blue-50
                  ${selectedAnswers[gapIndex] === option ? 'border-primary' : 'border-gray-300'}
                  ${isChecked && option === gapWords[gapIndex] ? 'border-green-500 bg-green-100' : ''}
                  ${isChecked && selectedAnswers[gapIndex] === option && option !== gapWords[gapIndex] ? 'border-red-500 bg-red-100' : ''}
                `}
                onClick={() => handleOptionSelect(gapIndex, option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* 结果显示 */}
      {showResult && (
        <div className={`p-4 rounded mb-4 ${score >= 70 ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <h4 className="font-bold mb-2">
            {score >= 70 ? '太棒了！' : '继续加油！'}
          </h4>
          <p>您的得分：{score}分</p>
          <p>正确答案：{gapWords.join('、')}</p>
        </div>
      )}
      
      <div className="flex justify-between">
        {!isChecked ? (
          <button 
            className="btn-primary"
            onClick={checkAnswers}
            disabled={selectedAnswers.includes('')}
          >
            检查答案
          </button>
        ) : (
          <button 
            className="btn-primary"
            onClick={restart}
          >
            重新开始
          </button>
        )}
        <button 
          className="btn-accent"
          onClick={onClose}
        >
          关闭游戏
        </button>
      </div>
    </div>
  );
};

export default GapFillingGame;
