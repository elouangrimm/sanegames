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

const SUPPORTED_UNITY_LOADERS = new Set([
    "unity2020",
    "unity2021",
    "unity2022",
    "unity2023",
]);

const GAME_CONFIG_URL_TEMPLATE = "https://games.crazygames.com/en_US/{slug}/index.html";

const proxyUrls = [
    (url) => `https://opencors.netlify.app/.netlify/functions/main?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?key=d6168cb0&url=${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const runtimeState = {
    activeUnityInstance: null,
    activeLoaderScript: null,
    currentOptions: null,
    currentSlug: null,
};

(function blockAds() {
    if (typeof window === "undefined") {
        return;
    }

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const requestTarget = typeof args[0] === "string" ? args[0] : args[0]?.url;

        if (
            requestTarget &&
            adBlockList.some((domain) => requestTarget.includes(domain))
        ) {
            return new Response("{}", {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (
            typeof url === "string" &&
            adBlockList.some((domain) => url.includes(domain))
        ) {
            this.send = () => undefined;
            Object.defineProperty(this, "readyState", { value: 4, writable: false });
            Object.defineProperty(this, "status", { value: 200, writable: false });
            Object.defineProperty(this, "responseText", { value: "{}", writable: false });
            Object.defineProperty(this, "response", { value: {}, writable: false });
            return undefined;
        }

        return originalOpen.apply(this, arguments);
    };
})();

function getElement(id) {
    return document.getElementById(id);
}

function setFeedbackWidgetVisibility(isVisible) {
    const feedbackWidget = document.querySelector("palmframe-widget");
    if (feedbackWidget) {
        feedbackWidget.hidden = !isVisible;
    }
}

function setStatus(message, type = "info") {
    const statusText = getElement("statusText");
    if (statusText) {
        statusText.textContent = message;
        statusText.dataset.type = type;
    }
}

function setProgress(value) {
    const progressTrack = getElement("progressTrack");
    const progressBar = getElement("progressBar");

    if (!progressTrack || !progressBar) {
        return;
    }

    if (typeof value !== "number" || Number.isNaN(value)) {
        progressTrack.hidden = true;
        progressBar.style.width = "0%";
        return;
    }

    progressTrack.hidden = false;
    progressBar.style.width = `${Math.max(0, Math.min(100, value * 100))}%`;
}

function clearWarnings() {
    const warningList = getElement("warningList");
    if (warningList) {
        warningList.innerHTML = "";
    }
}

function addWarning(message, level = "warning") {
    const warningList = getElement("warningList");
    if (!warningList) {
        return;
    }

    const item = document.createElement("div");
    item.className = `warning-item ${level}`;
    item.textContent = message;
    warningList.appendChild(item);
}

function setStageMetadata(options) {
    const gameMeta = getElement("gameMeta");
    if (!gameMeta || !options) {
        return;
    }

    const entries = [
        ["Loader", options.loader || "unknown"],
        ["Category", options.category || options.categoryEnSlug || "unknown"],
        ["Orientation", options.orientation || "unknown"],
        ["Fullscreen", options.fullscreen || "unknown"],
    ];

    gameMeta.innerHTML = entries
        .map(
            ([label, value]) => `
                <article class="meta-card">
                    <strong>${escapeHtml(label)}</strong>
                    <span>${escapeHtml(String(value))}</span>
                </article>
            `
        )
        .join("");
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function showLanding() {
    const loader = getElement("loader");
    const gameInput = getElement("gameInput");
    const gameStage = getElement("gameStage");

    document.body.classList.remove("beta-playing");
    setFeedbackWidgetVisibility(true);

    if (loader) {
        loader.style.display = "none";
    }

    if (gameInput) {
        gameInput.classList.add("active");
        gameInput.style.display = "flex";
    }

    if (gameStage) {
        gameStage.hidden = true;
        gameStage.classList.remove("active");
    }
}

function showStage(title) {
    const loader = getElement("loader");
    const gameInput = getElement("gameInput");
    const gameStage = getElement("gameStage");
    const stageTitle = getElement("stageTitle");

    document.body.classList.add("beta-playing");
    setFeedbackWidgetVisibility(false);

    if (loader) {
        loader.style.display = "none";
    }

    if (gameInput) {
        gameInput.classList.remove("active");
        gameInput.style.display = "none";
    }

    if (stageTitle) {
        stageTitle.textContent = title;
    }

    if (gameStage) {
        gameStage.hidden = false;
        gameStage.classList.add("active");
    }
}

async function disposeActiveRuntime() {
    if (runtimeState.activeUnityInstance?.Quit) {
        try {
            await runtimeState.activeUnityInstance.Quit();
        } catch (error) {
            console.warn("SaneGames Beta: Unity quit failed", error);
        }
    }

    runtimeState.activeUnityInstance = null;

    if (runtimeState.activeLoaderScript?.parentNode) {
        runtimeState.activeLoaderScript.parentNode.removeChild(runtimeState.activeLoaderScript);
    }

    runtimeState.activeLoaderScript = null;

    const gameViewport = getElement("gameViewport");
    if (gameViewport) {
        gameViewport.innerHTML = "";
    }

    clearWarnings();
    setProgress(undefined);
}

async function fetchWithTimeout(url, timeout = 7000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), timeout);
        }),
    ]);
}

async function fetchGameConfig(gameSlug) {
    const targetUrl = GAME_CONFIG_URL_TEMPLATE.replace("{slug}", encodeURIComponent(gameSlug));

    for (let index = 0; index < proxyUrls.length; index += 1) {
        const proxiedUrl = proxyUrls[index](targetUrl);

        try {
            const response = await fetchWithTimeout(proxiedUrl);
            if (!response.ok) {
                throw new Error(`Proxy ${index + 1} failed with ${response.status}`);
            }

            const html = await response.text();
            const match = html.match(/var options = (\{[\s\S]*?\});/);

            if (match?.[1]) {
                return JSON.parse(match[1]);
            }
        } catch (error) {
            console.warn(`SaneGames Beta: Proxy ${index + 1} failed`, error);
        }
    }

    return null;
}

function loadRemoteScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.crossOrigin = "anonymous";

        script.onload = () => {
            runtimeState.activeLoaderScript = script;
            resolve(script);
        };

        script.onerror = () => {
            reject(new Error(`Failed to load script ${url}`));
        };

        document.head.appendChild(script);
    });
}

function buildUnityConfig(options) {
    const unityConfigOptions = options.loaderOptions?.unityConfigOptions || {};

    return {
        ...unityConfigOptions,
        companyName: unityConfigOptions.companyName || "SaneGames",
        productName: unityConfigOptions.productName || options.gameName || options.gameSlug || "Unity Game",
        productVersion: unityConfigOptions.productVersion || options.buildId || "1.0",
        devicePixelRatio: 1,
        keyboardListeningElement: unityConfigOptions.keyboardListeningElement || document,
        showBanner(message, level) {
            addWarning(message, level === "error" ? "error" : "warning");
        },
    };
}

async function launchUnityGame(options) {
    const unityLoaderUrl = options.loaderOptions?.unityLoaderUrl;
    if (!unityLoaderUrl) {
        throw new Error("Unity loader URL is missing from the game config.");
    }

    setStatus("Loading Unity bootstrap script…");
    await loadRemoteScript(unityLoaderUrl);

    const createUnityInstanceFn = window.createUnityInstance;
    if (typeof createUnityInstanceFn !== "function") {
        throw new Error("The Unity loader script loaded, but createUnityInstance was not exposed.");
    }

    const gameViewport = getElement("gameViewport");
    const canvas = document.createElement("canvas");
    canvas.id = `unity-canvas-${options.gameSlug || "player"}`;
    canvas.className = "unity-canvas";
    canvas.setAttribute("tabindex", "0");
    canvas.setAttribute("aria-label", `${options.gameName || options.gameSlug || "Unity game"} canvas`);

    gameViewport.appendChild(canvas);

    const unityConfig = buildUnityConfig(options);

    if (!unityConfig.codeUrl || !unityConfig.dataUrl || !unityConfig.frameworkUrl) {
        throw new Error("The Unity config is incomplete. Expected codeUrl, dataUrl, and frameworkUrl.");
    }

    if (options.loaderOptions?.moduleJsonUrl) {
        addWarning("moduleJsonUrl is present in this config but is not used by the beta launcher yet.", "warning");
    }

    setStatus("Downloading Unity build files…");

    runtimeState.activeUnityInstance = await createUnityInstanceFn(
        canvas,
        unityConfig,
        (progress) => {
            setProgress(progress);
            setStatus(`Downloading Unity build files… ${Math.round(progress * 100)}%`);
        }
    );

    setProgress(1);
    setStatus("Unity game loaded.");
    canvas.focus();
}

function launchIframeGame(options) {
    const iframeUrl = options.loaderOptions?.url;
    if (!iframeUrl) {
        throw new Error("Iframe URL is missing from the game config.");
    }

    const gameViewport = getElement("gameViewport");
    const iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.allow = "autoplay; fullscreen; gamepad; clipboard-read; clipboard-write";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.loading = "eager";

    gameViewport.appendChild(iframe);

    setProgress(undefined);
    setStatus("Loaded the raw iframe target directly. Ad blocking inside that remote origin is still limited.");
}

function launchUnsupportedGame(options) {
    const gameViewport = getElement("gameViewport");

    gameViewport.innerHTML = `
        <div class="status-panel" style="margin: 24px; align-self: center; max-width: 720px;">
            <p>This beta page does not support the <strong>${escapeHtml(options.loader || "unknown")}</strong> loader yet.</p>
            <p>Open the browser console and inspect the fetched config if you want to add a new direct runtime strategy.</p>
        </div>
    `;

    setProgress(undefined);
    setStatus("Unsupported loader.", "error");
}

async function launchGame(options, gameSlug) {
    runtimeState.currentOptions = options;
    runtimeState.currentSlug = gameSlug;

    showStage(options.gameName || gameSlug);
    setStageMetadata(options);
    await disposeActiveRuntime();

    const stageTitle = getElement("stageTitle");
    if (stageTitle) {
        stageTitle.textContent = options.gameName || gameSlug;
    }

    if (SUPPORTED_UNITY_LOADERS.has(options.loader)) {
        await launchUnityGame(options);
        return;
    }

    if (options.loader === "iframe") {
        launchIframeGame(options);
        return;
    }

    launchUnsupportedGame(options);
}

async function loadGame() {
    const params = new URLSearchParams(window.location.search);
    const gameSlug = params.get("game")?.trim();

    if (!gameSlug) {
        await disposeActiveRuntime();
        showLanding();
        return;
    }

    const loader = getElement("loader");
    if (loader) {
        loader.style.display = "flex";
        loader.textContent = `Fetching config for ${gameSlug}…`;
    }

    const options = await fetchGameConfig(gameSlug);

    if (!options) {
        showLanding();
        const loaderText = getElement("loader");
        if (loaderText) {
            loaderText.style.display = "flex";
            loaderText.textContent = "Loading failed. Could not fetch the CrazyGames configuration for that slug.";
        }
        return;
    }

    document.title = `${options.gameName || gameSlug} | SaneGames Beta`;

    try {
        await launchGame(options, gameSlug);
    } catch (error) {
        console.error("SaneGames Beta: Game launch failed", error);
        showStage(options.gameName || gameSlug);
        setStageMetadata(options);
        setProgress(undefined);
        setStatus(error.message || "The game failed to boot.", "error");
        addWarning(error.message || "The game failed to boot.", "error");
    }
}

function loadGameFromInput() {
    const gameSlugInput = getElement("gameSlugInput");
    const gameSlug = gameSlugInput?.value.trim();

    if (!gameSlug) {
        alert("Please enter a game slug.");
        return;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.search = `?game=${encodeURIComponent(gameSlug)}`;
    window.location.href = currentUrl.toString();
}

function resetToLanding() {
    const currentUrl = new URL(window.location.href);
    currentUrl.search = "";
    window.location.href = currentUrl.toString();
}

function reloadCurrentGame() {
    if (!runtimeState.currentSlug) {
        return;
    }

    loadGame().catch((error) => {
        console.error("SaneGames Beta: Reload failed", error);
        setStatus(error.message || "Reload failed.", "error");
        addWarning(error.message || "Reload failed.", "error");
    });
}

window.addEventListener("beforeunload", () => {
    disposeActiveRuntime();
});

window.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        getElement("gameSlugInput")?.focus();
    }

    if (event.key === "Enter" && document.activeElement?.id === "gameSlugInput") {
        event.preventDefault();
        loadGameFromInput();
    }
});

getElement("backButton")?.addEventListener("click", resetToLanding);
getElement("reloadButton")?.addEventListener("click", reloadCurrentGame);

window.loadGameFromInput = loadGameFromInput;

loadGame().catch((error) => {
    console.error("SaneGames Beta: Fatal launch error", error);
    showLanding();
    const loader = getElement("loader");
    if (loader) {
        loader.style.display = "flex";
        loader.textContent = error.message || "An unexpected error occurred while loading the beta launcher.";
    }
});