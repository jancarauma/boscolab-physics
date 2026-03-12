'use client';

import { useEffect, useState } from 'react';
import { t, onLocaleChange } from '@/lib/i18n';

export default function BottomBar() {
  const [text, setText] = useState(() => {
    const tr = t();
    return { fps: tr.ui.fps, points: tr.ui.points, objectsCount: tr.ui.objectsCount, method: tr.settings.method };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      setText({ fps: tr.ui.fps, points: tr.ui.points, objectsCount: tr.ui.objectsCount, method: tr.settings.method });
    };
    const unsub = onLocaleChange(updateText);
    return unsub;
  }, []);

  return (
    <div id="bottombar">
      <div className="bbitem">{text.fps} <span className="bbval" id="disp-fps">—</span></div>
      <div className="bbitem">{text.points} <span className="bbval" id="disp-pts">0</span></div>
      <div className="bbitem">{text.objectsCount} <span className="bbval" id="disp-objs">0</span></div>
      <div className="bbitem">{text.method} <span className="bbval" id="disp-method">RK4</span></div>
      <div id="errmsg" />
    </div>
  );
}
