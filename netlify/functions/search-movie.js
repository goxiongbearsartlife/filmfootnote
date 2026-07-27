
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

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
      body: JSON.stringify({ error: "Missing movie title." })
    };
  }

  try {
    const searchUrl = new URL(`${TMDB_BASE}/search/movie`);
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("include_adult", "false");
    searchUrl.searchParams.set("language", "en-US");

    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json"
      }
    });

    if (!searchRes.ok) {
      throw new Error(`TMDB search failed (${searchRes.status}).`);
    }

    const searchData = await searchRes.json();
    const baseResults = (searchData.results || []).slice(0, 5);

    const details = await Promise.all(
      baseResults.map(async (movie, index) => {
        const detailUrl = `${TMDB_BASE}/movie/${movie.id}?append_to_response=credits,external_ids&language=en-US`;
        const detailRes = await fetch(detailUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json"
          }
        });

        if (!detailRes.ok) return null;
        const d = await detailRes.json();
        const director = d.credits?.crew?.find((person) => person.job === "Director")?.name || "";
        const year = d.release_date ? d.release_date.slice(0, 4) : "";
        const normalizedQuery = query.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
        const normalizedTitle = (d.title || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
        const normalizedOriginal = (d.original_title || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
        const exact = normalizedQuery === normalizedTitle || normalizedQuery === normalizedOriginal;

        return {
          id: d.id,
          title: d.title,
          originalTitle: d.original_title,
          year,
          director,
          overview: d.overview || "",
          runtime: d.runtime || null,
          genres: (d.genres || []).map((g) => g.name),
          rating: typeof d.vote_average === "number" ? d.vote_average : null,
          voteCount: d.vote_count || 0,
          posterUrl: d.poster_path ? `${IMAGE_BASE}${d.poster_path}` : "",
          imdbId: d.external_ids?.imdb_id || "",
          confidence: exact && index === 0 ? "high" : "normal"
        };
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
