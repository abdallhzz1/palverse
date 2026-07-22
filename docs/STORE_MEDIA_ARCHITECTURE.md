# Store Media Architecture

## Overview
The media system for Palverse relies on the `store_media` table and Laravel's local/public storage mechanism. 

## Structure
- `StoreMedia` model handles standard metadata (`type`, `file_path`, `disk`, `mime_type`, `file_size`, `width`, `height`).
- Types are defined via `StoreMediaType` enum: `logo`, `cover`, `gallery`.

## API Responses
The API uses `StoreResource` which eager-loads:
- `logo` -> `StoreMediaResource`
- `cover` -> `StoreMediaResource`
- `gallery` -> array of `StoreMediaResource`

## Frontend Implementation
- The web app reads URLs dynamically through `store.logo?.url` and `store.cover?.url`.
- The merchant dashboard supports real-time async file uploading through the `StoreMediaController`.
- Limits are checked primarily on the backend (using `palverse.media.limits` configuration bounds) to protect the server, while standard UI error alerts inform users of failed uploads.
