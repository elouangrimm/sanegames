const adBlockList = [
    "doubleclick.net",
    "adservice.google.com",
    "googlesyndication.com",
    "ads.crazygames.com",
    "pagead2.googlesyndication.com",
    "securepubads.g.doubleclick.net",
    "cpx.to",
    "adnxs.com",
    "googletagmanager.com",
    "imasdk.googleapis.com",
];

// Dev-only ad test mode. Keep false for production.
const DEV_AD_TEST_MODE = false;
const DEV_AUTO_CONTINUE_BUTTON_ID = "mainContinuePlayingButton";
const DEV_AD_TIMEOUT_MIN_MS = 2000;
const DEV_AD_TIMEOUT_REPLACEMENT_MS = 0;

const CRAZYGAMES_API_BASE = "https://api.crazygames.com/v4/en_US";
const BROWSE_TERMS = [
    "action",
    "io",
    "driving",
    "shooting",
    "multiplayer",
    "horror",
    "puzzle",
    "sports",
    "2 player",
];
const PLAYED_GAMES_STORAGE_KEY = "sanegames.recentlyPlayed";
const UI_SETTINGS_STORAGE_KEY = "sanegames.uiSettings";

const defaultUiSettings = {
    disableApiBrowsing: false,
    disableTopGames: false,
    disablePalmframe: false,
};

let cachedTopGames = [];
let explorerInitialized = false;
let uiSettings = { ...defaultUiSettings };
let searchHasRun = false;
let topGamesVisibleCount = 8;
const TOP_GAMES_PAGE_SIZE = 8;

// --- Constants for UI Modification & Polling ---
const BUTTON_TO_MODIFY_TEXT_SELECTOR = ".MuiButtonBase-root.css-1fs4034";
const BUTTON_NEW_TEXT = "Continue (CLICK HERE)";

const DIV_ONE_SELECTOR = ".css-1bkw7cw"; // For "Start Playing"
const DIV_ONE_NEW_TEXT = "Start Playing";

const DIV_TWO_SELECTOR = ".css-1uzrx98"; // For "Sorry about this popup..."
const DIV_TWO_NEW_TEXT =
    "Sorry about this popup, just ignore it and click continue!";

const MUI_BUTTON_TO_REMOVE_SELECTOR = ".MuiButtonBase-root.css-b48h4t";

let uiModificationPollingInterval = null;
let uiModificationPollingTimeout = null;
const UI_POLL_DURATION_MS = 60 * 1000; // 1 minute
const UI_POLL_INTERVAL_MS = 300; // Check every 300ms

// Flags to track if modifications are done (for polling)
let buttonTextModified = false;
let divOneTextModified = false;
let divTwoTextModified = false;

function shouldFastTrackAdTimer(callbackSource, delay) {
    if (delay < DEV_AD_TIMEOUT_MIN_MS) return false;
    return /(ad|fallback|securitycountdown|onadcompleted|cooldown|midroll|rewarded|preroll|requested|displaying)/i.test(
        callbackSource
    );
}

function enableDevAdTestingPatches() {
    if (!DEV_AD_TEST_MODE || typeof window === "undefined") return;
    if (window.__sanegamesDevAdPatchesEnabled) return;
    window.__sanegamesDevAdPatchesEnabled = true;

    const originalSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = function (callback, delay = 0, ...args) {
        let adjustedDelay = delay;
        try {
            const numericDelay = Number(delay) || 0;
            const callbackSource =
                typeof callback === "function"
                    ? Function.prototype.toString.call(callback)
                    : String(callback || "");

            if (shouldFastTrackAdTimer(callbackSource, numericDelay)) {
                adjustedDelay = DEV_AD_TIMEOUT_REPLACEMENT_MS;
                console.warn(
                    "SaneGames: Dev mode fast-tracked ad timer",
                    numericDelay,
                    "ms ->",
                    adjustedDelay,
                    "ms"
                );
            }
        } catch (error) {
            console.error(
                "SaneGames: Dev mode setTimeout patch failed, using original delay.",
                error
            );
        }

        return originalSetTimeout(callback, adjustedDelay, ...args);
    };

    console.warn("SaneGames: Dev ad test mode is ENABLED.");
}

(function blockAds() {
    if (!DEV_AD_TEST_MODE) return;
    if (typeof window === "undefined") return; // Guard for non-browser environments

    let originalFetch = window.fetch;
    window.fetch = async function (...args) {
        try {
            if (
                args[0] &&
                typeof args[0] === "string" &&
                adBlockList.some((domain) => args[0].includes(domain))
            ) {
                console.warn(
                    "SaneGames: Intercepted ad request (fetch):",
                    args[0]
                );
                return new Response("{}", {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }
        } catch (e) {
            console.error("SaneGames: Error in fetch override", e);
        }
        return originalFetch.apply(this, args);
    };

    if (typeof XMLHttpRequest !== "undefined") {
        let originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            try {
                if (
                    url &&
                    typeof url === "string" &&
                    adBlockList.some((domain) => url.includes(domain))
                ) {
                    console.warn(
                        "SaneGames: Intercepted ad request (XHR):",
                        url
                    );
                    // Effectively neuter the request
                    this.send = () => {
                        console.log("SaneGames: Blocked XHR send to " + url);
                    };
                    Object.defineProperty(this, "readyState", {
                        value: 4,
                        writable: false,
                    });
                    Object.defineProperty(this, "status", {
                        value: 200,
                        writable: false,
                    });
                    Object.defineProperty(this, "responseText", {
                        value: "{}",
                        writable: false,
                    });
                    Object.defineProperty(this, "response", {
                        value: {},
                        writable: false,
                    });
                    if (this.onload) {
                        try {
                            this.onload();
                        } catch (e) {}
                    }
                    if (this.onreadystatechange) {
                        try {
                            this.onreadystatechange();
                        } catch (e) {}
                    }
                    return; // End here, don't call originalOpen
                }
            } catch (e) {
                console.error("SaneGames: Error in XHR.open override", e);
            }
            return originalOpen.apply(this, arguments);
        };
    }
})();

function applyUiModifications() {
    if (!DEV_AD_TEST_MODE) return;
    if (typeof document === "undefined") return;

    // --- 1. Modify Text Content of Target Elements ---
    if (!buttonTextModified) {
        const buttonNode = document.querySelector(
            BUTTON_TO_MODIFY_TEXT_SELECTOR
        );
        if (buttonNode instanceof HTMLElement) {
            let textContainer = buttonNode.querySelector(
                ".MuiButton-label, .MuiButton-label-root, span"
            );
            let currentText = textContainer
                ? textContainer.textContent
                : buttonNode.textContent;
            if (currentText !== BUTTON_NEW_TEXT) {
                if (textContainer) textContainer.textContent = BUTTON_NEW_TEXT;
                else buttonNode.textContent = BUTTON_NEW_TEXT;
                console.log(
                    `SaneGames: Changed text of button matching "${BUTTON_TO_MODIFY_TEXT_SELECTOR}"`
                );
            }
            buttonTextModified = true;
        }
    }

    if (!divOneTextModified) {
        const divOneNode = document.querySelector(DIV_ONE_SELECTOR);
        if (divOneNode instanceof HTMLElement) {
            if (divOneNode.textContent !== DIV_ONE_NEW_TEXT) {
                divOneNode.textContent = DIV_ONE_NEW_TEXT;
                console.log(
                    `SaneGames: Changed text of div matching "${DIV_ONE_SELECTOR}"`
                );
            }
            divOneTextModified = true;
        }
    }

    if (!divTwoTextModified) {
        const divTwoNode = document.querySelector(DIV_TWO_SELECTOR);
        if (divTwoNode instanceof HTMLElement) {
            if (divTwoNode.textContent !== DIV_TWO_NEW_TEXT) {
                divTwoNode.textContent = DIV_TWO_NEW_TEXT;
                console.log(
                    `SaneGames: Changed text of div matching "${DIV_TWO_SELECTOR}"`
                );
            }
            divTwoTextModified = true;
        }
    }

    // --- 2. Element Removals ---
    const selectorsToRemove = [
        MUI_BUTTON_TO_REMOVE_SELECTOR,
        "#crazygames-ad",
        ".ad-container",
    ];

    selectorsToRemove.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
            if (el.parentNode) {
                console.warn(
                    `SaneGames: Removed element matching selector "${selector}":`,
                    el.tagName,
                    el.id,
                    el.className
                );
                el.remove();
            }
        });
    });

    const continueButton = document.getElementById(DEV_AUTO_CONTINUE_BUTTON_ID);
    if (continueButton instanceof HTMLButtonElement) {
        const lastClickAt = Number(
            continueButton.getAttribute("data-sanegames-last-autoclick") || "0"
        );
        const now = Date.now();
        const visible = continueButton.offsetParent !== null;
        if (!continueButton.disabled && visible && now - lastClickAt > 750) {
            continueButton.setAttribute(
                "data-sanegames-last-autoclick",
                String(now)
            );
            continueButton.click();
            console.warn("SaneGames: Dev mode auto-clicked continue button.");
        }
    }

    // --- 3. Broader ad-blocking/element removal logic ---
    document
        .querySelectorAll(
            "iframe, script, div, img, ins, video, style, button, a"
        )
        .forEach((el) => {
            if (
                el.matches &&
                (el.matches(BUTTON_TO_MODIFY_TEXT_SELECTOR) ||
                    el.matches(DIV_ONE_SELECTOR) ||
                    el.matches(DIV_TWO_SELECTOR) ||
                    el.matches(MUI_BUTTON_TO_REMOVE_SELECTOR))
            ) {
                return;
            }

            const elSrc = el.src || el.href || el.data || el.poster;
            const elId = el.id || "";
            const elClass =
                el.className ||
                (el.classList ? Array.from(el.classList).join(" ") : "");
            let isPotentialAdOrAnnoyance = false;

            if (
                elSrc &&
                typeof elSrc === "string" &&
                adBlockList.some((domain) => elSrc.includes(domain))
            ) {
                isPotentialAdOrAnnoyance = true;
            } else if (
                adBlockList.some((keyword) => {
                    const simpleKeyword = keyword.split(".")[0];
                    return (
                        (typeof elId === "string" &&
                            elId.toLowerCase().includes(simpleKeyword)) ||
                        (typeof elClass === "string" &&
                            elClass.toLowerCase().includes(simpleKeyword))
                    );
                })
            ) {
                isPotentialAdOrAnnoyance = true;
            } else {
                const commonAdKeywords = [
                    "adbox",
                    "advert",
                    "google_ads",
                    "banner_ad",
                    "promo",
                    "sponsor",
                ];
                if (
                    commonAdKeywords.some(
                        (keyword) =>
                            (typeof elId === "string" &&
                                elId.toLowerCase().includes(keyword)) ||
                            (typeof elClass === "string" &&
                                elClass.toLowerCase().includes(keyword))
                    )
                ) {
                    isPotentialAdOrAnnoyance = true;
                }
            }

            if (isPotentialAdOrAnnoyance && el.parentNode) {
                console.warn(
                    "SaneGames: Removed potential ad/annoying element (generic):",
                    el.tagName,
                    el.id,
                    el.className,
                    elSrc
                );
                el.remove();
            }
        });

    if (
        buttonTextModified &&
        divOneTextModified &&
        divTwoTextModified &&
        uiModificationPollingInterval
    ) {
        console.log(
            "SaneGames: All target UI elements appear modified. Stopping poll from applyUiModifications."
        );
        stopPollingForUiModifications();
    }
}

function startPollingForUiModifications() {
    if (!DEV_AD_TEST_MODE) return;
    if (uiModificationPollingInterval) return;

    buttonTextModified = false;
    divOneTextModified = false;
    divTwoTextModified = false;

    console.log("SaneGames: Starting to poll for UI modifications.");
    if (uiModificationPollingTimeout)
        clearTimeout(uiModificationPollingTimeout);

    uiModificationPollingInterval = setInterval(() => {
        applyUiModifications();
    }, UI_POLL_INTERVAL_MS);

    uiModificationPollingTimeout = setTimeout(() => {
        if (uiModificationPollingInterval) {
            console.log(
                "SaneGames: UI modification polling duration exceeded. Stopping poll."
            );
            stopPollingForUiModifications();
        }
    }, UI_POLL_DURATION_MS);
}

function stopPollingForUiModifications() {
    if (uiModificationPollingInterval) {
        clearInterval(uiModificationPollingInterval);
        uiModificationPollingInterval = null;
        console.log("SaneGames: Polling for UI modifications stopped.");
    }
    if (uiModificationPollingTimeout) {
        clearTimeout(uiModificationPollingTimeout);
        uiModificationPollingTimeout = null;
    }
}

if (typeof window !== "undefined" && typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => {
        applyUiModifications();
    });

    const startObserver = () => {
        if (!DEV_AD_TEST_MODE) return;
        if (document.body) {
            applyUiModifications(); // Initial run
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                applyUiModifications(); // Initial run
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            });
        }
    };
    startObserver();
}

function normalizeCoverPath(game) {
    if (!game) return "";
    const coverPath = (game.covers && game.covers["16x9"]) || game.cover || "";
    if (!coverPath) return "";
    if (coverPath.startsWith("http://") || coverPath.startsWith("https://")) {
        return coverPath;
    }
    return `https://imgs.crazygames.com/${coverPath}`;
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getGameBadges(game) {
    const badges = [];
    if (game.mobileFriendly) badges.push("Mobile");
    if (game.hasIap) badges.push("IAP");
    if (game.categoryName) badges.push(String(game.categoryName));
    return badges.slice(0, 3);
}

function filterGames(records) {
    if (!Array.isArray(records)) return [];
    return records.filter((item) => {
        if (!item) return false;
        if (item.recordType === "tag") return false;
        if (item.recordType === "game") return true;
        return Boolean(item.slug && item.name);
    });
}

function filterTags(records) {
    if (!Array.isArray(records)) return [];
    return records.filter((item) => item && item.recordType === "tag").slice(0, 8);
}

function setSearchSummary(text) {
    const label = document.getElementById("activeBrowseTerm");
    if (label) label.textContent = text || "";
}

function loadUiSettings() {
    if (typeof window === "undefined") return { ...defaultUiSettings };
    try {
        const parsed = JSON.parse(
            window.localStorage.getItem(UI_SETTINGS_STORAGE_KEY) || "{}"
        );
        return {
            ...defaultUiSettings,
            ...parsed,
        };
    } catch (error) {
        console.warn("SaneGames: Failed reading UI settings.", error);
        return { ...defaultUiSettings };
    }
}

function saveUiSettings() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(uiSettings));
}

function updateSettingsUi() {
    const disableApiToggle = document.getElementById("toggleDisableApi");
    const disableTopToggle = document.getElementById("toggleDisableTopGames");
    const disablePalmframeToggle = document.getElementById("toggleDisablePalmframe");

    if (disableApiToggle) disableApiToggle.checked = uiSettings.disableApiBrowsing;
    if (disableTopToggle) disableTopToggle.checked = uiSettings.disableTopGames;
    if (disablePalmframeToggle) disablePalmframeToggle.checked = uiSettings.disablePalmframe;

    const explorerPanels = document.getElementById("explorerPanels");
    const searchPanel = document.getElementById("searchPanel");
    const resultsPanel = document.getElementById("resultsPanel");
    const browsePanel = document.getElementById("browsePanel");
    const apiNotice = document.getElementById("apiDisabledNotice");
    const topPanel = document.getElementById("topGamesPanel");
    const surpriseButton = document.getElementById("surpriseButton");

    if (explorerPanels) explorerPanels.hidden = false;
    if (searchPanel) {
        searchPanel.hidden = uiSettings.disableApiBrowsing;
    }
    if (resultsPanel) {
        resultsPanel.hidden = uiSettings.disableApiBrowsing || !searchHasRun;
    }
    if (browsePanel) {
        browsePanel.hidden = uiSettings.disableApiBrowsing;
    }
    if (apiNotice) {
        apiNotice.hidden = !uiSettings.disableApiBrowsing;
    }
    if (topPanel) {
        topPanel.hidden = Boolean(uiSettings.disableTopGames || uiSettings.disableApiBrowsing);
    }
    if (surpriseButton) {
        surpriseButton.disabled = Boolean(uiSettings.disableApiBrowsing || uiSettings.disableTopGames);
    }
}

function updateTopGamesMoreButton() {
    const button = document.getElementById("loadMoreTopGamesButton");
    if (!button) return;
    if (uiSettings.disableApiBrowsing || uiSettings.disableTopGames || !cachedTopGames.length) {
        button.hidden = true;
        return;
    }

    const remaining = Math.max(0, cachedTopGames.length - topGamesVisibleCount);
    button.hidden = remaining <= 0;
    button.textContent = remaining > 0 ? `More (${remaining})` : "More";
}

function renderTopGamesSection() {
    const visibleGames = cachedTopGames.slice(0, topGamesVisibleCount);
    renderGameGrid(
        "topGamesGrid",
        visibleGames,
        "Could not load top games from the API right now."
    );
    updateTopGamesMoreButton();
}

function clearSearchResults() {
    searchHasRun = false;
    renderGameGrid("searchResults", [], "Search results will appear here.");
    renderTagSuggestions([]);
    setSearchSummary("Try a query or tap a theme to explore.");
    updateSettingsUi();
}

function openSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.hidden = false;
}

function closeSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.hidden = true;
}

function applyUiSettings() {
    updateSettingsUi();
    setFeedbackWidgetVisibility(!uiSettings.disablePalmframe);

    if (uiSettings.disableApiBrowsing) {
        setSearchSummary("API browsing is disabled. Enable it in settings.");
        updateTopGamesMoreButton();
        return;
    }

    if (uiSettings.disableTopGames) {
        setSearchSummary("Search and themes are active. Top picks are disabled.");
    } else {
        setSearchSummary("Try a query or tap a theme to explore.");
    }

    if (!uiSettings.disableTopGames) {
        refreshTopGames();
    } else {
        updateTopGamesMoreButton();
    }
}

function setSearchBusy(isBusy) {
    const searchButton = document.getElementById("searchGamesButton");
    if (!searchButton) return;
    searchButton.disabled = isBusy;
    searchButton.textContent = isBusy ? "Searching..." : "Search";
}

function renderGameGrid(targetId, games, emptyText = "No games found.") {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (!games || games.length === 0) {
        target.innerHTML = `<div class="empty-state">${emptyText}</div>`;
        return;
    }

    target.innerHTML = games
        .map((game) => {
            const slug = game.slug || "";
            const gameName = game.name || slug;
            const coverUrl = normalizeCoverPath(game);
            const safeSlug = escapeHtml(slug);
            const safeGameName = escapeHtml(gameName);
            const safeCoverUrl = escapeHtml(coverUrl);
            const badges = getGameBadges(game)
                .map((badge) => `<span class="status-badge">${escapeHtml(badge)}</span>`)
                .join("");

            return `
                <a href="?game=${encodeURIComponent(slug)}" class="game-card js-play-game" data-slug="${safeSlug}" data-name="${safeGameName}">
                    <img class="game-thumb" src="${safeCoverUrl}" alt="${safeGameName} cover" loading="lazy" />
                    <div class="game-card-content">
                        <span class="game-title">${safeGameName}</span>
                        <div class="game-meta">${badges}</div>
                    </div>
                </a>
            `;
        })
        .join("");
}

function renderTagSuggestions(tags) {
    const target = document.getElementById("searchTags");
    if (!target) return;

    if (!tags.length) {
        target.innerHTML = "";
        return;
    }

    target.innerHTML = tags
        .map((tag) => {
            const term = tag.slug || tag.enSlug || "";
            const title = tag.title || tag.name || term;
            return `<button class="tag-chip" data-browse-term="${escapeHtml(term)}" type="button">${escapeHtml(title)}</button>`;
        })
        .join("");
}

function renderBrowsePills() {
    const target = document.getElementById("browsePills");
    if (!target) return;

    target.innerHTML = BROWSE_TERMS.map(
        (term) =>
            `<button type="button" class="pill-button" data-browse-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`
    ).join("");
}

function trackPlayedGame(slug, name) {
    if (!slug || typeof window === "undefined") return;

    try {
        const existing = JSON.parse(
            window.localStorage.getItem(PLAYED_GAMES_STORAGE_KEY) || "[]"
        );
        const sanitized = Array.isArray(existing) ? existing : [];
        const withoutCurrent = sanitized.filter((entry) => entry.slug !== slug);
        withoutCurrent.unshift({ slug, name: name || slug, ts: Date.now() });
        window.localStorage.setItem(
            PLAYED_GAMES_STORAGE_KEY,
            JSON.stringify(withoutCurrent.slice(0, 12))
        );
    } catch (error) {
        console.warn("SaneGames: Failed storing played game.", error);
    }
}

async function fetchSearchResults(query, limit = 24, includeTopGames = false) {
    const url = `${CRAZYGAMES_API_BASE}/search?q=${encodeURIComponent(
        query
    )}&limit=${limit}&device=desktop&includeTopGames=${String(includeTopGames)}`;
    const response = await fetchWithTimeout(url, 8000);
    if (!response.ok) {
        throw new Error(`Search request failed (${response.status})`);
    }
    return response.json();
}

async function refreshTopGames() {
    if (uiSettings.disableApiBrowsing || uiSettings.disableTopGames) {
        renderGameGrid("topGamesGrid", [], "Top picks are disabled in settings.");
        updateTopGamesMoreButton();
        return;
    }

    try {
        const response = await fetchSearchResults("", 24, true);
        cachedTopGames = filterGames(response.topGames || []);
        topGamesVisibleCount = TOP_GAMES_PAGE_SIZE;
        renderTopGamesSection();
    } catch (error) {
        console.error("SaneGames: failed to load top games", error);
        renderGameGrid(
            "topGamesGrid",
            [],
            "Could not load top games from the API right now."
        );
        updateTopGamesMoreButton();
    }
}

async function runGameSearch(rawQuery) {
    if (uiSettings.disableApiBrowsing) {
        setSearchSummary("API browsing is disabled. Enable it in settings.");
        renderGameGrid("searchResults", [], "Search is disabled in settings.");
        renderTagSuggestions([]);
        return;
    }

    const query = (rawQuery || "").trim();
    if (!query) {
        clearSearchResults();
        return;
    }

    setSearchBusy(true);
    setSearchSummary(`Searching for "${query}"...`);

    try {
        const response = await fetchSearchResults(query, 36, true);
        let games = filterGames(response.result);
        if (!games.length) {
            games = filterGames(response.topGames);
        }

        const tags = filterTags(response.result);
        renderTagSuggestions(tags);
        searchHasRun = true;
        updateSettingsUi();
        renderGameGrid(
            "searchResults",
            games,
            "No matching games found. Try another term."
        );
        setSearchSummary(`Found ${games.length} game${games.length === 1 ? "" : "s"} for "${query}".`);
    } catch (error) {
        console.error("SaneGames: search failed", error);
        setSearchSummary("Search failed. The CrazyGames API might be rate-limiting or unavailable.");
        renderGameGrid(
            "searchResults",
            [],
            "Search failed. Try again in a moment."
        );
    } finally {
        setSearchBusy(false);
    }
}

function openRandomTopGame() {
    if (uiSettings.disableApiBrowsing || uiSettings.disableTopGames || !cachedTopGames.length) return;
    const randomGame =
        cachedTopGames[Math.floor(Math.random() * cachedTopGames.length)];
    trackPlayedGame(randomGame.slug, randomGame.name);
    window.location.href = `?game=${encodeURIComponent(randomGame.slug)}`;
}

function initExplorerUi() {
    if (explorerInitialized || typeof document === "undefined") return;
    explorerInitialized = true;

    uiSettings = loadUiSettings();

    const searchInput = document.getElementById("gameSearchInput");
    const searchButton = document.getElementById("searchGamesButton");
    const surpriseButton = document.getElementById("surpriseButton");
    const playSlugButton = document.getElementById("playSlugButton");
    const openSettingsButton = document.getElementById("openSettingsButton");
    const closeSettingsButton = document.getElementById("closeSettingsButton");
    const settingsBackdrop = document.getElementById("settingsBackdrop");
    const disableApiToggle = document.getElementById("toggleDisableApi");
    const disableTopToggle = document.getElementById("toggleDisableTopGames");
    const disablePalmframeToggle = document.getElementById("toggleDisablePalmframe");

    renderBrowsePills();
    setSearchSummary("Try a query or tap a theme to explore.");
    applyUiSettings();

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", () => runGameSearch(searchInput.value));
    }

    if (surpriseButton) {
        surpriseButton.addEventListener("click", openRandomTopGame);
    }

    const loadMoreTopGamesButton = document.getElementById("loadMoreTopGamesButton");
    if (loadMoreTopGamesButton) {
        loadMoreTopGamesButton.addEventListener("click", () => {
            topGamesVisibleCount += TOP_GAMES_PAGE_SIZE;
            renderTopGamesSection();
        });
    }

    const clearResultsButton = document.getElementById("clearResultsButton");
    if (clearResultsButton) {
        clearResultsButton.addEventListener("click", clearSearchResults);
    }

    if (playSlugButton) {
        playSlugButton.addEventListener("click", loadGameFromInput);
    }

    if (openSettingsButton) {
        openSettingsButton.addEventListener("click", openSettingsModal);
    }

    if (closeSettingsButton) {
        closeSettingsButton.addEventListener("click", closeSettingsModal);
    }

    if (settingsBackdrop) {
        settingsBackdrop.addEventListener("click", closeSettingsModal);
    }

    if (disableApiToggle) {
        disableApiToggle.addEventListener("change", () => {
            uiSettings.disableApiBrowsing = disableApiToggle.checked;
            saveUiSettings();
            applyUiSettings();
        });
    }

    if (disableTopToggle) {
        disableTopToggle.addEventListener("change", () => {
            uiSettings.disableTopGames = disableTopToggle.checked;
            saveUiSettings();
            applyUiSettings();
        });
    }

    if (disablePalmframeToggle) {
        disablePalmframeToggle.addEventListener("change", () => {
            uiSettings.disablePalmframe = disablePalmframeToggle.checked;
            saveUiSettings();
            applyUiSettings();
        });
    }

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const browseButton = target.closest("[data-browse-term]");
        if (browseButton) {
            const browseTerm = browseButton.getAttribute("data-browse-term");
            if (searchInput && browseTerm) {
                searchInput.value = browseTerm;
                runGameSearch(browseTerm);
            }
            return;
        }

        const playCard = target.closest(".js-play-game");
        if (playCard) {
            trackPlayedGame(
                playCard.getAttribute("data-slug"),
                playCard.getAttribute("data-name")
            );
        }
    });

    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                runGameSearch(searchInput.value);
            }
        });
    }
}

async function fetchWithTimeout(url, timeout = 5000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeout)
        ),
    ]);
}

async function fetchGameConfig(gameSlug) {
    const urls = [
        `https://opencors.netlify.app/.netlify/functions/main?url=${encodeURIComponent(
            `https://games.crazygames.com/en_US/${gameSlug}/index.html`
        )}`,
        `https://corsproxy.io/?key=d6168cb0&url=${encodeURIComponent(
            `https://games.crazygames.com/en_US/${gameSlug}/index.html`
        )}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(
            `https://games.crazygames.com/en_US/${gameSlug}/index.html`
        )}`,
    ];

    for (let i = 0; i < urls.length; i++) {
        try {
            console.log(
                `SaneGames: Attempting to fetch config via proxy ${i + 1}: ${
                    urls[i].split("?")[0]
                }`
            );
            let response = await fetchWithTimeout(urls[i]);
            if (!response.ok) {
                throw new Error(
                    `Proxy ${i + 1} request failed with status ${
                        response.status
                    }`
                );
            }
            let text = await response.text();
            let match = text.match(/var options = (\{[\s\S]*?\});/);
            if (match && match[1]) {
                console.log(
                    `SaneGames: Successfully fetched config via proxy ${i + 1}`
                );
                return JSON.parse(match[1]);
            } else {
                console.warn(
                    `SaneGames: Proxy ${
                        i + 1
                    } returned content, but no options found.`
                );
            }
        } catch (error) {
            console.warn(
                `SaneGames: Fetching config with proxy ${i + 1} failed:`,
                error.message
            );
        }
    }
    console.error("SaneGames: All proxy attempts to fetch game config failed.");
    return null;
}

function setFeedbackWidgetVisibility(isVisible) {
    if (typeof document === "undefined") return;

    const feedbackWidget = document.querySelector("palmframe-widget");
    if (feedbackWidget) {
        feedbackWidget.hidden = uiSettings.disablePalmframe ? true : !isVisible;
    }
}

async function loadGame() {
    if (typeof window === "undefined" || typeof document === "undefined")
        return;

    enableDevAdTestingPatches();

    uiSettings = loadUiSettings();

    let params = new URLSearchParams(window.location.search);
    let gameSlug = params.get("game");
    let loader = document.getElementById("loader");
    let gameInput = document.getElementById("gameInput");

    if (!gameSlug) {
        setFeedbackWidgetVisibility(true);
        if (loader) loader.style.display = "none";
        if (gameInput) gameInput.classList.add("active");
        initExplorerUi();
        stopPollingForUiModifications(); // Stop polling if no game to load
        return;
    }

    if (loader) loader.style.display = "flex";
    if (gameInput) {
        gameInput.classList.remove("active");
        gameInput.style.display = "none";
    }

    let options = await fetchGameConfig(gameSlug);
    if (!options) {
        setFeedbackWidgetVisibility(true);
        if (loader) {
            loader.textContent =
                "Loading failed. Could not fetch game configuration. The game slug might be incorrect, the game might not exist, or all our proxy services are down. Please try again later or check the slug.";
            loader.style.display = "flex";
        }
        if (gameInput) {
            gameInput.classList.add("active");
            gameInput.style.display = "flex";
        }
        stopPollingForUiModifications(); // Stop polling if config fails
        return;
    }

    if (
        typeof posthog !== "undefined" &&
        typeof posthog.capture === "function"
    ) {
        posthog.capture("game selected", {
            gameslug: gameSlug,
            gamename: options.gameName,
        });
    } else {
        console.log("posthog failed");
    }

    document.title = (options.gameName || gameSlug) + " | SaneGames";

    let sdkScriptUrl = "https://builds.crazygames.com/gameframe/v1/bundle.js";
    let script = document.createElement("script");
    script.src = sdkScriptUrl;

    script.onerror = () => {
        console.error(
            "SaneGames: Crazygames SDK script failed to load from:",
            sdkScriptUrl
        );
        setFeedbackWidgetVisibility(true);
        if (loader) {
            loader.textContent =
                "Failed to load the CrazyGames SDK script. Please check your internet connection or an adblocker might be blocking the SDK URL. Try again later.";
            loader.style.display = "flex";
        }
        if (gameInput) {
            gameInput.classList.add("active");
            gameInput.style.display = "flex";
        }
        stopPollingForUiModifications(); // Stop polling if SDK script fails
    };

    script.onload = () => {
        if (window.Crazygames && typeof window.Crazygames.load === "function") {
            console.log(
                "SaneGames: CrazyGames SDK loaded. Attempting to load game:",
                options.gameName || gameSlug
            );
            Crazygames.load(options)
                .then(() => {
                    console.log(
                        "SaneGames: Game loaded successfully:",
                        options.gameName || gameSlug
                    );
                    trackPlayedGame(gameSlug, options.gameName || gameSlug);
                    setFeedbackWidgetVisibility(false);
                    if (loader) loader.remove();
                    if (gameInput) gameInput.remove();
                    startPollingForUiModifications(); // START POLLING AFTER GAME IS LOADED
                })
                .catch((error) => {
                    console.error(
                        "SaneGames: Crazygames.load() failed:",
                        error
                    );
                    let errorMessage = `Failed to load game "${
                        options.gameName || gameSlug
                    }". `;

                    if (error && error.message) {
                        errorMessage += `Error: ${error.message}. `;
                        if (
                            error.message
                                .toLowerCase()
                                .includes("x-frame-options") ||
                            error.message
                                .toLowerCase()
                                .includes("refused to display") ||
                            error.message
                                .toLowerCase()
                                .includes("sameorigin") ||
                            error.message
                                .toLowerCase()
                                .includes("frame-ancestors")
                        ) {
                            errorMessage +=
                                "This game's security settings (like X-Frame-Options or Content-Security-Policy) likely prevent it from being embedded here. Some games cannot be played on SaneGames due to these restrictions. ";
                        }
                    } else {
                        errorMessage +=
                            "An unknown error occurred with the CrazyGames SDK. ";
                    }
                    errorMessage +=
                        "Check the browser console (F12) for more specific details. You can try a different game.";

                    setFeedbackWidgetVisibility(true);
                    if (loader) {
                        loader.textContent = errorMessage;
                        loader.style.display = "flex";
                    }
                    if (gameInput) {
                        gameInput.classList.add("active");
                        gameInput.style.display = "flex";
                    }
                    stopPollingForUiModifications(); // Stop polling if game loading fails
                });
        } else {
            console.error(
                "SaneGames: Crazygames SDK loaded, but window.Crazygames.load is not available or SDK is malformed."
            );
            setFeedbackWidgetVisibility(true);
            if (loader) {
                loader.textContent =
                    "CrazyGames SDK loaded incorrectly. The SaneGames client might be outdated, or there's an issue with the SDK itself. Try refreshing.";
                loader.style.display = "flex";
            }
            if (gameInput) {
                gameInput.classList.add("active");
                gameInput.style.display = "flex";
            }
            stopPollingForUiModifications(); // Stop polling if SDK is malformed
        }
    };
    document.head.appendChild(script);
}

function loadGameFromInput() {
    if (typeof window === "undefined" || typeof document === "undefined")
        return;
    let gameSlugInput = document.getElementById("gameSlugInput");
    if (gameSlugInput) {
        let gameSlug = gameSlugInput.value.trim();
        if (gameSlug) {
            trackPlayedGame(gameSlug, gameSlug);
            let currentUrl = new URL(window.location.href);
            currentUrl.search = `?game=${encodeURIComponent(gameSlug)}`;
            window.location.href = currentUrl.toString();
        } else {
            alert("Please enter a game slug.");
        }
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", stopPollingForUiModifications);

    // Keyboard shortcuts
    document.addEventListener("keydown", function(e) {
        if (typeof document === "undefined") return;

        if (e.key === "Escape") {
            closeSettingsModal();
        }
        
        // Forward slash to focus search
        if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
            e.preventDefault();
            const searchInput = document.getElementById("gameSearchInput");
            if (searchInput && !uiSettings.disableApiBrowsing) {
                searchInput.focus();
            }
        }
        
        // Enter to load game when focused on input
        if (e.key === "Enter" && document.activeElement.id === "gameSlugInput") {
            e.preventDefault();
            loadGameFromInput();
        }

        // Question mark for help/shortcuts (could expand later)
        if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            console.log("SaneGames Keyboard Shortcuts:\n/ - Focus API search\nEnter - Search from search box or launch from slug box\n? - Show help");
        }
    });
}

loadGame();
