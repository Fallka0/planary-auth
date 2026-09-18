import type { Child } from "hono/jsx";
import { STYLES_VERSION } from "../styles";

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#7c3aed"/><circle cx="20" cy="20" r="15.5" fill="none" stroke="#fbf9ff" stroke-width="4" stroke-dasharray="6.1 6.1"/><circle cx="20" cy="20" r="10.5" fill="#fbf9ff"/><path d="M17 26V14h4a3.4 3.4 0 0 1 0 6.8h-4" fill="none" stroke="#7c3aed" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  );

export function Chip({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" class="chip">
      <circle cx="20" cy="20" r="19" fill="var(--accent)" />
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="var(--paper)" stroke-width="4" stroke-dasharray="6.1 6.1" />
      <circle cx="20" cy="20" r="10.5" fill="var(--paper)" />
      <path d="M17 26V14h4a3.4 3.4 0 0 1 0 6.8h-4" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

/** The left-hand print: the account is the one thing every Planary app shares. */
function Poster() {
  return (
    <aside class="poster" aria-hidden="true">
      <div class="poster-p">
        <span class="plate plate-a">P</span>
        <span class="plate plate-b">P</span>
      </div>
      <div class="poster-copy">
        <p class="poster-title">One account</p>
        <p class="poster-caption">Every Planary app</p>
        <ul class="poster-apps">
          <li>Casino</li>
          <li>Blackjack</li>
          <li>Wishlist</li>
          <li>Tournament</li>
        </ul>
      </div>
    </aside>
  );
}

export function Layout({ title, children }: { title: string; children: Child }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f3f0fa" />
        <meta name="robots" content="noindex" />
        <title>{`${title} · Planary`}</title>
        <link rel="icon" href={FAVICON} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@700;800;900&family=Onest:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href={`/styles.css?v=${STYLES_VERSION}`} />
      </head>
      <body>
        <main class="page">
          <Poster />
          <section class="panel">
            <a class="brand" href="/">
              <Chip />
              <span class="brand-copy">
                <span class="brand-name">Planary</span>
                <span class="brand-sub">Account</span>
              </span>
            </a>
            <div class="panel-body">{children}</div>
            <p class="fineprint">
              One sign-in for Planary Casino, Blackjack, Wishlist and Tournament.
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
