import type { Child } from "hono/jsx";
import { raw } from "hono/html";
import { SCRIPT_VERSION } from "../script";
import { STYLES_VERSION } from "../styles";
import { ART, FAVICON_SVG, MARK_SYMBOL } from "./art";

const FAVICON = "data:image/svg+xml," + encodeURIComponent(FAVICON_SVG);

export function Layout({ title, children }: { title: string; children: Child }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b0b0f" />
        <meta name="robots" content="noindex" />
        <title>{`${title} · Planary`}</title>
        <link rel="icon" href={FAVICON} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Unbounded:wght@300;400&display=swap"
        />
        <link rel="stylesheet" href={`/styles.css?v=${STYLES_VERSION}`} />
        <script src={`/auth.js?v=${SCRIPT_VERSION}`} defer></script>
      </head>
      <body>
        <div class="pl">
          <a class="skip" href="#main">
            Skip to content
          </a>
          <div class="site">
            {raw(MARK_SYMBOL)}
            <div class="au">
              <div class="au-main">
                <header class="au-top">
                  <div class="au-brand">
                    <a class="wm" href="/">
                      <svg class="wm-mark" viewBox="0 0 100 100" aria-hidden="true">
                        <use href="#pmark" />
                      </svg>
                      <span>Planary</span>
                    </a>
                    <span class="au-app">Account</span>
                  </div>
                  <a class="au-out ul" href="https://planary.ch">
                    planary.ch
                  </a>
                </header>
                <main id="main" tabindex={-1} class="au-body" aria-labelledby="au-h">
                  <div class="au-in">{children}</div>
                </main>
                <p class="au-fine">One sign-in for Planary Casino, Wishlist and Tournament.</p>
              </div>
              {raw(ART)}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
