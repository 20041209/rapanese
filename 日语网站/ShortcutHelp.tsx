'use client';

import React, { useState, useEffect } from 'react';

interface ShortcutHelpProps {
  onClose: () => void;
}

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ onClose }) => {
  const shortcuts = [
    { key: '空格', description: '播放/暂停视频' },
    { key: '←', description: '后退5秒' },
    { key: '→', description: '前进5秒' },
    { key: 'J', description: '仅显示日语字幕' },
    { key: 'C', description: '仅显示中文字幕' },
    { key: 'D', description: '显示双语字幕' },
    { key: 'N', description: '关闭字幕' },
    { key: 'R', description: '慢速复读' },
    { key: 'P', description: '开始跟读练习' },
    { key: 'G', description: '开始填空游戏' },
    { key: 'H', description: '显示/隐藏帮助' },
    { key: 'Esc', description: '关闭所有弹窗' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-xl mb-4">键盘快捷键</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {shortcuts.map((shortcut, index) => (
          <React.Fragment key={index}>
            <div className="bg-gray-100 px-2 py-1 rounded text-center">{shortcut.key}</div>
            <div>{shortcut.description}</div>
          </React.Fragment>
        ))}
      </div>
      <div className="text-center mt-6">
        <button 
          className="btn-accent"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  );
};

export default ShortcutHelp;
