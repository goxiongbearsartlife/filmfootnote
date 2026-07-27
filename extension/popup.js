
const DEFAULTS = {
  preferredPlatform: "letterboxd",
  apiBaseUrl: "https://filmfootnote.netlify.app"
};

const platforms = [
  { id: "tmdb", label: "TMDB", mark: "T" },
  { id: "letterboxd", label: "Letterboxd", mark: "L" },
  { id: "douban", label: "Douban / 豆瓣", mark: "豆" },
  { id: "imdb", label: "IMDb", mark: "I" },
  { id: "rottentomatoes", label: "Rotten Tomatoes", mark: "RT" }
];

const list = document.querySelector("#platforms");
const status = document.querySelector("#status");

async function render() {
  const settings = await chrome.storage.sync.get(DEFAULTS);
  // Ensure users upgrading from older versions receive the production backend.
  if (!settings.apiBaseUrl) {
    await chrome.storage.sync.set({ apiBaseUrl: DEFAULTS.apiBaseUrl });
  }

  list.textContent = "";
  platforms.forEach((platform) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      `platform ${settings.preferredPlatform === platform.id ? "is-selected" : ""}`;

    const mark = document.createElement("span");
    mark.className = "mark";
    mark.textContent = platform.mark;

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = platform.label;

    const check = document.createElement("span");
    check.textContent = settings.preferredPlatform === platform.id ? "✓" : "";

    button.append(mark, name, check);
    button.addEventListener("click", async () => {
      await chrome.storage.sync.set({ preferredPlatform: platform.id });
      status.textContent = `${platform.label} saved as preferred.`;
      await render();
    });

    list.appendChild(button);
  });
}

render().catch((error) => {
  status.textContent = `Could not load settings: ${error.message}`;
});
