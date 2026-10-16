// Static markup shared by every page, kept verbatim from the planary.ch hero so it matches exactly.
// Each SVG id here appears once per page.

/** The Saturn mark as a symbol, used by the wordmark with <use href="#pmark">. */
export const MARK_SYMBOL = String.raw`<svg width="0" height="0" style="position: absolute" aria-hidden="true"><defs><mask id="pmP" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#ffffff"/><path d="M6 50A44 12.5 0 0 0 94 50" transform="rotate(-28 50 50)" fill="none" stroke="#000000" stroke-width="11"/></mask><mask id="pmB" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#ffffff"/><circle cx="50" cy="50" r="28" fill="#000000"/></mask><symbol id="pmark" viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="currentColor" mask="url(#pmP)"/><path d="M94 50A44 12.5 0 0 0 6 50" transform="rotate(-28 50 50)" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" mask="url(#pmB)"/><path d="M6 50A44 12.5 0 0 0 94 50" transform="rotate(-28 50 50)" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></symbol></defs></svg>`;

/** The right-hand art card: starfield and the animated logo. Decorative, hidden from assistive tech. */
export const ART = String.raw`<aside class="au-art" aria-hidden="true">
<svg class="stars" viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><linearGradient id="stTail" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="53" y2="-28"><stop offset="0" stop-color="#0b0b0f" stop-opacity=".7"></stop><stop offset="1" stop-color="#0b0b0f" stop-opacity="0"></stop></linearGradient></defs>
<g fill="#0b0b0f">
<circle cx="165" cy="111" r="0.7" fill-opacity="0.19"></circle>
<circle cx="43" cy="375" r="1" fill-opacity="0.36"></circle>
<circle cx="290" cy="630" r="0.9" fill-opacity="0.32"></circle>
<circle class="tw" cx="26" cy="305" r="0.7" fill-opacity="0.19"></circle>
<circle class="tw b" cx="124" cy="385" r="0.7" fill-opacity="0.29"></circle>
<circle class="tw c" cx="408" cy="93" r="0.9" fill-opacity="0.38"></circle>
<circle class="tw d" cx="313" cy="407" r="0.7" fill-opacity="0.34"></circle>
<circle cx="287" cy="279" r="0.9" fill-opacity="0.2"></circle>
<circle cx="31" cy="595" r="1" fill-opacity="0.5"></circle>
<circle cx="211" cy="378" r="1.8" fill-opacity="0.55"></circle>
<circle cx="157" cy="566" r="0.8" fill-opacity="0.49"></circle>
<circle class="tw" cx="99" cy="75" r="0.7" fill-opacity="0.21"></circle>
<circle class="tw b" cx="281" cy="431" r="1.3" fill-opacity="0.42"></circle>
<circle class="tw c" cx="337" cy="300" r="1" fill-opacity="0.19"></circle>
<circle class="tw d" cx="233" cy="640" r="1" fill-opacity="0.43"></circle>
<circle cx="346" cy="175" r="1.8" fill-opacity="0.42"></circle>
<circle cx="153" cy="347" r="1" fill-opacity="0.22"></circle>
<circle cx="482" cy="89" r="1.1" fill-opacity="0.32"></circle>
<circle cx="88" cy="242" r="1.3" fill-opacity="0.58"></circle>
<circle class="tw" cx="390" cy="568" r="1" fill-opacity="0.44"></circle>
<circle class="tw b" cx="289" cy="320" r="0.7" fill-opacity="0.26"></circle>
<circle class="tw c" cx="465" cy="332" r="0.7" fill-opacity="0.23"></circle>
<circle class="tw d" cx="37" cy="488" r="1.8" fill-opacity="0.58"></circle>
<circle cx="489" cy="570" r="1" fill-opacity="0.36"></circle>
<circle cx="355" cy="615" r="1" fill-opacity="0.4"></circle>
<circle cx="37" cy="533" r="0.8" fill-opacity="0.21"></circle>
<circle cx="365" cy="280" r="1.3" fill-opacity="0.36"></circle>
<circle class="tw" cx="405" cy="599" r="1" fill-opacity="0.4"></circle>
<circle class="tw b" cx="350" cy="683" r="1.1" fill-opacity="0.32"></circle>
<circle class="tw c" cx="93" cy="167" r="0.9" fill-opacity="0.2"></circle>
<circle class="tw d" cx="96" cy="201" r="0.8" fill-opacity="0.48"></circle>
<circle cx="211" cy="261" r="1.8" fill-opacity="0.51"></circle>
<circle cx="424" cy="658" r="0.7" fill-opacity="0.44"></circle>
<circle cx="229" cy="604" r="1.5" fill-opacity="0.37"></circle>
<circle cx="58" cy="442" r="0.7" fill-opacity="0.45"></circle>
<circle class="tw" cx="100" cy="682" r="1.3" fill-opacity="0.37"></circle>
<circle class="tw b" cx="33" cy="8" r="0.8" fill-opacity="0.46"></circle>
<circle class="tw c" cx="268" cy="657" r="1.8" fill-opacity="0.46"></circle>
<circle class="tw d" cx="305" cy="110" r="1" fill-opacity="0.29"></circle>
<circle cx="470" cy="420" r="1.3" fill-opacity="0.49"></circle>
<circle cx="67" cy="589" r="1.3" fill-opacity="0.58"></circle>
<circle cx="241" cy="221" r="0.8" fill-opacity="0.27"></circle>
<circle cx="86" cy="24" r="1.5" fill-opacity="0.38"></circle>
<circle class="tw" cx="183" cy="480" r="0.7" fill-opacity="0.35"></circle>
<circle class="tw b" cx="375" cy="212" r="0.7" fill-opacity="0.26"></circle>
<circle class="tw c" cx="382" cy="372" r="1.5" fill-opacity="0.38"></circle>
<circle class="tw d" cx="168" cy="161" r="0.9" fill-opacity="0.23"></circle>
<circle cx="259" cy="251" r="0.7" fill-opacity="0.2"></circle>
<circle cx="237" cy="140" r="1.8" fill-opacity="0.4"></circle>
<circle cx="462" cy="684" r="1" fill-opacity="0.28"></circle>
<circle cx="47" cy="78" r="1.3" fill-opacity="0.43"></circle>
<circle class="tw" cx="415" cy="336" r="1" fill-opacity="0.42"></circle>
<circle class="tw b" cx="387" cy="521" r="1.3" fill-opacity="0.42"></circle>
<circle class="tw c" cx="438" cy="305" r="1" fill-opacity="0.34"></circle>
<circle class="tw d" cx="50" cy="655" r="1.1" fill-opacity="0.24"></circle>
<circle cx="232" cy="516" r="0.7" fill-opacity="0.29"></circle>
<circle cx="359" cy="124" r="0.8" fill-opacity="0.19"></circle>
<circle cx="21" cy="412" r="1.3" fill-opacity="0.41"></circle>
<circle cx="326" cy="248" r="1.5" fill-opacity="0.35"></circle>
<circle class="tw" cx="273" cy="23" r="0.7" fill-opacity="0.41"></circle>
<circle class="tw b" cx="408" cy="152" r="1" fill-opacity="0.36"></circle>
<circle class="tw c" cx="111" cy="351" r="1.8" fill-opacity="0.4"></circle>
<circle class="tw d" cx="166" cy="380" r="0.8" fill-opacity="0.33"></circle>
<circle cx="442" cy="461" r="1.5" fill-opacity="0.58"></circle>
<circle cx="251" cy="372" r="1.5" fill-opacity="0.38"></circle>
<circle cx="384" cy="424" r="0.8" fill-opacity="0.44"></circle>
<circle cx="277" cy="544" r="0.7" fill-opacity="0.32"></circle>
<circle class="tw" cx="435" cy="47" r="0.9" fill-opacity="0.34"></circle>
<circle class="tw b" cx="223" cy="427" r="1.5" fill-opacity="0.56"></circle>
<circle class="tw c" cx="301" cy="144" r="1" fill-opacity="0.31"></circle>
<circle class="tw d" cx="464" cy="186" r="1.5" fill-opacity="0.48"></circle>
<circle cx="225" cy="293" r="1.1" fill-opacity="0.4"></circle>
<circle cx="222" cy="58" r="0.9" fill-opacity="0.49"></circle>
<circle cx="384" cy="651" r="1" fill-opacity="0.29"></circle>
<circle cx="469" cy="280" r="1.3" fill-opacity="0.56"></circle>
<circle class="tw" cx="87" cy="465" r="0.9" fill-opacity="0.41"></circle>
<circle class="tw b" cx="86" cy="303" r="1.5" fill-opacity="0.51"></circle>
<circle class="tw c" cx="181" cy="71" r="1" fill-opacity="0.31"></circle>
</g>
<g class="shoot"><line x1="0" y1="0" x2="53" y2="-28" stroke="url(#stTail)" stroke-width="1.4" stroke-linecap="round"></line><circle r="1.4" fill="#0b0b0f" fill-opacity=".75"></circle></g>
</svg>
<div class="au-obj"><svg class="hl" viewBox="2 2 96 96" aria-hidden="true">
<defs>
<mask id="hP" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="130"><rect x="-10" y="-10" width="120" height="130" fill="#ffffff"></rect><path d="M6 50A44 12.5 0 0 0 94 50" transform="rotate(-28 50 50)" fill="none" stroke="#000000" stroke-width="11"></path></mask>
<mask id="hB" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="130"><rect x="-10" y="-10" width="120" height="130" fill="#ffffff"></rect><circle cx="50" cy="50" r="28" fill="#000000"></circle></mask>
<radialGradient id="hPlanet" gradientUnits="userSpaceOnUse" cx="38" cy="33" r="42"><stop offset="0" stop-color="#6a6a74"></stop><stop offset=".28" stop-color="#26262d"></stop><stop offset=".68" stop-color="#0a0a0d"></stop><stop offset="1" stop-color="#000000"></stop></radialGradient>
<linearGradient id="hRing" gradientUnits="userSpaceOnUse" x1="8" y1="30" x2="92" y2="70"><stop offset="0" stop-color="#ffffff"></stop><stop offset=".22" stop-color="#b9b9c3"></stop><stop offset=".48" stop-color="#3a3a42"></stop><stop offset=".7" stop-color="#e9e9ee"></stop><stop offset="1" stop-color="#5a5a64"></stop></linearGradient>
<clipPath id="hC"><circle cx="50" cy="50" r="25"></circle></clipPath>
<filter id="hBl1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7"></feGaussianBlur></filter>
<filter id="hBl2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"></feGaussianBlur></filter>
<filter id="hBl5" x="-40%" y="-400%" width="180%" height="900%"><feGaussianBlur stdDeviation="4"></feGaussianBlur></filter>
</defs>
<ellipse class="hl-shadow" cx="50" cy="88" rx="24" ry="2.8" fill="#0b0b0f" opacity=".3" filter="url(#hBl5)"></ellipse>
<g class="hl-float">
<path class="hl-ring" pathLength="1" d="M94 50A44 12.5 0 0 0 6 50" transform="rotate(-28 50 50)" fill="none" stroke="url(#hRing)" stroke-width="5" stroke-linecap="round" mask="url(#hB)"></path>
<g class="hl-planet" mask="url(#hP)">
<circle cx="50" cy="50" r="25" fill="url(#hPlanet)"></circle>
<ellipse cx="41" cy="37" rx="9" ry="3.6" transform="rotate(-28 41 37)" fill="#ffffff" opacity=".55" filter="url(#hBl2)"></ellipse>
<ellipse cx="43.5" cy="35.4" rx="3.2" ry="1.1" transform="rotate(-28 43.5 35.4)" fill="#ffffff" opacity=".85"></ellipse>
<ellipse cx="62" cy="66" rx="10" ry="3" transform="rotate(-28 62 66)" fill="#a2a2ae" opacity=".32" filter="url(#hBl2)"></ellipse>
<g clip-path="url(#hC)"><path class="hl-cast" d="M6 50A44 12.5 0 0 0 94 50" transform="translate(.8 3.2) rotate(-28 50 50)" fill="none" stroke="#000000" stroke-width="5" opacity=".55" filter="url(#hBl2)"></path></g>
</g>
<path class="hl-ring hl-front" pathLength="1" d="M6 50A44 12.5 0 0 0 94 50" transform="rotate(-28 50 50)" fill="none" stroke="url(#hRing)" stroke-width="5" stroke-linecap="round"></path>
<path class="hl-glint" pathLength="1" d="M6 50A44 12.5 0 0 0 94 50" transform="translate(0 -.6) rotate(-28 50 50)" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" filter="url(#hBl1)"></path>
</g>
</svg></div>
<div class="au-cap"><p class="d au-cap-t">One account</p><p class="au-cap-s">Every Planary app</p></div>
</aside>`;

export const FAVICON_SVG = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0b0b0f"/><defs><mask id="p" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><path d="M6 50A44 12.5 0 0 0 94 50" transform="rotate(-28 50 50)" fill="none" stroke="#000" stroke-width="11"/></mask><mask id="b" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><circle cx="50" cy="50" r="28" fill="#000"/></mask></defs><g transform="translate(10 10) scale(.8)" fill="none" stroke="#f5f5f7" stroke-width="5" stroke-linecap="round"><circle cx="50" cy="50" r="25" fill="#f5f5f7" stroke="none" mask="url(#p)"/><path d="M94 50A44 12.5 0 0 0 6 50" transform="rotate(-28 50 50)" mask="url(#b)"/><path d="M6 50A44 12.5 0 0 0 94 50" transform="rotate(-28 50 50)"/></g></svg>`;
