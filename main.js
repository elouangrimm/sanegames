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

(function blockAds() {
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
    const observer = new MutationObserver((mutations) => {
        applyUiModifications();
    });

    const startObserver = () => {
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
        feedbackWidget.hidden = !isVisible;
    }
}

async function loadGame() {
    if (typeof window === "undefined" || typeof document === "undefined")
        return;

    let params = new URLSearchParams(window.location.search);
    let gameSlug = params.get("game");
    let loader = document.getElementById("loader");
    let gameInput = document.getElementById("gameInput");

    if (!gameSlug) {
        setFeedbackWidgetVisibility(true);
        if (loader) loader.style.display = "none";
        if (gameInput) gameInput.classList.add("active");
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
            let currentUrl = new URL(window.location.href);
            currentUrl.search = `?game=${encodeURIComponent(gameSlug)}`;
            window.location.href = currentUrl.toString();
        } else {
            alert("Please enter a game slug.");
        }
    }
}

function recommendations() {
    if (typeof document === "undefined") return;
    const popup = document.getElementById("recommendationsPopup");
    if (popup) popup.classList.add("active");
}

function closeRecommendations() {
    if (typeof document === "undefined") return;
    const popup = document.getElementById("recommendationsPopup");
    if (popup) popup.classList.remove("active");
}

if (typeof window !== "undefined") {
    window.onclick = function (event) {
        if (typeof document === "undefined") return;
        const popup = document.getElementById("recommendationsPopup");
        if (
            popup &&
            event.target == popup &&
            popup.classList.contains("active")
        ) {
            closeRecommendations();
        }
    };
    window.addEventListener("beforeunload", stopPollingForUiModifications);

    // Keyboard shortcuts
    document.addEventListener("keydown", function(e) {
        if (typeof document === "undefined") return;
        
        // Forward slash to focus search
        if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
            e.preventDefault();
            const gameInput = document.getElementById("gameSlugInput");
            if (gameInput) {
                gameInput.focus();
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
            console.log("SaneGames Keyboard Shortcuts:\n/ - Focus game search\nEnter - Load game (when in search)\n? - Show help");
        }
    });
}

loadGame();
