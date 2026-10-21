// Planary brand, shared by every app: ink frame, paper surface, Unbounded and Manrope, the Saturn mark.
export const STYLES = String.raw`
body{margin:0;background:#0b0b0f}
.pl *,.pl *::before,.pl *::after{box-sizing:border-box}
.pl{--paper:#f5f5f7;--card:#ececf0;--ink:#0b0b0f;--indigo:#1f1b3a;--indigo-h:#2d2852;--violet:#8b5cf6;--t2:#55555e;--t2i:#a3a3ad;--rule:#d4d4db;--rule-i:#2a2a31;--err:#9b1c2e;--err-bg:#f8e6e9;--ease:cubic-bezier(.22,1,.36,1);--disp:"Unbounded","Archivo",ui-sans-serif,sans-serif;--body:"Manrope",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--m:clamp(20px,4.45cqw,64px);background:var(--ink);padding:14px;min-height:100vh;box-sizing:border-box;font-family:var(--body);font-size:15px;line-height:1.6;color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.site{container:site/inline-size;background:var(--paper);position:relative;min-height:calc(100vh - 28px)}
:where(.pl) a{color:inherit}
:where(.pl) p,:where(.pl) h1,:where(.pl) h2,:where(.pl) ul{margin:0}
:where(.pl) h1,:where(.pl) h2{font-weight:inherit}
.pl :focus-visible{outline:2px solid var(--violet);outline-offset:3px}
.d{font-family:var(--disp);font-weight:300;letter-spacing:-.045em}
.ul{text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size 120ms var(--ease)}
.ul:hover{background-size:100% 1px}
.skip{position:absolute;left:24px;top:-80px;z-index:60;height:44px;padding:0 20px;display:inline-flex;align-items:center;border-radius:999px;background:var(--paper);color:var(--ink);font:600 14px/1 var(--body);text-decoration:none;box-shadow:0 0 0 1px var(--rule)}
.skip:focus{top:24px}
.wm{font-family:var(--disp);font-weight:400;font-size:21px;letter-spacing:-.05em;line-height:1;text-decoration:none;display:inline-flex;align-items:center;gap:.3em;min-height:44px}
.wm-mark{width:1.18em;height:1.18em;flex:none;display:block}

/* layout */
.au{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:inherit}
.au-main{display:flex;flex-direction:column;min-height:inherit;padding:28px var(--m) 32px}
.au-top{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:48px}
.au-brand{display:flex;align-items:center;gap:14px}
.au-app{font-size:14px;font-weight:500;color:var(--t2);padding-left:14px;border-left:1px solid var(--rule);line-height:20px}
.au-out{font-size:14px;font-weight:500;display:inline-flex;align-items:center;min-height:44px}
.au-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:48px 0 40px}
.au-in{width:100%;max-width:440px}
.au-fine{font-size:13px;color:var(--t2);max-width:64ch}

/* headline + content entrance */
.au-h{font-size:clamp(36px,3.9cqw,56px);line-height:1.02;margin-left:-.04em}
.ln{display:block;overflow:hidden;padding-bottom:.14em;margin-bottom:-.14em}
.ln>span{display:inline-block;animation:ln-rise 900ms cubic-bezier(.22,1,.36,1) both}
.ln+.ln>span{animation-delay:90ms}
.au-after{animation:ux-up 520ms cubic-bezier(.22,1,.36,1) 320ms both}
@keyframes ln-rise{from{transform:translateY(105%)}to{transform:translateY(0)}}
@keyframes ux-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

/* text bits */
.au-ret{margin-top:18px;font-size:14px;color:var(--t2)}
.au-ret strong{color:var(--ink);font-weight:600}
.au-lead{margin-top:22px;font-size:16px;line-height:1.6;color:var(--t2);max-width:38ch}
.au-lead strong{color:var(--ink);font-weight:600}
.au-muted{margin-top:16px;font-size:14px;color:var(--t2)}
.au-links{display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px 24px;margin-top:24px;font-size:14px;font-weight:600}
.au-links a{display:inline-flex;align-items:center;min-height:44px}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;height:52px;padding:0 26px;border-radius:999px;font:600 14px/1 var(--body);letter-spacing:.005em;text-decoration:none;white-space:nowrap;border:0;cursor:pointer;transition:background-color 120ms,box-shadow 120ms,transform 80ms}
.btn:active{transform:scale(.98)}
.pl .btn-ink{background:var(--indigo);color:var(--paper)}
.pl .btn-ink:hover{background:var(--indigo-h)}
.pl .btn-line{background:var(--paper);color:var(--ink);box-shadow:inset 0 0 0 1px var(--rule)}
.pl .btn-line:hover{background:#ffffff;box-shadow:inset 0 0 0 1px #a9a9b3}
.btn-line svg{flex:none}
.btn-wide{width:100%}
.btn .spin{display:none;width:16px;height:16px;border-radius:50%;border:2px solid rgba(245,245,247,.28);border-top-color:var(--paper);animation:au-spin 700ms linear infinite}
.btn.is-busy{cursor:progress}
.pl .btn.is-busy,.pl .btn.is-busy:hover{background:var(--indigo-h)}
.btn.is-busy .spin{display:block}
@keyframes au-spin{to{transform:rotate(1turn)}}

.au-social{display:grid;gap:10px;margin-top:36px}
.au-or{display:flex;align-items:center;gap:16px;margin:28px 0 24px;font-size:13px;color:var(--t2)}
.au-or::before,.au-or::after{content:"";flex:1;height:1px;background:var(--rule)}

/* form */
.au-form{display:grid;gap:20px}
.au-form.top{margin-top:36px}
.au-form .btn-ink{margin-top:6px}
.f{display:grid;gap:8px}
.f-l{font-size:13px;font-weight:600;line-height:1.3}
.f-box{position:relative}
.f input{width:100%;height:52px;border-radius:14px;border:1px solid transparent;background:var(--card);padding:0 18px;font:500 15px/1 var(--body);color:var(--ink);transition:background-color 120ms,border-color 120ms,box-shadow 120ms;-webkit-appearance:none;appearance:none}
.f input:hover{border-color:var(--rule)}
.f input:focus{outline:none;background:#ffffff;border-color:var(--ink);box-shadow:0 0 0 3px rgba(139,92,246,.35)}
.f input.pw{padding-right:84px}
.f-eye{position:absolute;right:6px;top:6px;height:40px;min-width:64px;padding:0 14px;border-radius:999px;background:none;border:0;font:600 13px/1 var(--body);color:var(--t2);cursor:pointer;transition:color 120ms,background-color 120ms}
.f-eye:hover{color:var(--ink);background:rgba(11,11,15,.06)}
.f-h{font-size:13px;line-height:1.45;color:var(--t2)}

/* notices */
.note{display:flex;gap:12px;align-items:flex-start;margin-top:28px;padding:14px 16px;border-radius:14px;font-size:14px;line-height:1.5}
.note svg{flex:none;margin-top:2px}
.note.err{background:var(--err-bg);color:var(--err)}
.note.info{background:var(--card);color:var(--ink)}
.note a{font-weight:600}
.au-form .note{margin-top:0}

/* account */
.acct{display:flex;align-items:center;gap:16px;margin-top:36px;padding:16px 20px 16px 16px;border-radius:18px;background:var(--card)}
.av{width:52px;height:52px;flex:none;border-radius:50%;background:var(--indigo);color:var(--paper);display:grid;place-items:center;font:400 16px/1 var(--disp);letter-spacing:-.02em}
.acct-c{display:grid;min-width:0}
.acct-c strong{font-weight:600;font-size:16px;line-height:1.35}
.acct-c span{font-size:14px;color:var(--t2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.au-go{margin-top:24px}
.apps-h{margin-top:44px;font-size:13px;font-weight:600;color:var(--t2)}
.apps{list-style:none;padding:0;margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px;border-bottom:1px solid var(--rule)}
.apps a{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:52px;border-top:1px solid var(--rule);font-size:14px;font-weight:500;text-decoration:none}
.apps a svg{flex:none;transition:transform 120ms var(--ease)}
.apps a:hover svg{transform:translate(2px,-2px)}
.apps li:nth-last-child(2):nth-child(odd) a{border-bottom:0}
.sec{margin-top:52px;padding-top:40px;border-top:1px solid var(--rule)}
.sec .au-form{margin-top:24px}
.sec-h{font-size:24px;line-height:1.15}
.sec .au-muted{margin-top:0}

/* art */
.au-art{position:sticky;top:0;align-self:start;margin:14px 14px 14px 0;height:calc(100vh - 56px);min-height:560px;border-radius:24px;overflow:hidden;background:radial-gradient(90% 70% at 52% 46%,#ffffff 0%,#eeeef2 46%,#dedee4 100%);display:grid;place-items:center}
.au-obj{position:relative;z-index:1;width:min(80%,620px);transform:translate(var(--px,0px),var(--py,0px));transition:transform 900ms var(--ease)}
.au-obj svg{width:100%;height:auto;display:block;overflow:visible}
.au-cap{position:absolute;z-index:1;left:40px;bottom:36px;right:40px;display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
.au-cap-t{font-size:28px;line-height:1.1}
.au-cap-s{font-size:14px;color:var(--t2);text-align:right;max-width:24ch}

@container site (max-width:900px){
.au{grid-template-columns:minmax(0,1fr)}
.au-main{display:contents}
.au-top{order:0;padding:20px var(--m) 0}
.au-art{order:1;position:relative;margin:16px var(--m) 0;height:240px;min-height:0;border-radius:20px}
.au-obj{width:280px}
.au-cap{left:24px;right:24px;bottom:20px}.au-cap-t{font-size:20px}
.au-body{order:2;padding:48px var(--m) 56px}
.au-fine{order:3;padding:0 var(--m) 28px}
}
@container site (max-width:640px){
.au-top{padding-top:12px}
.au-app{display:none}
.au-art{height:150px;margin-top:12px}
.au-obj{width:190px}
.au-cap{display:none}
.au-body{padding:36px var(--m) 48px}
.au-h{font-size:clamp(34px,10cqw,44px)}
.au-social{margin-top:32px}
.apps{grid-template-columns:minmax(0,1fr)}
.apps li:nth-last-child(2):nth-child(odd) a{border-bottom:0}
}
@media (max-width:640px){.pl{padding:8px}.site{min-height:calc(100vh - 16px)}}
@media (prefers-reduced-motion:reduce){.ln>span,.au-after{animation:none}.btn .spin{animation-duration:1.6s}.pl *{transition-duration:0ms !important}.au-obj{transform:none}}

/* account object: the Planary Account card. Settles in once, then floats; the app dots light up in turn. */
.acct-obj{display:block;overflow:visible}
.acct-obj .ak-float{animation:ak-float 6.5s ease-in-out infinite}
.acct-obj .ak-shadow{transform-box:fill-box;transform-origin:center;animation:ak-shadow 6.5s ease-in-out infinite}
@keyframes ak-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes ak-shadow{0%,100%{transform:none;opacity:1}50%{transform:scaleX(.9);opacity:.75}}
.acct-obj .ak-dl{animation:ak-dot 7.5s ease-in-out infinite}
.acct-obj .ak-dl1{animation-delay:.5s}.acct-obj .ak-dl2{animation-delay:1s}
@keyframes ak-dot{0%,100%{opacity:.5}6%,14%{opacity:1}24%{opacity:.5}}
.acct-obj .ak-sheen{animation:ak-sheen 9s cubic-bezier(.45,0,.55,1) 2s infinite;transform:translateX(-60px)}
@keyframes ak-sheen{0%{transform:translateX(-60px)}35%,100%{transform:translateX(190px)}}
.acct-obj .ak-mark,.acct-obj .ak-dot{transform-box:fill-box;transform-origin:center}
.acct-obj .ak-line{stroke-dasharray:1 1}
.ao-play .acct-obj .ao-all,.acct-obj.ao-play .ao-all,.acct-obj.is-play .ao-all{animation:ak-in 900ms cubic-bezier(.22,1,.36,1) both}
.ao-play .acct-obj .ak-mark,.acct-obj.ao-play .ak-mark,.acct-obj.is-play .ak-mark{animation:ak-stamp 700ms cubic-bezier(.22,1,.36,1) 300ms both}
.ao-play .acct-obj .ak-line,.acct-obj.ao-play .ak-line,.acct-obj.is-play .ak-line{animation:ak-draw 600ms cubic-bezier(.22,1,.36,1) 550ms both}
.ao-play .acct-obj .ak-dot,.acct-obj.ao-play .ak-dot,.acct-obj.is-play .ak-dot{animation:ak-pop 420ms cubic-bezier(.34,1.56,.64,1) both}
.ao-play .acct-obj .ak-d0,.acct-obj.ao-play .ak-d0,.acct-obj.is-play .ak-d0{animation-delay:700ms}
.ao-play .acct-obj .ak-d1,.acct-obj.ao-play .ak-d1,.acct-obj.is-play .ak-d1{animation-delay:800ms}
.ao-play .acct-obj .ak-d2,.acct-obj.ao-play .ak-d2,.acct-obj.is-play .ak-d2{animation-delay:900ms}
.acct-obj .ao-all{transform-box:view-box;transform-origin:110px 70px}
@keyframes ak-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ak-stamp{from{opacity:0;transform:scale(1.18)}to{opacity:1;transform:none}}
@keyframes ak-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes ak-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.acct-obj *{animation:none !important}.acct-obj .ak-sheen{display:none}}
.stars{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;transform:translate(calc(var(--px,0px) * -.6),calc(var(--py,0px) * -.6));transition:transform 900ms cubic-bezier(.22,1,.36,1)}
.stars .tw{animation:st-tw 4s ease-in-out infinite}
.stars .tw.b{animation-duration:5.5s;animation-delay:-1.3s}
.stars .tw.c{animation-duration:3.2s;animation-delay:-2.1s}
.stars .tw.d{animation-duration:6.4s;animation-delay:-3.7s}
.stars .shoot{opacity:0;animation:st-shoot 12s cubic-bezier(.3,0,.7,1) 3s infinite}
@keyframes st-tw{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes st-shoot{0%{transform:translate(430px,80px);opacity:0}1.5%{opacity:1}10%{transform:translate(236px,183px);opacity:0}100%{transform:translate(236px,183px);opacity:0}}
@media (prefers-reduced-motion:reduce){.stars .tw,.stars .shoot{animation:none}.stars{transform:none}}
`;

/** Content hash for cache-busting the stylesheet URL whenever the CSS changes. */
export const STYLES_VERSION = (() => {
  let h = 5381;
  for (let i = 0; i < STYLES.length; i++) h = ((h << 5) + h + STYLES.charCodeAt(i)) >>> 0;
  return h.toString(36);
})();
