# NextMe-800

Cinema-style research photo atlas. Static HTML/CSS/JS for GitHub Pages.

130 selected moments: 64 verified source-frame video previews, 66 still photographs. Source footage sampled at 1 Hz; previews play at 3x. Sound is enabled only for available aligned anonymized audio. Captions refer to selected activities; images are curated for diversity, not unbiased duration sampling.

Serve locally with `python3 -m http.server 8766`.

Small 160px posters load first; visible tiles animate as compact 96px GIFs. After images load, up to three nearby 640px videos are prefetched with low priority. Hover playback is 3x; original source sampling is 1 Hz, so motion is sparse rather than native high-frame-rate footage.

When available, gaze is matched by exact source frame filename and projected through the same crop. Green points and yellow trails are approximate recorded gaze, not inferred attention. Missing or invalid gaze is omitted.
