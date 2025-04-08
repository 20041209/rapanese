'use client';

import React, { useState, useRef, useEffect } from 'react';

interface PronunciationScorerProps {
  sentence: string;
  translation: string;
  originalAudio: string;
  onClose: () => void;
}

const PronunciationScorer: React.FC<PronunciationScorerProps> = ({ 
  sentence, 
  translation, 
  originalAudio, 
  onClose 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [score, setScore] = useState<{
    accuracy: number;
    fluency: number;
    intonation: number;
    overall: number;
    emoji: string;
    feedback: string;
  } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // 播放原声
  const playOriginalAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };
  
  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        processRecording();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('无法访问麦克风:', error);
      alert('无法访问麦克风，请确保您已授予麦克风访问权限。');
    }
  };
  
  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };
  
  // 处理录音
  const processRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // 在实际应用中，这里会将录音发送到服务器进行评分
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟评分结果
    const mockScore = {
      accuracy: Math.floor(Math.random() * 20) + 75, // 75-95
      fluency: Math.floor(Math.random() * 20) + 70, // 70-90
      intonation: Math.floor(Math.random() * 20) + 75, // 75-95
      overall: 0,
      emoji: '',
      feedback: ''
    };
    
    // 计算总体评分
    mockScore.overall = Math.round((mockScore.accuracy + mockScore.fluency + mockScore.intonation) / 3);
    
    // 根据总体评分设置表情和反馈
    if (mockScore.overall >= 90) {
      mockScore.emoji = '😊';
      mockScore.feedback = '发音优秀！';
    } else if (mockScore.overall >= 80) {
      mockScore.emoji = '😄';
      mockScore.feedback = '发音很好！';
    } else if (mockScore.overall >= 70) {
      mockScore.emoji = '🙂';
      mockScore.feedback = '发音不错！';
    } else {
      mockScore.emoji = '🤔';
      mockScore.feedback = '需要练习！';
    }
    
    setScore(mockScore);
    setIsProcessing(false);
    setHasResult(true);
  };
  
  // 重新开始
  const restart = () => {
    setHasResult(false);
    setScore(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl mb-4">跟读打分</h3>
      
      <p className="mb-2">请跟读以下句子：</p>
      <div className="bg-primary text-white p-4 rounded mb-4">
        <div className="font-jp text-lg mb-2">{sentence}</div>
        <div className="text-sm opacity-80">{translation}</div>
      </div>
      
      <div className="flex gap-2 mb-6">
        <button 
          className="btn-primary"
          onClick={playOriginalAudio}
          disabled={isRecording || isProcessing}
        >
          <i className="fas fa-volume-up mr-1"></i> 听原声
        </button>
        
        {!isRecording && !isProcessing && !hasResult && (
          <button 
            className="btn-secondary"
            onClick={startRecording}
          >
            <i className="fas fa-microphone mr-1"></i> 开始录音
          </button>
        )}
        
        {isRecording && (
          <button 
            className="btn-accent"
            onClick={stopRecording}
          >
            <i className="fas fa-stop mr-1"></i> 停止录音
          </button>
        )}
        
        <button 
          className="btn-accent"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      
      {/* 录音状态 */}
      {isRecording && (
        <div className="text-center p-4">
          <div className="spinner mx-auto mb-2"></div>
          <p>正在录音... 请跟读上面的句子</p>
        </div>
      )}
      
      {/* 处理状态 */}
      {isProcessing && (
        <div className="text-center p-4">
          <div className="spinner mx-auto mb-2"></div>
          <p>正在分析您的发音...</p>
        </div>
      )}
      
      {/* 评分结果 */}
      {hasResult && score && (
        <div className="text-center p-4">
          <div className="text-6xl mb-2">{score.emoji}</div>
          <p className="text-xl mb-4">{score.feedback}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-3 rounded">
              <div className="text-lg font-bold text-primary">{score.accuracy}%</div>
              <div className="text-sm">准确率</div>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <div className="text-lg font-bold text-primary">{score.fluency}%</div>
              <div className="text-sm">流利度</div>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <div className="text-lg font-bold text-primary">{score.intonation}%</div>
              <div className="text-sm">语调</div>
            </div>
          </div>
          
          <button 
            className="btn-primary"
            onClick={restart}
          >
            <i className="fas fa-redo mr-1"></i> 再试一次
          </button>
        </div>
      )}
      
      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} src={originalAudio} />
    </div>
  );
};

export default PronunciationScorer;
