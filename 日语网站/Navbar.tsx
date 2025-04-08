'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface NavbarProps {
  activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ activePage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Image src="/images/logo.png" alt="Anime日语每日课" width={40} height={40} />
        <h1 className="text-xl m-0 ml-4">Anime日语每日课</h1>
      </div>
      <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
        <Link href="/" className={`navbar-link ${activePage === 'home' ? 'active' : ''}`}>
          首页
        </Link>
        <Link href="/today" className={`navbar-link ${activePage === 'today' ? 'active' : ''}`}>
          今日学习
        </Link>
        <Link href="/vocabulary" className={`navbar-link ${activePage === 'vocabulary' ? 'active' : ''}`}>
          我的词库
        </Link>
        <Link href="/reports" className={`navbar-link ${activePage === 'reports' ? 'active' : ''}`}>
          学习报告
        </Link>
        <Link href="/settings" className={`navbar-link ${activePage === 'settings' ? 'active' : ''}`}>
          设置
        </Link>
        <Link href="/help" className={`navbar-link ${activePage === 'help' ? 'active' : ''}`}>
          帮助
        </Link>
      </div>
      <div className="navbar-user">
        <Image src="/images/avatar.png" alt="用户头像" width={36} height={36} className="rounded-full" />
        <span className="ml-2">用户名</span>
      </div>
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <i className="fas fa-bars"></i>
      </button>
    </nav>
  );
};

export default Navbar;
