'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Navbar activePage="home" />
      
      <main className="main-content">
        {/* 英雄区域 */}
        <section className="hero">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">通过动漫片段学习日语</h1>
          <p className="text-lg mb-8 max-w-2xl">每天10分钟，沉浸式体验，让日语学习更有趣、更高效</p>
          <Link href="/today" className="btn-primary">开始今日学习</Link>
        </section>

        {/* 特色功能 */}
        <section className="container py-16">
          <h2 className="text-center text-3xl mb-8">特色功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 特色1：每日精选动漫片段 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-film"></i>
              </div>
              <h3 className="text-xl mb-4">每日精选动漫片段</h3>
              <p>根据您的日语水平和兴趣，每天推送精选动漫片段，配有双语字幕和导学内容</p>
            </div>

            {/* 特色2：沉浸式互动学习 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-xl mb-4">沉浸式互动学习</h3>
              <p>点击查词、AI慢速复读、跟读打分、趣味填空游戏，多种互动方式提升学习效果</p>
            </div>

            {/* 特色3：轻量化知识管理 */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="text-xl mb-4">轻量化知识管理</h3>
              <p>自动收集生词和语法，生成复习弹幕，每周发送学习报告，科学管理学习进度</p>
            </div>
          </div>
        </section>

        {/* 学习流程 */}
        <section className="container mb-16">
          <h2 className="text-center text-3xl mb-8">学习流程</h2>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="text-center p-6 bg-white rounded-lg shadow flex-1 min-w-[200px]">
              <div className="feature-icon">
                <i className="fas fa-play-circle"></i>
              </div>
              <h3 className="text-xl mb-2">观看片段</h3>
              <p>观看精选动漫片段，了解今日学习重点</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow flex-1 min-w-[200px]">
              <div className="feature-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-xl mb-2">互动学习</h3>
              <p>使用点击查词、慢速复读等功能深入理解内容</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow flex-1 min-w-[200px]">
              <div className="feature-icon">
                <i className="fas fa-gamepad"></i>
              </div>
              <h3 className="text-xl mb-2">巩固练习</h3>
              <p>完成趣味填空游戏，巩固所学知识</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow flex-1 min-w-[200px]">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-xl mb-2">查看进度</h3>
              <p>查看学习报告，了解自己的学习进度</p>
            </div>
          </div>
        </section>

        {/* 开始使用 */}
        <section className="container text-center p-8 mb-16 bg-white rounded-lg shadow">
          <h2 className="text-3xl mb-4">立即开始您的日语学习之旅</h2>
          <p className="mb-6">每天只需10分钟，轻松掌握日语</p>
          <Link href="/today" className="btn-primary">开始今日学习</Link>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
