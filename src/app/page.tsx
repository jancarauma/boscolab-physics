'use client';

import { useEffect } from 'react';
import Menubar from '@/components/panels/Menubar';
import Toolbar from '@/components/panels/Toolbar';
import AnimationPanel from '@/components/panels/AnimationPanel';
import BottomBar from '@/components/panels/BottomBar';
import AddObjectModal from '@/components/modals/AddObjectModal';
import HelpModal from '@/components/modals/HelpModal';
import AboutModal from '@/components/modals/AboutModal';
import PrecisionModal from '@/components/modals/PrecisionModal';
import CustomDialog from '@/components/ui/CustomDialog';
import Toast from '@/components/ui/Toast';
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  // Theme init (runs before paint)
  useEffect(() => {
    const saved = localStorage.getItem('boscolab-theme') || 'dark';
    if (saved === 'light') document.documentElement.classList.add('light');
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = saved === 'light' ? '🌣' : '☾';
  }, []);

  return (
    <div id="app">
      <Menubar />
      <Toolbar />
      <div id="main">
        <AnimationPanel />
      </div>
      <BottomBar />

      {/* Analytics */}
      <Analytics />

      {/* Modals & overlays */}
      <AddObjectModal />
      <HelpModal />
      <AboutModal />
      <PrecisionModal />
      <CustomDialog />
      <Toast />

      {/* Hidden file inputs */}
      <input type="file" id="file-input" accept=".modx" style={{ display: 'none' }} onChange={(e) => (window as any).onFileLoad?.(e)} />
      <div id="canvas-tooltip" />
    </div>
  );
}
