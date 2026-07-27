# FilmFootnote¹

**Every film title can become a footnote.**

FilmFootnote is a Chrome browser extension that identifies a movie title selected on a webpage and presents a compact information card with the film's poster, year, director, synopsis, runtime, genre, TMDB rating, and links to TMDB, Letterboxd, Douban, IMDb, and Rotten Tomatoes.

## Product idea

Movie information is fragmented across multiple platforms. Looking up a title interrupts the reading experience and often requires repeating the same search. FilmFootnote turns a movie title already present on the page into an interactive footnote.

## Interaction

`Select a title → click ¹ → identify the film → review metadata → open a preferred platform`

## Features

- In-page movie-title lookup
- Film poster, year, director, synopsis, runtime, genre, and TMDB rating
- Same-name movie disambiguation
- Direct TMDB and IMDb title links when available
- Search links for Letterboxd, Douban, and Rotten Tomatoes
- User-selectable preferred platform
- Server-side API token protection through Netlify Functions
- No account required

## Architecture

```text
Selected webpage text
        ↓
Chrome Extension (Manifest V3)
        ↓
Netlify Function
        ↓
TMDB API
```

## Repository structure

```text
extension/                 Chrome extension files
netlify/functions/         Serverless movie-search function
index.html                 Product landing page
privacy.html               Public privacy policy
netlify.toml               Netlify deployment configuration
STORE_LISTING.md           Chrome Web Store copy and disclosure answers
PORTFOLIO_CASE_STUDY.md    Portfolio-ready project narrative
```

## Local extension installation

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `extension` folder.
5. Refresh a normal webpage, select a movie title, and click the small `¹` button.

## Backend deployment

1. Deploy the repository root to Netlify.
2. Add a server-side environment variable:
   - Key: `TMDB_TOKEN`
   - Value: your TMDB API Read Access Token
3. Redeploy.
4. Test:
   `https://filmfootnote.netlify.app/.netlify/functions/search-movie?q=The%20Lost%20Boys`

Never commit a real TMDB token or `.env` file.

## Chrome Web Store package

Upload a ZIP whose root contains `manifest.json`. Do not include the Netlify backend or repository documentation in the Web Store ZIP.

A ready-to-upload extension ZIP is generated separately from this repository.

## Privacy

FilmFootnote sends only text actively selected by the user to its Netlify backend and TMDB for movie identification. It does not intentionally store browsing history or selected titles in an application database. See `privacy.html` for the complete policy.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Letterboxd, Douban, IMDb, Rotten Tomatoes, and TMDB are trademarks of their respective owners. FilmFootnote is an independent project.

## Status

Working prototype prepared for Chrome Web Store review.

## Creator

Designed and developed by **Yian Li**, 2026.
