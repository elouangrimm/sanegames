const form = document.getElementById("debugForm");
const slugInput = document.getElementById("gameSlugInput");
const loadButton = document.getElementById("loadButton");
const statusMessage = document.getElementById("statusMessage");
const jsonOutput = document.getElementById("jsonOutput");

function setStatus(message) {
    statusMessage.textContent = message;
}

function setOutput(value) {
    jsonOutput.textContent = value;
}

function setLoadingState(isLoading) {
    loadButton.disabled = isLoading;
    loadButton.textContent = isLoading ? "Fetching..." : "Fetch Options";
}

function getGameHtmlUrl(gameSlug) {
    return `https://games.crazygames.com/en_US/${gameSlug}/index.html`;
}

async function fetchWithTimeout(url, timeout = 5000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), timeout);
        }),
    ]);
}

async function fetchGameConfig(gameSlug) {
    const gameUrl = getGameHtmlUrl(gameSlug);
    const urls = [
        `https://opencors.netlify.app/.netlify/functions/main?url=${encodeURIComponent(gameUrl)}`,
        `https://corsproxy.io/?key=d6168cb0&url=${encodeURIComponent(gameUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(gameUrl)}`,
    ];

    for (let index = 0; index < urls.length; index += 1) {
        try {
            console.log(
                `SaneGames debug: Attempting proxy ${index + 1}: ${urls[index].split("?")[0]}`
            );

            const response = await fetchWithTimeout(urls[index]);
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const text = await response.text();
            const match = text.match(/var options = (\{[\s\S]*?\});/);
            if (!match || !match[1]) {
                throw new Error("Response did not include a parsable options object");
            }

            const options = JSON.parse(match[1]);
            console.log(`SaneGames debug: Parsed options for \"${gameSlug}\"`, options);
            return options;
        } catch (error) {
            console.warn(
                `SaneGames debug: Proxy ${index + 1} failed for \"${gameSlug}\"`,
                error
            );
        }
    }

    throw new Error("All proxy attempts failed.");
}

async function handleSubmit(event) {
    event.preventDefault();

    const gameSlug = slugInput.value.trim();
    if (!gameSlug) {
        setStatus("Enter a CrazyGames slug first.");
        setOutput("Waiting for input...");
        slugInput.focus();
        return;
    }

    setLoadingState(true);
    setStatus(`Fetching options for \"${gameSlug}\"...`);
    setOutput("Loading...");

    try {
        const options = await fetchGameConfig(gameSlug);
        const formattedJson = JSON.stringify(options, null, 2);
        setStatus(`Fetched options for \"${gameSlug}\". Check the console for the logged object.`);
        setOutput(formattedJson);
    } catch (error) {
        console.error(`SaneGames debug: Failed to fetch options for \"${gameSlug}\"`, error);
        setStatus(`Failed to fetch options for \"${gameSlug}\".`);
        setOutput(error.message);
    } finally {
        setLoadingState(false);
    }
}

function hydrateFromQueryString() {
    const params = new URLSearchParams(window.location.search);
    const gameSlug = params.get("game")?.trim();

    if (!gameSlug) {
        return;
    }

    slugInput.value = gameSlug;
    form.requestSubmit();
}

form.addEventListener("submit", handleSubmit);
hydrateFromQueryString();