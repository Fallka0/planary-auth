// Planary brand, shared by every app: light violet ground, violet screen-print poster, one accent.
export const STYLES = String.raw`
:root {
  /* Planary violet: the parent brand every app shares. Light ground, violet print. */
  --bg: #f3f0fa;
  --shell: #fdfcff;
  --layer-1: #f4f1fb;
  --layer-2: #ebe5f8;
  --line: rgba(35, 20, 80, 0.1);
  --line-2: rgba(35, 20, 80, 0.18);
  --paper: #fbf9ff;
  --ink: #17102e;
  --text: #17102e;
  --text-2: rgba(23, 16, 46, 0.74);
  --text-3: rgba(23, 16, 46, 0.62);
  --accent: #6d28d9;
  --accent-hover: #5b21b6;
  --field: #7c3aed;
  --field-deep: #5b21b6;
  --plate-pink: #c4b5fd;
  --plate-oxblood: #3b1a86;
  --font-ui: "Onest", system-ui, sans-serif;
  --font-poster: "Big Shoulders", "Arial Narrow", sans-serif;
  color-scheme: light;
}
* { box-sizing: border-box; }
html { caret-color: var(--accent); }
body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  background: radial-gradient(90% 70% at 0% 0%, #e7ddfb 0%, transparent 60%), var(--bg);
}
::selection { background: rgba(124, 58, 237, 0.25); }
a { color: inherit; }
h1, p { margin: 0; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 480px);
  gap: 16px;
  min-height: 100vh;
  padding: 16px;
}

/* ── Poster ─────────────────────────────── */
.poster {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border-radius: 28px;
  padding: 40px;
  color: var(--paper);
  background: radial-gradient(circle, var(--field-deep) 0 3.2px, transparent 3.6px) 0 0 / 14px 14px, var(--field);
}
.poster::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background: linear-gradient(180deg, var(--field) 0%, var(--field) 40%, transparent 100%);
}
.poster::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
  mix-blend-mode: multiply;
}
.poster-p { position: absolute; inset: 0; z-index: -1; overflow: hidden; }
.plate {
  position: absolute;
  right: -4%;
  top: -6%;
  font-family: var(--font-poster);
  font-weight: 900;
  font-size: min(92vh, 760px);
  line-height: 0.85;
}
.plate-a { color: var(--plate-pink); opacity: 0.28; translate: 18px 16px; }
.plate-b { color: var(--plate-oxblood); opacity: 0.6; mix-blend-mode: multiply; }
.poster-title {
  font-family: var(--font-poster);
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 900;
  line-height: 0.84;
  text-transform: uppercase;
}
.poster-caption {
  margin-top: 10px;
  font-family: var(--font-poster);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.9;
}
.poster-apps { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 0; padding: 0; list-style: none; }
.poster-apps li { padding: 4px 12px; border-radius: 999px; background: var(--paper); color: var(--field-deep); font-weight: 700; font-size: 0.85rem; }

/* ── Panel ─────────────────────────────── */
.panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px;
  border-radius: 28px;
  background: var(--shell);
  border: 1px solid var(--line);
  box-shadow: 0 30px 60px -40px rgba(59, 26, 134, 0.35);
}
.brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
.chip { display: block; flex: none; }
.brand-copy { display: flex; flex-direction: column; line-height: 1.05; }
.brand-name { font-family: var(--font-poster); font-size: 1.5rem; font-weight: 900; text-transform: uppercase; }
.brand-sub { color: var(--text-3); font-size: 0.8rem; }
.panel-body { display: flex; flex-direction: column; gap: 18px; margin: auto 0; }
.panel-body h1 {
  font-family: var(--font-poster);
  font-size: 3.4rem;
  font-weight: 900;
  line-height: 0.9;
  text-transform: uppercase;
}
.lead { color: var(--text-2); font-size: 1rem; }
.muted { color: var(--text-3); font-size: 0.9rem; }
.return-hint { color: var(--text-3); font-size: 0.88rem; margin-top: -8px; }
.return-hint strong { color: var(--text-2); font-weight: 600; }
.fineprint { color: var(--text-3); font-size: 0.8rem; }

.notice { padding: 12px 14px; border-radius: 14px; font-size: 0.92rem; }
.notice-error { background: #fdecef; border: 1px solid #f5b5c2; color: #7a1027; }
.notice-info { background: var(--layer-1); border: 1px solid var(--line-2); color: var(--text-2); }

.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.88rem; font-weight: 600; }
.field-hint { color: var(--text-3); font-size: 0.8rem; }
.field input {
  height: 48px;
  padding: 0 14px;
  border-radius: 14px 5px 14px 5px;
  border: 1px solid var(--line-2);
  background: var(--layer-1);
  color: var(--text);
  font: inherit;
  font-size: 1rem;
  transition: border-color 0.18s ease;
}
.field input:hover { border-color: rgba(35, 20, 80, 0.3); }
.field input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-color: transparent; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 50px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 16px 6px 16px 6px;
  font: inherit;
  font-weight: 600;
  font-size: 0.98rem;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.18s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--accent); color: #fff; box-shadow: 0 12px 24px -14px rgba(109, 40, 217, 0.8); }
.btn-primary:hover { background: var(--accent-hover); }
.btn-social { background: var(--layer-1); border-color: var(--line-2); color: var(--text); }
.btn-social:hover { background: var(--layer-2); }
.btn-quiet { background: var(--layer-1); border-color: var(--line-2); color: var(--text); width: 100%; }
.btn-quiet:hover { background: var(--layer-2); }
.social { display: flex; flex-direction: column; gap: 10px; }
.divider { display: flex; align-items: center; gap: 12px; color: var(--text-3); font-size: 0.82rem; }
.divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: var(--line-2); }

.links { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 16px; font-size: 0.9rem; }
.links a { color: var(--text-2); text-decoration: underline; text-decoration-color: var(--line-2); text-underline-offset: 4px; }
.links a:hover { color: var(--text); text-decoration-color: var(--accent); }

.account-card { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 18px; background: var(--layer-1); }
.avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: none;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}
.account-copy { display: flex; flex-direction: column; min-width: 0; }
.account-copy span { color: var(--text-3); font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; }
.app-links { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }

@media (max-width: 860px) {
  .page { grid-template-columns: 1fr; padding: 10px; gap: 10px; }
  .poster { min-height: 150px; padding: 22px; border-radius: 22px; justify-content: center; }
  .plate { font-size: 260px; top: -30%; }
  .poster-title { font-size: 3rem; }
  .poster-caption { font-size: 1rem; }
  .poster-apps { display: none; }
  .panel { padding: 24px 20px; border-radius: 22px; gap: 22px; }
  .panel-body h1 { font-size: 2.8rem; }
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
`;

/** Content hash for cache-busting the stylesheet URL whenever the CSS changes. */
export const STYLES_VERSION = (() => {
  let h = 5381;
  for (let i = 0; i < STYLES.length; i++) h = ((h << 5) + h + STYLES.charCodeAt(i)) >>> 0;
  return h.toString(36);
})();
