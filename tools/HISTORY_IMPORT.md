# BEZLIKI history on triznes.online

`history.html` displays chronological posts, original captions, photos, videos, audio and file links. It supports text/year/media filters and loads 30 moments at a time. No historical events or media are fabricated. The current data file is intentionally empty until the export is obtained.

## Import

1. Obtain a full Telegram Desktop JSON export of @bezlikiforall with its media tree. Preserve it unchanged in the private canonical archive. Verify the numeric channel ID against the channel; a matching display name is insufficient.
2. Run `python3 tools/import_telegram_history.py /absolute/export/result.json --confirmed-channel-id VERIFIED_ID --output /absolute/empty/staging/history`.
3. Inspect `import-report.json`. Exit code 2 means missing media or duplicate message IDs; do not describe this as a complete import. Missing large files can be caused by export size settings. Rerun to a new empty staging directory after resolving gaps.
4. Inspect the site package before publishing. The user's public-history request covers this channel, but raw exports, private archive locations and credentials must stay outside this public repository. Public website files are `posts.json` plus the staged `media/` files only. Keep the detailed import report private.
5. Replace `history/posts.json` with the validated output and place assets under `history/media/`, or move media to the site's established media hosting with a corresponding viewer update. Large videos should use dedicated media hosting, not a Git commit. Wire a homepage link to `history.html` when the data is populated and deploy using the site's existing publishing mechanism.

The importer validates channel ID/type, confines media reads to the export root, hashes media without reading entire videos into RAM, deduplicates bytes and message IDs, preserves text entities/forwarding/edit timestamps in the manifest, and reports every missing reference. It never overwrites a populated output folder. It does not invent locations, people, ages, or event dates.

Browser playback of `.mov`, `.opus` and other formats varies. Preserve originals privately; produce compatible copies for the public site when needed. Originals with unsupported browser types remain downloadable.
