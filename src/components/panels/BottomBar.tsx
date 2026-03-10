'use client';

export default function BottomBar() {
  return (
    <div id="bottombar">
      <div className="bbitem">FPS <span className="bbval" id="disp-fps">—</span></div>
      <div className="bbitem">pts <span className="bbval" id="disp-pts">0</span></div>
      <div className="bbitem">obj <span className="bbval" id="disp-objs">0</span></div>
      <div className="bbitem">método <span className="bbval" id="disp-method">RK4</span></div>
      <div id="errmsg" />
    </div>
  );
}
