# 読む

An unofficial WaniKani client for lessons and reviews. One responsive PWA for desktop and phone, hosted on Netlify.

## Develop

Needs Node 26 or later (for `Temporal`); `.nvmrc` pins it for nvm and Netlify.

```sh
npm install
npm run dev     # local dev server
npm test        # unit tests (Vitest)
npm run build   # type-check and production build into dist/
```

## Token

Create a personal access token at https://www.wanikani.com/settings/personal_access_tokens with `assignments:start` and `reviews:create` ticked, then paste it into the app. It is stored only in this browser's local storage.

## Deploy

Netlify builds from this repo using `netlify.toml` (`npm run build`, publish `dist`). `public/_redirects` sends every route to the app.
