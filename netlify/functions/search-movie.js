const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

function normalize(text = "") {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

async function tmdbFetch(path, token, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json"
    }
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}) for ${path}.`);
  }

  return res.json();
}

function scoreCandidate(query, item) {
  const q = normalize(query);
  const title = normalize(item.title || item.name || "");
  const original = normalize(item.original_title || item.original_name || "");
  const exact = q === title || q === original;
  const starts = title.startsWith(q) || original.startsWith(q);

  return {
    exact,
    starts,
    sort: [
      exact ? 1 : 0,
      starts ? 1 : 0,
      Number(item.vote_count || 0),
      Number(item.popularity || 0)
    ]
  };
}

async function buildDetail(query, token, item, mediaType, rankIndex) {
  const detail = await tmdbFetch(
    `/${mediaType}/${item.id}`,
    token,
    { append_to_response: "credits,external_ids", language: "en-US" }
  );

  const title = mediaType === "tv" ? detail.name : detail.title;
  const originalTitle = mediaType === "tv" ? detail.original_name : detail.original_title;
  const year = mediaType === "tv"
    ? (detail.first_air_date ? detail.first_air_date.slice(0, 4) : "")
    : (detail.release_date ? detail.release_date.slice(0, 4) : "");

  const director = mediaType === "movie"
    ? (detail.credits?.crew?.find((person) => person.job === "Director")?.name || "")
    : (detail.created_by?.[0]?.name || detail.credits?.crew?.find((person) => person.job === "Director")?.name || "");

  const roleLabel = mediaType === "movie" ? "Director" : "Creator";
  const runtime = mediaType === "movie"
    ? (detail.runtime || null)
    : (detail.episode_run_time?.[0] || null);

  const { exact } = scoreCandidate(query, item);

  return {
    id: detail.id,
    mediaType,
    title,
    originalTitle,
    year,
    director,
    roleLabel,
    overview: detail.overview || "",
    runtime,
    genres: (detail.genres || []).map((g) => g.name),
    rating: typeof detail.vote_average === "number" ? detail.vote_average : null,
    voteCount: detail.vote_count || 0,
    posterUrl: detail.poster_path ? `${IMAGE_BASE}${detail.poster_path}` : "",
    imdbId: detail.external_ids?.imdb_id || "",
    confidence: exact && rankIndex === 0 ? "high" : "normal"
  };
}

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const token = process.env.TMDB_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "TMDB_TOKEN is not configured on Netlify." })
    };
  }

  const query = (event.queryStringParameters?.q || "").trim();
  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing title." })
    };
  }

  try {
    const commonParams = { query, include_adult: "false", language: "en-US" };

    const [movieSearch, tvSearch] = await Promise.all([
      tmdbFetch("/search/movie", token, commonParams),
      tmdbFetch("/search/tv", token, commonParams)
    ]);

    const merged = [
      ...(movieSearch.results || []).slice(0, 5).map((item) => ({ ...item, mediaType: "movie" })),
      ...(tvSearch.results || []).slice(0, 5).map((item) => ({ ...item, mediaType: "tv" }))
    ];

    const ranked = merged
      .map((item) => ({ item, scoring: scoreCandidate(query, item) }))
      .sort((a, b) => {
        const sa = a.scoring.sort;
        const sb = b.scoring.sort;
        for (let i = 0; i < sa.length; i++) {
          if (sb[i] !== sa[i]) return sb[i] - sa[i];
        }
        return 0;
      })
      .slice(0, 6);

    const details = await Promise.all(
      ranked.map(async ({ item }, index) => {
        try {
          return await buildDetail(query, token, item, item.mediaType, index);
        } catch {
          return null;
        }
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ query, results: details.filter(Boolean) })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Unexpected server error." })
    };
  }
};
