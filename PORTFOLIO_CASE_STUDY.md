# FilmFootnote — Portfolio Case Study

## One-line description

A browser extension that turns film and TV titles found on the web into interactive film footnotes.

## Role

Independent product designer and developer

## Year

2026

## Problem

Movie information is scattered across databases, review communities, and regional platforms. When a film is mentioned in an article, program, interview, or social post, looking it up means leaving the page and repeating the same search across several services.

## Concept

FilmFootnote treats a film or TV title as an annotation point. The user selects the title already present on the webpage, and a compact layer appears beside it with enough context to understand the film and continue to a preferred platform.

## Core interaction

`Select → Identify → Understand → Continue`

## Design principles

### Context, not interruption

The information appears next to the selected title instead of forcing the user into a separate search workflow.

### One identity, multiple communities

TMDB provides a consistent movie identity and metadata layer. FilmFootnote then connects that film to different viewing cultures: Letterboxd, Douban, IMDb, Rotten Tomatoes, and TMDB.

### Progressive disclosure

The card prioritizes essential information—poster, year, director, runtime, genre, synopsis, and rating—before offering external links.

### User-defined priority

Different users trust different film platforms. FilmFootnote allows each user to choose which platform appears first.

## Ambiguous-title resolution

Titles such as *Crash*, *Mother*, or *The Killer* may refer to multiple films. FilmFootnote presents candidates using posters, years, and directors before opening the full information card.

## Technical system

```text
Webpage text selection
        ↓
Chrome content script
        ↓
FilmFootnote floating interface
        ↓
Netlify serverless function
        ↓
TMDB search and movie-details APIs
```

The TMDB credential remains in a Netlify environment variable rather than in the browser extension's visible source code.

## Privacy decisions

- A query is made only after an explicit user action.
- Only the selected text is sent for identification.
- FilmFootnote does not intentionally retain queries in an application database.
- Browser storage is limited to platform preference and technical settings.
- The extension does not inject remote executable code.

## Outcome

A working Manifest V3 Chrome extension and serverless backend were designed, built, deployed, and prepared for Chrome Web Store review.

## Resume entry

**FilmFootnote — Browser Extension Designer & Developer**  
Independent Project, 2026

Designed and developed a Chrome extension that identifies film and TV titles selected on webpages and displays posters, release information, directors, synopses, runtimes, genres, and TMDB ratings. Built a serverless Netlify backend for secure TMDB integration and created a cross-platform interface linking TMDB, Letterboxd, Douban, IMDb, and Rotten Tomatoes.

## Concise resume entry

**FilmFootnote — Chrome Extension, 2026**  
Designed and developed a movie-identification browser extension using JavaScript, Chrome Extension APIs, TMDB API, and Netlify Functions, with cross-platform links and user-defined platform preferences.

## Suggested portfolio page sequence

1. Hero image: selected film or TV title with open FilmFootnote card  
2. Problem: fragmented film lookup  
3. Interaction diagram  
4. Interface anatomy  
5. Ambiguous-title candidate flow  
6. Platform-preference settings  
7. Technical architecture  
8. Privacy and API-key decisions  
9. Working outcome and Chrome Web Store status
