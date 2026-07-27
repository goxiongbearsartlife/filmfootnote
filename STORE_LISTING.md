# Chrome Web Store Listing — FilmFootnote

## Title

FilmFootnote

## Summary

Select a film title to identify it and open movie information across major film platforms.

## Category

Tools  
Fallback: Productivity

## Language

English

## Detailed description

FilmFootnote helps you identify a film without interrupting what you are reading.

Select a movie title on almost any webpage and click the small FilmFootnote button beside the selected text. FilmFootnote identifies the matching movie and displays a compact card with its poster, release year, director, synopsis, runtime, genre, and TMDB rating.

From the same card, you can continue to TMDB, Letterboxd, Douban, IMDb, or Rotten Tomatoes. You can also choose which platform appears first.

Features:

• Identify movie titles selected on webpages  
• View posters, release years, directors, synopses, runtimes, genres, and TMDB ratings  
• Choose between candidates when multiple films share a title  
• Open exact TMDB and IMDb pages when available  
• Search Letterboxd, Douban, and Rotten Tomatoes  
• Choose a preferred film platform  
• Lightweight in-page interface  
• No FilmFootnote account required  

How to use:

1. Select a movie title on a webpage.  
2. Click the small ¹ button beside the selection.  
3. Review the identified movie information.  
4. Open your preferred film platform.

Privacy:

FilmFootnote processes text only after you actively select it and click the FilmFootnote button. The selected title is sent to FilmFootnote's Netlify backend and TMDB to retrieve matching movie information. FilmFootnote does not sell personal data or intentionally store browsing history.

FilmFootnote is an independent extension and is not affiliated with, endorsed by, or sponsored by Letterboxd, Douban, IMDb, Rotten Tomatoes, or TMDB.

This product uses the TMDB API but is not endorsed or certified by TMDB.

## Single purpose

FilmFootnote identifies a film title actively selected by the user on a webpage and displays movie information with links to film databases and review platforms.

## Permission justification — storage

The storage permission saves the user's preferred film platform and technical extension settings. These settings allow FilmFootnote to preserve the user's choice across browser sessions.

## Permission justification — host access

FilmFootnote uses access to `https://filmfootnote.netlify.app/*` only to send a user-initiated movie-title query to its serverless backend and receive movie-search results.

## Content-script justification

The content script runs on webpages so FilmFootnote can detect text actively selected by the user and display its movie-information card beside the selection. It does not continuously transmit webpage content. A lookup occurs only after the user selects text and clicks FilmFootnote.

## Remote code

No. FilmFootnote does not download or execute remote JavaScript or WebAssembly. The backend returns movie data as JSON.

## Data-use disclosure

FilmFootnote handles website content in the limited form of text actively selected by the user.

Purpose:
- App functionality

The selected text is transmitted to:
- FilmFootnote's Netlify serverless backend
- TMDB, for movie identification

FilmFootnote does not use this information for:
- Advertising
- Creditworthiness
- Lending
- User profiling
- Selling data
- Personalized recommendations unrelated to the lookup

## Privacy policy URL

https://filmfootnote.netlify.app/privacy.html

## Homepage URL

https://filmfootnote.netlify.app/

## Support email

captainanlie@gmail.com

## Screenshot plan

1. **Select a film title and identify it instantly**  
   Show a real webpage with “The Lost Boys” selected and the FilmFootnote card open.

2. **See essential movie information without leaving the page**  
   Show the poster, year, director, synopsis, runtime, genre, and TMDB rating.

3. **Continue to your preferred film platform**  
   Show TMDB, Letterboxd, Douban, IMDb, and Rotten Tomatoes buttons.

4. **Choose which platform appears first**  
   Show the extension settings popup with the preferred-platform selector.

Recommended screenshot size: 1280 × 800 PNG or JPEG, without private browser information.
