
(() => {
  const DEFAULTS = {
    preferredPlatform: "letterboxd",
    apiBaseUrl: "https://filmfootnote.netlify.app"
  };

  const PLATFORMS = {
    tmdb: {
      label: "TMDB",
      mark: "T",
      url: (movie) => movie.id
        ? `https://www.themoviedb.org/movie/${movie.id}`
        : `https://www.themoviedb.org/search/movie?query=${encodeURIComponent(movie.title || movie.query)}`
    },
    letterboxd: {
      label: "Letterboxd",
      mark: "L",
      url: (movie) => `https://letterboxd.com/search/films/${encodeURIComponent(movie.title || movie.query)}/`
    },
    douban: {
      label: "豆瓣",
      mark: "豆",
      url: (movie) => `https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(movie.title || movie.query)}`
    },
    imdb: {
      label: "IMDb",
      mark: "I",
      url: (movie) => movie.imdbId
        ? `https://www.imdb.com/title/${movie.imdbId}/`
        : `https://www.imdb.com/find/?q=${encodeURIComponent(movie.title || movie.query)}&s=tt`
    },
    rottentomatoes: {
      label: "Rotten Tomatoes",
      mark: "RT",
      url: (movie) => `https://www.rottentomatoes.com/search?search=${encodeURIComponent(movie.title || movie.query)}`
    }
  };

  let trigger = null;
  let card = null;

  function removeUI() {
    trigger?.remove();
    card?.remove();
    trigger = null;
    card = null;
  }

  function isOurUI(target) {
    return target?.closest?.(".ff-root");
  }

  function getSelectionRect() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    return selection.getRangeAt(0).getBoundingClientRect();
  }

  async function getSettings() {
    try {
      return await chrome.storage.sync.get(DEFAULTS);
    } catch {
      return DEFAULTS;
    }
  }

  function positionElement(el, rect, offsetY = 8) {
    const width = el.offsetWidth || 380;
    const left = Math.min(
      window.scrollX + rect.left,
      window.scrollX + window.innerWidth - width - 12
    );
    el.style.left = `${Math.max(window.scrollX + 12, left)}px`;
    el.style.top = `${window.scrollY + rect.bottom + offsetY}px`;
  }

  function makeTrigger(rect, title) {
    removeUI();
    trigger = document.createElement("button");
    trigger.className = "ff-root ff-trigger";
    trigger.type = "button";
    trigger.textContent = "¹";
    trigger.setAttribute("aria-label", `Identify ${title} with FilmFootnote`);
    document.documentElement.appendChild(trigger);
    positionElement(trigger, rect);

    trigger.addEventListener("mousedown", (e) => e.preventDefault());
    trigger.addEventListener("click", async (e) => {
      e.stopPropagation();
      await showLoadingCard(rect, title);
    });
  }

  function createShell(title) {
    card?.remove();
    card = document.createElement("section");
    card.className = "ff-root ff-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "FilmFootnote");

    const header = document.createElement("div");
    header.className = "ff-header";

    const brandWrap = document.createElement("div");
    const brand = document.createElement("div");
    brand.className = "ff-brand";
    brand.textContent = "FilmFootnote¹";
    const selected = document.createElement("div");
    selected.className = "ff-selected";
    selected.textContent = title;
    brandWrap.append(brand, selected);

    const close = document.createElement("button");
    close.className = "ff-close";
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", removeUI);

    header.append(brandWrap, close);
    card.appendChild(header);
    document.documentElement.appendChild(card);
    return card;
  }

  async function showLoadingCard(rect, query) {
    trigger?.remove();
    trigger = null;
    createShell(query);

    const loading = document.createElement("div");
    loading.className = "ff-loading";
    loading.innerHTML = `<span class="ff-spinner"></span><span>Identifying film…</span>`;
    card.appendChild(loading);
    positionElement(card, rect, 10);

    const settings = await getSettings();
    try {
      const base = settings.apiBaseUrl.replace(/\/$/, "");
      const url = `${base}/.netlify/functions/search-movie?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Movie lookup failed.");
      }

      if (!payload.results?.length) {
        renderNoResults(rect, query);
      } else if (payload.results.length === 1 || payload.results[0].confidence === "high") {
        renderMovie(rect, payload.results[0], query, settings.preferredPlatform);
      } else {
        renderCandidates(rect, payload.results, query, settings.preferredPlatform);
      }
    } catch (error) {
      renderError(rect, error.message);
    }
  }

  function renderSetupRequired(rect) {
    card.querySelector(".ff-loading")?.remove();
    const box = document.createElement("div");
    box.className = "ff-message";
    box.innerHTML = `
      <strong>Connect the FilmFootnote backend</strong>
      <span>Click the extension icon and paste your Netlify site URL.</span>
    `;
    card.appendChild(box);
    positionElement(card, rect, 10);
  }

  function renderNoResults(rect, query) {
    card.querySelector(".ff-loading")?.remove();
    const box = document.createElement("div");
    box.className = "ff-message";
    const strong = document.createElement("strong");
    strong.textContent = "No movie found";
    const span = document.createElement("span");
    span.textContent = `Try selecting a more complete title than “${query}”.`;
    box.append(strong, span);
    card.appendChild(box);
    positionElement(card, rect, 10);
  }

  function renderError(rect, message) {
    card.querySelector(".ff-loading")?.remove();
    const box = document.createElement("div");
    box.className = "ff-message ff-error";
    const strong = document.createElement("strong");
    strong.textContent = "Could not identify this film";
    const span = document.createElement("span");
    span.textContent = message;
    box.append(strong, span);
    card.appendChild(box);
    positionElement(card, rect, 10);
  }

  function renderCandidates(rect, movies, query, preferredPlatform) {
    card.querySelector(".ff-loading")?.remove();

    const label = document.createElement("div");
    label.className = "ff-candidate-label";
    label.textContent = "Which film did you mean?";
    card.appendChild(label);

    const list = document.createElement("div");
    list.className = "ff-candidates";

    movies.slice(0, 5).forEach((movie) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ff-candidate";

      if (movie.posterUrl) {
        const img = document.createElement("img");
        img.src = movie.posterUrl;
        img.alt = "";
        button.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "ff-poster-placeholder small";
        placeholder.textContent = "No poster";
        button.appendChild(placeholder);
      }

      const meta = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = movie.title;
      const sub = document.createElement("span");
      sub.textContent = [movie.year, movie.director].filter(Boolean).join(" · ");
      meta.append(title, sub);

      const arrow = document.createElement("span");
      arrow.className = "ff-candidate-arrow";
      arrow.textContent = "›";

      button.append(meta, arrow);
      button.addEventListener("click", () => renderMovie(rect, movie, query, preferredPlatform));
      list.appendChild(button);
    });

    card.appendChild(list);
    positionElement(card, rect, 10);
  }

  function renderMovie(rect, movie, query, preferredPlatform) {
    createShell(movie.title || query);

    const hero = document.createElement("div");
    hero.className = "ff-hero";

    if (movie.posterUrl) {
      const poster = document.createElement("img");
      poster.className = "ff-poster";
      poster.src = movie.posterUrl;
      poster.alt = `${movie.title} poster`;
      hero.appendChild(poster);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "ff-poster-placeholder";
      placeholder.textContent = "No poster";
      hero.appendChild(placeholder);
    }

    const details = document.createElement("div");
    details.className = "ff-details";

    const title = document.createElement("h2");
    title.textContent = movie.title;

    const meta = document.createElement("div");
    meta.className = "ff-meta";
    meta.textContent = [movie.year, movie.director].filter(Boolean).join(" · ");

    const chips = document.createElement("div");
    chips.className = "ff-chips";
    if (movie.runtime) chips.appendChild(makeChip(`${movie.runtime} min`));
    if (movie.genres?.[0]) chips.appendChild(makeChip(movie.genres[0]));
    if (typeof movie.rating === "number") chips.appendChild(makeChip(`TMDB ${movie.rating.toFixed(1)}`));

    details.append(title, meta, chips);
    hero.appendChild(details);
    card.appendChild(hero);

    if (movie.overview) {
      const overview = document.createElement("p");
      overview.className = "ff-overview";
      overview.textContent = movie.overview;
      card.appendChild(overview);
    }

    const platforms = document.createElement("div");
    platforms.className = "ff-platforms";
    const order = [
      preferredPlatform,
      ...Object.keys(PLATFORMS).filter((id) => id !== preferredPlatform)
    ].filter((id) => PLATFORMS[id]);

    order.forEach((id, index) => {
      const p = PLATFORMS[id];
      const button = document.createElement("button");
      button.className = `ff-platform ${index === 0 ? "is-primary" : ""}`;
      button.type = "button";

      const mark = document.createElement("span");
      mark.className = "ff-mark";
      mark.textContent = p.mark;

      const label = document.createElement("span");
      label.textContent = p.label;

      const action = document.createElement("span");
      action.className = "ff-action";
      const hasExactLink =
        (id === "imdb" && movie.imdbId) ||
        (id === "tmdb" && movie.id);
      action.textContent = hasExactLink ? "View ↗" : "Search ↗";

      button.append(mark, label, action);
      button.addEventListener("click", () => {
        window.open(p.url({...movie, query}), "_blank", "noopener,noreferrer");
      });
      platforms.appendChild(button);
    });

    card.appendChild(platforms);

    const footer = document.createElement("div");
    footer.className = "ff-footer";
    footer.textContent = "Movie metadata and rating provided by TMDB. FilmFootnote is not endorsed or certified by TMDB.";
    card.appendChild(footer);

    positionElement(card, rect, 10);
  }

  function makeChip(text) {
    const span = document.createElement("span");
    span.className = "ff-chip";
    span.textContent = text;
    return span;
  }

  document.addEventListener("mouseup", (event) => {
    if (isOurUI(event.target)) return;
    setTimeout(() => {
      const text = window.getSelection()?.toString().replace(/\s+/g, " ").trim() || "";
      const rect = getSelectionRect();
      if (!text || text.length > 120 || !rect || (rect.width === 0 && rect.height === 0)) {
        removeUI();
        return;
      }
      makeTrigger(rect, text);
    }, 0);
  });

  document.addEventListener("mousedown", (event) => {
    if (!isOurUI(event.target)) removeUI();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") removeUI();
  });
  window.addEventListener("scroll", removeUI, { passive: true });
  window.addEventListener("resize", removeUI);
})();
