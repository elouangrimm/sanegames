(() => {
  const DEFAULT_API_URL = "https://www.palmframe.com";
  const SENTIMENTS = ["hate", "dislike", "neutral", "love"];

  const TRANSLATIONS = {
    en: {
      triggerTooltip: "Feedback",
      dialogLabel: "Feedback",
      triggerLabel: "Send feedback",
      placeholder: "Your feedback...",
      send: "Send",
      sending: "Sending...",
      thankYou: "Thank you for your feedback!",
      feedback: "Give feedback",
      bookCall: "Book a call",
      sentiments: {
        hate: "Hate it",
        dislike: "Not great",
        neutral: "It's okay",
        love: "Love it!",
      },
    },
    fr: {
      triggerTooltip: "Feedback",
      dialogLabel: "Feedback",
      triggerLabel: "Envoyer un retour",
      placeholder: "Votre retour...",
      send: "Envoyer",
      sending: "Envoi...",
      thankYou: "Merci pour votre retour!",
      feedback: "Donner un retour",
      bookCall: "Prendre rendez-vous",
      sentiments: {
        hate: "Deteste",
        dislike: "Pas top",
        neutral: "Ca va",
        love: "J'adore!",
      },
    },
  };

  const ICONS = {
    trigger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    feedback: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    bluesky: '<svg width="14" height="14" viewBox="0 0 568 501" fill="currentColor" aria-hidden="true"><path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.89-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664z"/></svg>',
    linkedin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    slack: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/></svg>',
    discord: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
    hate: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 9V16H5.5V9H4ZM12 9V16H10.5V9H12Z" style="fill:var(--pf-sentiment-hate)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8C1.5 4.41 4.41 1.5 8 1.5S14.5 4.41 14.5 8c0 1.58-.563 3.027-1.5 4.154v2.091A8 8 0 0016 8 8 8 0 000 8a7.99 7.99 0 003 6.245v-2.091A6.47 6.47 0 011.5 8zM8 14.5c.516 0 1.018-.06 1.5-.174v1.534A8 8 0 018 16a8 8 0 01-1.5-.14v-1.534c.482.114.984.174 1.5.174zm-2.214-6.135A2.745 2.745 0 015.25 7.75a2.745 2.745 0 012.536.615l-1.072 1.05A1.245 1.245 0 005.25 9.25c-.464 0-.88.193-1.178.415L3.786 8.365zm4.964.385c.373-.38.89-.615 1.464-.615s1.091.234 1.464.615l-1.071 1.05a1.245 1.245 0 00-1.464-.185l-.393-.865zM6.25 12h3.5a1.75 1.75 0 00-3.5 0z"/></svg>',
    dislike: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM16 8A8 8 0 110 8a8 8 0 0116 0zM5.75 7.75a1 1 0 100-2 1 1 0 000 2zm5.5-1a1 1 0 11-2 0 1 1 0 012 0zm.274 4.512l.348.52-1.038.695-.349-.52A3.37 3.37 0 008.001 10.63a3.37 3.37 0 00-2.482 1.303l-.349.519-1.038-.696.349-.518A4.62 4.62 0 018.001 9.38a4.62 4.62 0 013.524 1.882z"/></svg>',
    neutral: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM16 8A8 8 0 110 8a8 8 0 0116 0zm-4.475 2.848l.348-.52-1.038-.695-.349.52a3.37 3.37 0 01-2.485 1.327 3.37 3.37 0 01-2.482-1.303l-.349-.519-1.038.696.349.518A4.62 4.62 0 008.001 12.73a4.62 4.62 0 003.524-1.882zM6.75 6.75a1 1 0 11-2 0 1 1 0 012 0zm3.5 1a1 1 0 100-2 1 1 0 000 2z"/></svg>',
    love: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM16 8A8 8 0 110 8a8 8 0 0116 0zM4.5 8.975h-.625v.625c0 1.875 1.935 3.264 4.123 3.264 2.19 0 4.127-1.38 4.127-3.264v-.625H11.5h-7zm3.498 2.639c-1.404 0-2.36-.666-2.717-1.389h5.44c-.357.725-1.313 1.389-2.723 1.389z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.153 4.921L5.375 3.5l-.778 1.421L3 5.219l1.116 1.176L3.907 8l1.468-.694L6.843 8l-.21-1.605L7.75 5.219l-1.597-.298zm5.25 0L10.625 3.5l-.778 1.421L8.25 5.219l1.116 1.176L9.157 8l1.468-.694L12.093 8l-.21-1.605L13 5.219l-1.597-.298z" style="fill:var(--pf-sentiment-love)"/></svg>',
  };

  function sanitizeUrl(value) {
    if (!value) {
      return null;
    }

    const cleaned = value.replace(/[\x00-\x1f\x7f]/g, "").trim();

    try {
      const parsed = new URL(cleaned);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return cleaned;
      }
    } catch {
      return null;
    }

    return null;
  }

  function getTranslations(locale) {
    const language = locale.split("-")[0].toLowerCase();
    return TRANSLATIONS[language] ?? TRANSLATIONS.en;
  }

  function hasLinks(links) {
    return Boolean(
      links &&
        (links.socialX ||
          links.socialBluesky ||
          links.socialLinkedin ||
          links.socialSlack ||
          links.socialDiscord ||
          links.calendarLink)
    );
  }

  class PalmframeWidget extends HTMLElement {
    static get observedAttributes() {
      return ["lang", "mode", "position", "theme", "api-url"];
    }

    constructor() {
      super();
      this.config = this.readConfig();
      this.user = null;
      this.selectedSentiment = null;
      this.message = "";
      this.isOpen = false;
      this.isMenuOpen = false;
      this.links = null;
      this.translations = getTranslations(this.resolveLocale());
    }

    connectedCallback() {
      this.config = this.readConfig();
      this.translations = getTranslations(this.resolveLocale());

      const palmframeState = window.palmframe;
      if (palmframeState?.user) {
        this.user = palmframeState.user;
      }

      if (this.escapeAncestorFilter()) {
        return;
      }

      this.render();
      this.addEventListener("palmframe:open", () => this.openFeedback());
      this.fetchLinks();
    }

    attributeChangedCallback(name) {
      if (!this.isConnected) {
        return;
      }

      if (name === "lang") {
        this.translations = getTranslations(this.resolveLocale());
        this.selectedSentiment = null;
      }

      this.config = this.readConfig();
      this.render();
    }

    readConfig() {
      return {
        project: this.getAttribute("project") || "",
        apiUrl: this.getAttribute("api-url") || DEFAULT_API_URL,
        mode: this.getAttribute("mode") || "live",
        position: this.getAttribute("position") || "bottom-right",
      };
    }

    resolveLocale() {
      return this.getAttribute("lang") || document.documentElement.lang || "en";
    }

    escapeAncestorFilter() {
      let ancestor = this.parentElement;

      while (ancestor) {
        const filter = getComputedStyle(ancestor).filter;
        if (filter && filter !== "none") {
          document.documentElement.appendChild(this);
          return true;
        }
        ancestor = ancestor.parentElement;
      }

      return false;
    }

    identify(user) {
      this.user = user;
    }

    async fetchLinks() {
      if (!this.config.project) {
        return;
      }

      try {
        const response = await fetch(
          `${this.config.apiUrl}/api/widget-config/${encodeURIComponent(this.config.project)}`
        );

        if (!response.ok) {
          return;
        }

        const widgetConfig = await response.json();
        if (!hasLinks(widgetConfig)) {
          return;
        }

        this.links = widgetConfig;
        this.render();
      } catch {
        // Ignore widget-config fetch failures.
      }
    }

    query(selector) {
      return this.querySelector(selector);
    }

    queryAll(selector) {
      return this.querySelectorAll(selector);
    }

    renderMenuItems() {
      const items = [
        `<button class="pf-menu-item" type="button" data-action="feedback">${ICONS.feedback}<span>${this.translations.feedback}</span></button>`,
      ];

      const calendarLink = sanitizeUrl(this.links?.calendarLink ?? null);
      if (calendarLink) {
        items.push('<div class="pf-menu-separator"></div>');
        items.push(
          `<a class="pf-menu-item" href="${calendarLink}" target="_blank" rel="noopener noreferrer">${ICONS.calendar}<span>${this.translations.bookCall}</span></a>`
        );
      }

      const socialItems = [];
      const socialLinks = [
        ["socialX", "X", ICONS.x],
        ["socialBluesky", "Bluesky", ICONS.bluesky],
        ["socialLinkedin", "LinkedIn", ICONS.linkedin],
        ["socialSlack", "Slack", ICONS.slack],
        ["socialDiscord", "Discord", ICONS.discord],
      ];

      socialLinks.forEach(([key, label, icon]) => {
        const url = sanitizeUrl(this.links?.[key] ?? null);
        if (!url) {
          return;
        }

        socialItems.push(
          `<a class="pf-menu-item" href="${url}" target="_blank" rel="noopener noreferrer">${icon}<span>${label}</span></a>`
        );
      });

      if (socialItems.length > 0) {
        items.push('<div class="pf-menu-separator"></div>');
        items.push(...socialItems);
      }

      return items.join("");
    }

    render() {
      const showMenu = hasLinks(this.links);
      this.setAttribute("position", this.config.position);

      const sentimentButtons = SENTIMENTS.map((sentiment) => {
        const isSelected = this.selectedSentiment === sentiment ? " pf-selected" : "";
        const label = this.translations.sentiments[sentiment];

        return `
          <button class="pf-sentiment-btn${isSelected}" type="button" data-sentiment="${sentiment}" aria-label="${label}">
            ${ICONS[sentiment]}
            <span class="pf-tooltip">${label}</span>
          </button>
        `;
      }).join("");

      this.innerHTML = `
        <button class="pf-trigger" type="button" aria-label="${this.translations.triggerLabel}">
          ${ICONS.trigger}
          ${showMenu ? "" : `<span class="pf-trigger-tooltip">${this.translations.triggerTooltip}</span>`}
        </button>
        ${showMenu ? `<div class="pf-menu-backdrop"></div><div class="pf-menu">${this.renderMenuItems()}</div>` : ""}
        <div class="pf-backdrop"></div>
        <div class="pf-popover" role="dialog" aria-label="${this.translations.dialogLabel}" aria-modal="true">
          <div class="pf-handle"></div>
          <div class="pf-body">
            <textarea class="pf-textarea" placeholder="${this.translations.placeholder}"></textarea>
          </div>
          <footer class="pf-footer">
            <div class="pf-sentiments">${sentimentButtons}</div>
            <button class="pf-send-btn" type="button" disabled>${this.translations.send}</button>
          </footer>
        </div>
      `;

      this.attachEventListeners();
      const textarea = this.query(".pf-textarea");
      if (textarea) {
        textarea.value = this.message;
      }
      this.updateSendState();
    }

    attachEventListeners() {
      const trigger = this.query(".pf-trigger");
      const backdrop = this.query(".pf-backdrop");
      const textarea = this.query(".pf-textarea");
      const sendButton = this.query(".pf-send-btn");
      const sentimentButtons = this.queryAll(".pf-sentiment-btn");
      const menuBackdrop = this.query(".pf-menu-backdrop");
      const feedbackButton = this.query('[data-action="feedback"]');

      trigger?.addEventListener("click", () => {
        if (hasLinks(this.links)) {
          this.toggleMenu();
          return;
        }

        this.toggleFeedback();
      });

      backdrop?.addEventListener("click", () => this.closeFeedback());
      menuBackdrop?.addEventListener("click", () => this.closeMenu());
      feedbackButton?.addEventListener("click", () => {
        this.closeMenu();
        this.openFeedback();
      });
      textarea?.addEventListener("input", () => {
        this.message = textarea.value;
        this.updateSendState();
      });

      sentimentButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const sentiment = button.dataset.sentiment;
          if (!sentiment) {
            return;
          }

          this.selectedSentiment = this.selectedSentiment === sentiment ? null : sentiment;
          this.render();
        });
      });

      sendButton?.addEventListener("click", () => this.submit());
    }

    updateSendState() {
      const textarea = this.query(".pf-textarea");
      const sendButton = this.query(".pf-send-btn");

      if (!textarea || !sendButton) {
        return;
      }

      sendButton.disabled = !textarea.value.trim() && !this.selectedSentiment;
    }

    toggleFeedback() {
      if (this.isOpen) {
        this.closeFeedback();
        return;
      }

      this.openFeedback();
    }

    toggleMenu() {
      if (this.isMenuOpen) {
        this.closeMenu();
        return;
      }

      this.openMenu();
    }

    openMenu() {
      this.isMenuOpen = true;
      this.query(".pf-menu")?.classList.add("pf-menu-open");
      this.query(".pf-menu-backdrop")?.classList.add("pf-menu-open");
    }

    closeMenu() {
      this.isMenuOpen = false;
      this.query(".pf-menu")?.classList.remove("pf-menu-open");
      this.query(".pf-menu-backdrop")?.classList.remove("pf-menu-open");
    }

    openFeedback() {
      this.isOpen = true;
      this.query(".pf-backdrop")?.classList.add("pf-open");
      this.query(".pf-popover")?.classList.add("pf-open");
      this.query(".pf-trigger")?.classList.add("pf-open");
      this.query(".pf-textarea")?.focus();
    }

    closeFeedback() {
      this.isOpen = false;
      this.query(".pf-backdrop")?.classList.remove("pf-open");
      this.query(".pf-popover")?.classList.remove("pf-open");
      this.query(".pf-trigger")?.classList.remove("pf-open");
    }

    async submit() {
      const textarea = this.query(".pf-textarea");
      const sendButton = this.query(".pf-send-btn");
      const body = this.query(".pf-body");
      const footer = this.query(".pf-footer");

      if (!textarea || !sendButton || !body || !footer) {
        return;
      }

      sendButton.disabled = true;
      sendButton.textContent = this.translations.sending;

      try {
        await fetch(`${this.config.apiUrl}/api/feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project: this.config.project,
            message: textarea.value.trim(),
            sentiment: this.selectedSentiment,
            url: window.location.href,
            mode: this.config.mode,
            ...(this.user ? { user: this.user } : {}),
          }),
        });

        this.dispatchEvent(
          new CustomEvent("palmframe:submit", {
            bubbles: true,
            detail: {
              message: textarea.value.trim() || null,
              sentiment: this.selectedSentiment,
            },
          })
        );

        this.message = "";
        body.innerHTML = `<div class="pf-success"><div class="pf-success-icon">&#10003;</div>${this.translations.thankYou}</div>`;
        footer.style.display = "none";

        window.setTimeout(() => {
          this.closeFeedback();
          window.setTimeout(() => {
            this.selectedSentiment = null;
            this.render();
          }, 300);
        }, 1500);
      } catch {
        sendButton.disabled = false;
        sendButton.textContent = this.translations.send;
      }
    }
  }

  if (!customElements.get("palmframe-widget")) {
    customElements.define("palmframe-widget", PalmframeWidget);
  }
})();