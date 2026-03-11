(() => {
    function s(o) {
        if (!o) return null;
        let e = o.replace(/[\x00-\x1f\x7f]/g, "").trim();
        try {
            let t = new URL(e);
            if (t.protocol === "https:" || t.protocol === "http:") return e
        } catch {}
        return null
    }
    var u = {
        en: {
            triggerTooltip: "Feedback",
            dialogLabel: "Feedback",
            triggerLabel: "Send feedback",
            placeholder: "Your feedback...",
            send: "Send",
            sending: "Sending...",
            thankYou: "Thank you for your feedback!",
            poweredBy: "Powered by",
            feedback: "Give feedback",
            bookCall: "Book a call",
            sentiments: {
                hate: "Hate it",
                dislike: "Not great",
                neutral: "It's okay",
                love: "Love it!"
            }
        },
        fr: {
            triggerTooltip: "Feedback",
            dialogLabel: "Feedback",
            triggerLabel: "Envoyer un retour",
            placeholder: "Votre retour...",
            send: "Envoyer",
            sending: "Envoi...",
            thankYou: "Merci pour votre retour\xA0!",
            poweredBy: "Propuls\xE9 par",
            feedback: "Donner un retour",
            bookCall: "Prendre rendez-vous",
            sentiments: {
                hate: "D\xE9teste",
                dislike: "Pas top",
                neutral: "\xC7a va",
                love: "J\u2019adore\xA0!"
            }
        }
    };

    function c(o) {
        let e = o.split("-")[0].toLowerCase();
        return u[e] ?? u.en
    }
    var v = {
            hate: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 9V16H5.5V9H4ZM12 9V16H10.5V9H12Z" style="fill:var(--pf-sentiment-hate)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8C1.5 4.41 4.41 1.5 8 1.5S14.5 4.41 14.5 8c0 1.58-.563 3.027-1.5 4.154v2.091A8 8 0 0016 8 8 8 0 000 8a7.99 7.99 0 003 6.245v-2.091A6.47 6.47 0 011.5 8zM8 14.5c.516 0 1.018-.06 1.5-.174v1.534A8 8 0 018 16a8 8 0 01-1.5-.14v-1.534c.482.114.984.174 1.5.174zm-2.214-6.135A2.745 2.745 0 015.25 7.75a2.745 2.745 0 012.536.615l-1.072 1.05A1.245 1.245 0 005.25 9.25c-.464 0-.88.193-1.178.415L3.786 8.365zm4.964.385c.373-.38.89-.615 1.464-.615s1.091.234 1.464.615l-1.071 1.05a1.245 1.245 0 00-1.464-.185l-.393-.865zM6.25 12h3.5a1.75 1.75 0 00-3.5 0z"/></svg>',
            dislike: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM16 8A8 8 0 110 8a8 8 0 0116 0zM5.75 7.75a1 1 0 100-2 1 1 0 000 2zm5.5-1a1 1 0 11-2 0 1 1 0 012 0zm.274 4.512l.348.52-1.038.695-.349-.52A3.37 3.37 0 008.001 10.63a3.37 3.37 0 00-2.482 1.303l-.349.519-1.038-.696.349-.518A4.62 4.62 0 018.001 9.38a4.62 4.62 0 013.524 1.882z"/></svg>',
            neutral: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM16 8A8 8 0 110 8a8 8 0 0116 0zm-4.475 2.848l.348-.52-1.038-.695-.349.52a3.37 3.37 0 01-2.485 1.327 3.37 3.37 0 01-2.482-1.303l-.349-.519-1.038.696.349.518A4.62 4.62 0 008.001 12.73a4.62 4.62 0 003.524-1.882zM6.75 6.75a1 1 0 11-2 0 1 1 0 012 0zm3.5 1a1 1 0 100-2 1 1 0 000 2z"/></svg>',
            love: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM16 8A8 8 0 110 8a8 8 0 0116 0zM4.5 8.975h-.625v.625c0 1.875 1.935 3.264 4.123 3.264 2.19 0 4.127-1.38 4.127-3.264v-.625H11.5h-7zm3.498 2.639c-1.404 0-2.36-.666-2.717-1.389h5.44c-.357.725-1.313 1.389-2.723 1.389z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.153 4.921L5.375 3.5l-.778 1.421L3 5.219l1.116 1.176L3.907 8l1.468-.694L6.843 8l-.21-1.605L7.75 5.219l-1.597-.298zm5.25 0L10.625 3.5l-.778 1.421L8.25 5.219l1.116 1.176L9.157 8l1.468-.694L12.093 8l-.21-1.605L13 5.219l-1.597-.298z" style="fill:var(--pf-sentiment-love)"/></svg>'
        },
        b = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
        k = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        x = '<svg width="14" height="14" viewBox="0 0 568 501" fill="currentColor"><path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.89-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664z"/></svg>',
        w = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        y = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/></svg>',
        L = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
        S = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
        M = ["hate", "dislike", "neutral", "love"],
        g = `
    --pf-background: rgba(15, 23, 42, 0.96);
    --pf-background: rgba(15, 23, 42, 0.96);
    --pf-foreground: #f1f5f9;
    --pf-primary: #5335cc;
    --pf-primary-foreground: #ffffff;
    --pf-primary-hover: #6842d6;
    --pf-muted: rgba(51, 65, 85, 0.92);
    --pf-muted-foreground: #cbd5e1;
    --pf-accent: rgba(83, 53, 204, 0.14);
    --pf-border: rgba(167, 139, 250, 0.24);
    --pf-input: rgba(100, 116, 139, 0.45);
    --pf-ring: #a78bfa;
    --pf-ring-shadow: rgba(167, 139, 250, 0.28);
    --pf-link: #a78bfa;
    --pf-link-hover: #d8b4fe;
    --pf-sentiment-hate: #60a5fa;
    --pf-sentiment-love: #fbbf24;
    --pf-backdrop: rgba(2, 6, 23, 0.72);
    --pf-shadow: 0 -24px 60px rgba(2, 6, 23, 0.5);
`,
        z = `
  :host {
    all: initial;
    color-scheme: light;
    --pf-background: rgba(15, 23, 42, 0.96);
    --pf-foreground: #f1f5f9;
    --pf-primary: #5335cc;
    --pf-primary-foreground: #ffffff;
    --pf-primary-hover: #6842d6;
    --pf-muted: rgba(51, 65, 85, 0.92);
    --pf-muted-foreground: #cbd5e1;
    --pf-accent: rgba(83, 53, 204, 0.14);
    --pf-border: rgba(167, 139, 250, 0.24);
    --pf-input: rgba(100, 116, 139, 0.45);
    --pf-ring: #a78bfa;
    --pf-ring-shadow: rgba(167, 139, 250, 0.28);
    --pf-link: #a78bfa;
    --pf-link-hover: #d8b4fe;
    --pf-sentiment-hate: #60a5fa;
    --pf-sentiment-love: #fbbf24;
    --pf-backdrop: rgba(2, 6, 23, 0.72);
    --pf-shadow: 0 -24px 60px rgba(2, 6, 23, 0.5);
    --pf-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  }

  :host([theme="dark"]) { color-scheme: dark; ${g} }

  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) { color-scheme: dark; ${g} }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .pf-trigger {
    position: fixed;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 1px solid var(--pf-border);
    background: var(--pf-background);
    color: var(--pf-foreground);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    z-index: 2147483646;
  }

  :host([position="bottom-left"]) .pf-trigger { bottom: 20px; left: 20px; }
  :host([position="top-right"]) .pf-trigger { top: 20px; right: 20px; }
  :host([position="top-left"]) .pf-trigger { top: 20px; left: 20px; }
  :host(:not([position])) .pf-trigger,
  :host([position="bottom-right"]) .pf-trigger { bottom: 20px; right: 20px; }

  .pf-trigger:hover {
    background: var(--pf-muted);
  }

  .pf-trigger-tooltip {
    position: absolute;
    background: var(--pf-primary);
    color: var(--pf-primary-foreground);
    font-size: 12px;
    line-height: 1;
    padding: 5px 8px;
    border-radius: calc(var(--pf-radius) * 0.6);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.15s, transform 0.15s;
  }

  /* Tooltip positioning for bottom-* (tooltip above trigger) */
  :host(:not([position])) .pf-trigger-tooltip,
  :host([position="bottom-right"]) .pf-trigger-tooltip,
  :host([position="bottom-left"]) .pf-trigger-tooltip {
    bottom: calc(100% + 8px);
  }
  :host(:not([position])) .pf-trigger-tooltip::after,
  :host([position="bottom-right"]) .pf-trigger-tooltip::after,
  :host([position="bottom-left"]) .pf-trigger-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    border: 4px solid transparent;
    border-top-color: var(--pf-primary);
  }

  /* Tooltip positioning for top-* (tooltip below trigger) */
  :host([position="top-right"]) .pf-trigger-tooltip,
  :host([position="top-left"]) .pf-trigger-tooltip {
    top: calc(100% + 8px);
  }
  :host([position="top-right"]) .pf-trigger-tooltip::after,
  :host([position="top-left"]) .pf-trigger-tooltip::after {
    content: "";
    position: absolute;
    bottom: 100%;
    border: 4px solid transparent;
    border-bottom-color: var(--pf-primary);
  }

  /* Tooltip horizontal alignment */
  :host(:not([position])) .pf-trigger-tooltip,
  :host([position="bottom-right"]) .pf-trigger-tooltip,
  :host([position="top-right"]) .pf-trigger-tooltip { right: 0; }
  :host(:not([position])) .pf-trigger-tooltip::after,
  :host([position="bottom-right"]) .pf-trigger-tooltip::after,
  :host([position="top-right"]) .pf-trigger-tooltip::after { right: 14px; }

  :host([position="bottom-left"]) .pf-trigger-tooltip,
  :host([position="top-left"]) .pf-trigger-tooltip { left: 0; }
  :host([position="bottom-left"]) .pf-trigger-tooltip::after,
  :host([position="top-left"]) .pf-trigger-tooltip::after { left: 14px; }

  .pf-trigger:hover .pf-trigger-tooltip {
    opacity: 1;
    transform: scale(1);
  }

  /* --- Menu popover (links mode) --- */
  .pf-menu {
    position: fixed;
    z-index: 2147483647;
    background: var(--pf-background);
    border: 1px solid var(--pf-border);
    border-radius: var(--pf-radius);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
    transition: opacity 0.15s, transform 0.15s;
  }

  .pf-menu.pf-menu-open {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  /* Menu position: above trigger for bottom-*, below for top-* */
  :host(:not([position])) .pf-menu,
  :host([position="bottom-right"]) .pf-menu {
    bottom: 70px; right: 20px;
  }
  :host([position="bottom-left"]) .pf-menu {
    bottom: 70px; left: 20px;
  }
  :host([position="top-right"]) .pf-menu {
    top: 70px; right: 20px;
  }
  :host([position="top-left"]) .pf-menu {
    top: 70px; left: 20px;
  }

  .pf-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    border-radius: calc(var(--pf-radius) * 0.8);
    background: transparent;
    color: var(--pf-foreground);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
    transition: background 0.1s;
  }

  .pf-menu-item:hover {
    background: var(--pf-muted);
  }

  .pf-menu-item svg {
    flex-shrink: 0;
    color: var(--pf-muted-foreground);
  }

  .pf-menu-separator {
    height: 1px;
    background: var(--pf-border);
    margin: 2px 4px;
  }

  .pf-menu-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    display: none;
  }

  .pf-menu-backdrop.pf-menu-open {
    display: block;
  }

  /* --- Feedback drawer --- */
  .pf-backdrop {
    position: fixed;
    inset: 0;
    background: var(--pf-backdrop);
    z-index: 2147483646;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }

  .pf-backdrop.pf-open {
    opacity: 1;
    pointer-events: auto;
  }

  .pf-popover {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--pf-background);
    border: 1px solid var(--pf-border);
    border-bottom: none;
    border-radius: calc(var(--pf-radius) * 1.8) calc(var(--pf-radius) * 1.8) 0 0;
    box-shadow: var(--pf-shadow);
    z-index: 2147483647;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    max-width: min(520px, 90vw);
    margin: 0 auto;
    overflow: hidden;
  }

  .pf-popover.pf-open {
    transform: translateY(0);
  }

  .pf-handle {
    width: 36px;
    height: 4px;
    background: var(--pf-border);
    border-radius: calc(var(--pf-radius) * 0.6);
    margin: 8px auto;
  }

  .pf-body {
    padding: 0 16px 8px;
  }

  .pf-textarea {
    width: 100%;
    min-height: 100px;
    border: 1px solid var(--pf-input);
    border-radius: var(--pf-radius);
    padding: 8px 10px;
    font-size: 16px;
    font-family: inherit;
    resize: none;
    outline: none;
    color: var(--pf-foreground);
    background: transparent;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .pf-textarea::placeholder {
    color: var(--pf-muted-foreground);
  }

  .pf-textarea:focus {
    border-color: var(--pf-ring);
    box-shadow: 0 0 0 3px var(--pf-ring-shadow, oklch(0.708 0 0 / 0.5));
  }

  .pf-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 16px 16px;
  }

  .pf-sentiments {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
  }

  .pf-sentiment-btn {
    width: 32px;
    height: 32px;
    border: 1px solid transparent;
    border-radius: var(--pf-radius);
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--pf-muted-foreground);
    transition: all 0.15s;
  }

  .pf-sentiment-btn:hover {
    background: var(--pf-muted);
    color: var(--pf-foreground);
  }

  .pf-sentiment-btn.pf-selected {
    background: var(--pf-accent);
    color: var(--pf-foreground);
    border-color: var(--pf-border);
  }

  .pf-sentiment-btn {
    position: relative;
  }

  .pf-tooltip {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%) scale(0.95);
    background: var(--pf-primary);
    color: var(--pf-primary-foreground);
    font-size: 12px;
    line-height: 1;
    padding: 4px 8px;
    border-radius: calc(var(--pf-radius) * 0.6);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s, transform 0.15s;
  }

  .pf-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--pf-primary);
  }

  .pf-sentiment-btn:hover .pf-tooltip {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  .pf-send-btn {
    height: 32px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: var(--pf-radius);
    background: var(--pf-primary);
    color: var(--pf-primary-foreground);
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
  }

  .pf-send-btn:hover {
    background: var(--pf-primary-hover);
  }

  .pf-send-btn:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .pf-success {
    padding: 32px 16px;
    text-align: center;
    color: var(--pf-foreground);
    font-size: 14px;
  }

  .pf-success-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .pf-powered {
    text-align: center;
    padding: 0 16px 10px;
    font-size: 10px;
    color: var(--pf-muted-foreground);
    opacity: 0.6;
  }

  .pf-powered a {
    color: var(--pf-link);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

    function d(o) {
        return !!o && !!(o.socialX || o.socialBluesky || o.socialLinkedin || o.socialSlack || o.socialDiscord || o.calendarLink)
    }
    var f = class extends HTMLElement {
        shadow;
        config;
        user = null;
        selectedSentiment = null;
        isOpen = !1;
        isMenuOpen = !1;
        links = null;
        t;
        static get observedAttributes() {
            return ["lang", "mode", "position", "theme"]
        }
        constructor() {
            super(), this.shadow = this.attachShadow({
                mode: "open"
            }), this.config = {
                project: this.getAttribute("project") || "",
                apiUrl: this.getAttribute("api-url") || "https://www.palmframe.com",
                mode: this.getAttribute("mode") || "live",
                position: this.getAttribute("position") || "bottom-right"
            }, this.t = c(this.resolveLocale())
        }
        resolveLocale() {
            return this.getAttribute("lang") || document.documentElement.lang || "en"
        }
        attributeChangedCallback(e) {
            e === "lang" ? (this.t = c(this.resolveLocale()), this.selectedSentiment = null, this.render(), this.attachEventListeners()) : e === "mode" ? this.config.mode = this.getAttribute("mode") || "live" : e === "position" && (this.config.position = this.getAttribute("position") || "bottom-right")
        }
        connectedCallback() {
            this.config = {
                project: this.getAttribute("project") || "",
                apiUrl: this.getAttribute("api-url") || "https://www.palmframe.com",
                mode: this.getAttribute("mode") || "live",
                position: this.getAttribute("position") || "bottom-right"
            }, this.t = c(this.resolveLocale());
            let e = window.palmframe;
            e?.user && (this.user = e.user), !this.escapeAncestorFilter() && (this.render(), this.attachEventListeners(), this.addEventListener("palmframe:open", () => this.openFeedback()), this.fetchLinks())
        }
        async fetchLinks() {
            try {
                let e = await fetch(`${this.config.apiUrl}/api/widget-config/${encodeURIComponent(this.config.project)}`);
                if (!e.ok) return;
                let t = await e.json();
                d(t) && (this.links = t, this.render(), this.attachEventListeners())
            } catch {}
        }
        escapeAncestorFilter() {
            let e = this.parentElement;
            for (; e;) {
                let t = getComputedStyle(e).filter;
                if (t && t !== "none") return document.documentElement.appendChild(this), !0;
                e = e.parentElement
            }
            return !1
        }
        identify(e) {
            this.user = e
        }
        renderMenuItems() {
            let e = [];
            e.push(`<button class="pf-menu-item" data-action="feedback">${b}<span>${this.t.feedback}</span></button>`);
            let t = s(this.links?.calendarLink ?? null);
            t && (e.push('<div class="pf-menu-separator"></div>'), e.push(`<a class="pf-menu-item" href="${t}" target="_blank" rel="noopener noreferrer">${S}<span>${this.t.bookCall}</span></a>`));
            let r = [],
                n = s(this.links?.socialX ?? null);
            n && r.push(`<a class="pf-menu-item" href="${n}" target="_blank" rel="noopener noreferrer">${k}<span>X</span></a>`);
            let a = s(this.links?.socialBluesky ?? null);
            a && r.push(`<a class="pf-menu-item" href="${a}" target="_blank" rel="noopener noreferrer">${x}<span>Bluesky</span></a>`);
            let p = s(this.links?.socialLinkedin ?? null);
            p && r.push(`<a class="pf-menu-item" href="${p}" target="_blank" rel="noopener noreferrer">${w}<span>LinkedIn</span></a>`);
            let l = s(this.links?.socialSlack ?? null);
            l && r.push(`<a class="pf-menu-item" href="${l}" target="_blank" rel="noopener noreferrer">${y}<span>Slack</span></a>`);
            let i = s(this.links?.socialDiscord ?? null);
            return i && r.push(`<a class="pf-menu-item" href="${i}" target="_blank" rel="noopener noreferrer">${L}<span>Discord</span></a>`), r.length && (e.push('<div class="pf-menu-separator"></div>'), e.push(...r)), e.join("")
        }
        render() {
            let e = d(this.links) ? `<div class="pf-menu-backdrop"></div><div class="pf-menu">${this.renderMenuItems()}</div>` : "";
            this.shadow.innerHTML = `
      <style>${z}</style>
      <button class="pf-trigger" aria-label="${this.t.triggerLabel}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        ${d(this.links) ? "" : `<span class="pf-trigger-tooltip">${this.t.triggerTooltip}</span>`}
      </button>
      ${e}
      <div class="pf-backdrop"></div>
      <div class="pf-popover" role="dialog" aria-label="${this.t.dialogLabel}">
        <div class="pf-handle"></div>
        <div class="pf-body">
          <textarea class="pf-textarea" placeholder="${this.t.placeholder}"></textarea>
        </div>
        <footer class="pf-footer">
          <div class="pf-sentiments">
            ${M.map(t => `<button class="pf-sentiment-btn" data-sentiment="${t}" aria-label="${this.t.sentiments[t]}">${v[t]}<span class="pf-tooltip">${this.t.sentiments[t]}</span></button>`).join("")}
          </div>
          <button class="pf-send-btn" disabled>${this.t.send}</button>
        </footer>
        <div class="pf-powered">${this.t.poweredBy} <a href="https://www.palmframe.com" target="_blank" rel="noopener">Palmframe</a></div>
      </div>
    `
        }
        attachEventListeners() {
            let e = this.shadow.querySelector(".pf-trigger"),
                t = this.shadow.querySelector(".pf-backdrop"),
                r = this.shadow.querySelector(".pf-textarea"),
                n = this.shadow.querySelector(".pf-send-btn"),
                a = this.shadow.querySelectorAll(".pf-sentiment-btn");
            e.addEventListener("click", () => {
                d(this.links) ? this.toggleMenu() : this.toggleFeedback()
            }), t.addEventListener("click", () => this.closeFeedback());
            let p = this.shadow.querySelector(".pf-menu-backdrop");
            p && p.addEventListener("click", () => this.closeMenu());
            let l = this.shadow.querySelector('[data-action="feedback"]');
            l && l.addEventListener("click", () => {
                this.closeMenu(), this.openFeedback()
            }), r.addEventListener("input", () => {
                this.updateSendState()
            }), a.forEach(i => {
                i.addEventListener("click", () => {
                    let h = i.dataset.sentiment;
                    this.selectedSentiment === h ? (this.selectedSentiment = null, i.classList.remove("pf-selected")) : (a.forEach(m => m.classList.remove("pf-selected")), this.selectedSentiment = h, i.classList.add("pf-selected")), this.updateSendState()
                })
            }), n.addEventListener("click", () => this.submit())
        }
        updateSendState() {
            let e = this.shadow.querySelector(".pf-textarea"),
                t = this.shadow.querySelector(".pf-send-btn");
            t.disabled = !e.value.trim() && !this.selectedSentiment
        }
        toggleFeedback() {
            this.isOpen ? this.closeFeedback() : this.openFeedback()
        }
        toggleMenu() {
            this.isMenuOpen ? this.closeMenu() : this.openMenu()
        }
        openMenu() {
            this.isMenuOpen = !0, this.shadow.querySelector(".pf-menu")?.classList.add("pf-menu-open"), this.shadow.querySelector(".pf-menu-backdrop")?.classList.add("pf-menu-open")
        }
        closeMenu() {
            this.isMenuOpen = !1, this.shadow.querySelector(".pf-menu")?.classList.remove("pf-menu-open"), this.shadow.querySelector(".pf-menu-backdrop")?.classList.remove("pf-menu-open")
        }
        openFeedback() {
            this.isOpen = !0, this.shadow.querySelector(".pf-backdrop").classList.add("pf-open"), this.shadow.querySelector(".pf-popover").classList.add("pf-open"), this.shadow.querySelector(".pf-trigger").classList.add("pf-open"), this.shadow.querySelector(".pf-textarea").focus()
        }
        closeFeedback() {
            this.isOpen = !1, this.shadow.querySelector(".pf-backdrop").classList.remove("pf-open"), this.shadow.querySelector(".pf-popover").classList.remove("pf-open"), this.shadow.querySelector(".pf-trigger").classList.remove("pf-open")
        }
        async submit() {
            let e = this.shadow.querySelector(".pf-textarea"),
                t = this.shadow.querySelector(".pf-send-btn"),
                r = this.shadow.querySelector(".pf-body"),
                n = this.shadow.querySelector(".pf-footer");
            t.disabled = !0, t.textContent = this.t.sending;
            try {
                await fetch(`${this.config.apiUrl}/api/feedback`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        project: this.config.project,
                        message: e.value.trim(),
                        sentiment: this.selectedSentiment,
                        url: window.location.href,
                        mode: this.config.mode,
                        ...this.user && {
                            user: this.user
                        }
                    })
                }), this.dispatchEvent(new CustomEvent("palmframe:submit", {
                    bubbles: !0,
                    detail: {
                        message: e.value.trim() || null,
                        sentiment: this.selectedSentiment
                    }
                })), r.innerHTML = `<div class="pf-success"><div class="pf-success-icon">&#10003;</div>${this.t.thankYou}</div>`, n.style.display = "none", setTimeout(() => {
                    this.closeFeedback(), setTimeout(() => {
                        this.selectedSentiment = null, this.render(), this.attachEventListeners()
                    }, 300)
                }, 1500)
            } catch {
                t.disabled = !1, t.textContent = this.t.send
            }
        }
    };
    customElements.get("palmframe-widget") || customElements.define("palmframe-widget", f);
})();