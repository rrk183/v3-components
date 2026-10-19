# GCC Market Access hero, shot sheet (Kiran)

Status 2026-10-13: TREATMENT, ready to shoot. Art direction only; generation runs from the main session.
Target file: `staging/gcc-market-access/gcc-hero.jpg` (poster plate for the hero video slot, or a still replacement), plus `gcc-og.jpg` at 1200x630.

## Brief and read

BRIEF: new hero for GCC Market Access (Emirates NBD Capital: institutional and individual investors trading the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman from one platform). Same family as Insights & Research, smartSCF and Equity Capital Markets, distinct from all of them. The idea is reach across six markets.

READ: the H1 is "Invest beyond borders, across the GCC." The picture is a line of warm light running across the Gulf at blue hour, joining one shore to the next: reach shown as a connection, not as a map or a skyline. The moment is the last minutes of blue before night, every lamp on, the water dead calm, nothing moving yet. No flags, no borders drawn, no country singled out, because the point is one route across all six.

## Current media notes

- Hero video (`staging/gcc-market-access-v1a/gcc-market-access-2026-07-05-hero.mp4`, 768x432, 18.8 s, 1.6 MB): a sunset timelapse of downtown Dubai with the Burj Khalifa dead centre. **It carries a visible iStock / Getty Images watermark across the middle of the frame.** That is a licensing problem, not a taste note: it must not ship as is, whatever direction is chosen. It is also a recognisable landmark, a single-country picture on a six-country page, pink and peach daylight off the family palette, and only 432p, so it is soft at hero width.
- The video has no `poster` attribute, so the hero shows the navy surface until the first frame decodes. The new still should become the poster.
- The preload, `og:image` and JSON-LD all point at `assets/webxv2/images/shared/common/gcc-market-access-hero.jpg` (1000x560): a CGI glowing network map of the Middle East with country outlines. CGI breaks the photographic family, it is a map with drawn borders (the opposite of the headline), and it is under the 1200x630 OG size. Its `og:image:alt` says "A regional financial trading floor with live market data screens", which describes neither the map nor the video. That file is also used by `execution-capabilities-v2.html` and `events-library.html`, so write the new plate into this folder and do not overwrite the shared file.

## Treatment

- PLACEMENT: full-bleed page hero, 16:9 plate, `cmp-hero is-bottom`, min height clamp(560px, 88vh, 860px). Copy bottom-left: eyebrow, a two-line H1, a four-line lead and two CTAs, filling about the left 50 percent of the width and the lower 55 percent of the height at 1440. Overlay is a flat `ov-tint ov-70`, the heaviest in the family, so the plate needs one clear warm element that survives the tint and must supply its own calm under the copy. The transparent brand header sits over the top tenth.
- HUMAN OR NOT: no people. The subject is a region and the link across it, not an investor. A figure at this scale under a 70 percent tint would be a smudge and would compete with the headline. Stated as the call.
- GENRE: photographic editorial landscape, matching the family. No CGI, no glowing network lines, no maps, no tickers, no flags.
- BRAND MECHANISM (ENBD): colour is the light. Navy and cobalt from the blue-hour sky and the sea; gold from warm sodium lamps. Nothing laid on as a grade.
- LIGHT: blue-hour sky as the fill, a single line of warm lamps as the accent, roughly 6:1, so the water and foreground fall to navy by themselves.
- CAMERA AND LENS: 35mm feel, f/4, eye level or just above the water, horizon level.
- GRADE: navy and cobalt shadows, warm gold highlights, soft contrast, natural colour, fine grain.
- COMPOSITION: a horizontal composition. The subject (the line of light) runs across the frame in a band between about 32 and 45 percent of the height, its brightest point between 45 and 60 percent of the width. The lower half, across the full width, is calm dark water. The top tenth is dark sky.
- BILINGUAL SOLUTION: symmetrical, horizontal subject with type below. The flat tint does not need mirroring and the lower half is calm edge to edge, so one plate serves the LTR copy (bottom-left) and the RTL copy (bottom-right). No flipped plate needed. If the winner's brightest point drifts past 65 percent of the width, a horizontal flip is safe as an Arabic fallback (no text, no handedness cues).
- MOBILE CROP: at 375 the cover crop keeps roughly the central 30 percent of the width (about 35 to 65 percent). A horizontal line of light survives any centre crop, which is a structural advantage of all three directions here. Keep the brightest point inside 42 to 60 percent so it sits above the H1.
- REGIONAL FIT: generic Gulf water and shoreline, low contemporary towers only as a soft distant glow. No identifiable bridge or causeway (avoid border-post islands with towers, arches, cable stays), no landmark skyline, no flags on boats or poles. No religious motifs as decoration; a distant minaret silhouette is not wanted as a cue either, keep it out.
- MODEL: `seedream-5-pro`, 16:9, 2k, matching the sister heroes.
- ROUND: 2 variants per direction, 6 images. Axis under test is the subject only; light, lens, grade and composition are locked. Then 2 more of the winner only if it needs a fix. Export 1920x1080 JPEG q80, under 400 KB, metadata stripped; plus a 1200x630 centre crop for OG.

Prompt style: plain descriptive paragraphs, about 150 to 200 words, per the filter lesson. No spec blocks, no grading jargon, short closing line.

## Direction A, The Crossing (RECOMMENDED)

A long, low sea bridge crossing calm open water at blue hour, seen side-on from a distant shore. The bridge runs straight across the whole width of the frame, a little above the middle, plain and modern, a flat concrete deck on slender piers with no arches, no towers and no cables. Just right of centre it rises gently over a slightly higher navigation span. A single line of warm sodium lamps runs along its length, glowing gold, and repeats as soft streaks of reflected light in the still water. Far beyond the bridge, a low distant shoreline with a faint warm glow of a city, no building distinct. Above, a deep cobalt sky fading to a thin pale amber band at the horizon. The lower half of the frame is open, glassy sea in deep navy, calm and even, broken only by the long soft reflections of the lamps. 35mm lens, f/4, eye level just above the water, horizon perfectly level, the bridge in sharp focus. Navy and cobalt shadows, warm gold highlights, soft contrast, natural colour, fine grain. Photographic, calm, spacious. No text, no numbers, no logos, no signs, no flags, no vehicles, no people.

Why it fits: the H1 says "beyond borders" and the bridge is the one picture of that without a map or a flag: a single route across open water, running off both edges of the frame, so it reads as reach rather than as one city. It is a landscape, so it is distinct from every sister hero (reading room, warehouse apron, bell hall, boardroom, plaza), and its one horizontal gold line is the strongest element in the family for surviving a 70 percent tint. Symmetrical and horizontal, so one plate serves English and Arabic, and any centre crop on mobile still shows the line.

Risk to watch: the model may build a landmark (cable-stayed towers, arches, or a mid-sea island with twin towers that reads as a real causeway). Reroll on any of those. Vehicles with headlights may appear; acceptable only as faint streaks, reroll if cars are legible. Zoom the piers and the navigation span for signs or lettering.

## Direction B, The Dhow Harbour

A row of six traditional wooden dhows moored side by side along a quiet stone quay at blue hour, photographed side-on from across still harbour water. The boats sit in a line across the middle of the frame, a little above centre, their plain dark teak hulls and tall bare masts reflected in the water. Each dhow carries one small warm lantern hanging near the stern, six soft gold points evenly spaced across the frame, the brightest just right of centre. The hulls are unpainted and unmarked. Behind the quay, a low line of distant modern buildings, out of focus, with a few warm windows, and above them a deep cobalt sky fading to a thin pale amber band at the horizon. The lower half of the frame is still, dark navy harbour water, calm and even, holding only soft reflections of lanterns and masts. The lanterns are the only warm sources. 35mm lens, f/4, eye level from the water's edge, horizon level, the boats in sharp focus. Navy and cobalt shadows, warm gold highlights, soft contrast, natural colour, fine grain. Photographic, still, timeless. No text, no numbers, no logos, no flags, no people.

Why it fits: dhows carried trade between these six shores long before there were exchanges, so the picture says "one regional market" in the region's own language, and six lanterns quietly stand for six markets without a single flag. Most distinctive and most regional of the three. Weaker than A because heritage can read as tourism rather than institutional brokerage, and the count of six is a correctness risk.

Risk to watch: models miscount boats and lanterns (verify exactly six of each; if it will not hold, drop "six" and accept the row as atmosphere, and say so in the alt text). Dhows attract painted Arabic names on the bows and small national flags on the masts: zoom every bow and masthead, reroll on any letterform or flag. Check the masts are bare, no rigging tangles that read as damaged.

## Direction C, Above the Gulf

The Gulf coastline seen from very high altitude at blue hour, as if from a high aircraft, photographed as a quiet editorial aerial landscape. A long, gently curving shoreline sweeps across the frame from left to right, a little above the middle, with small scattered clusters of warm gold city lights strung along it like beads, some large, some small, the brightest cluster just right of centre. No lines or borders are visible on the land, only darkness between the towns. Inland, the desert is deep navy and textureless. Above, the faint curve of the horizon with a thin pale amber band and a deep cobalt sky. The lower half of the frame is open sea, very dark navy and calm, with a faint soft sheen of sky light on its surface. Cool blue twilight fills the scene, and the city lights are the only warm sources. 35mm lens, f/4, looking out and slightly down from altitude, horizon level, the coastline in sharp focus. Navy and cobalt shadows, warm gold highlights, soft contrast, natural colour, fine grain. Photographic, calm, vast. No text, no numbers, no labels, no map lines, no aircraft wing, no logos, no people.

Why it fits: the most literal reading of "beyond borders": from this height the borders are simply not there, only one coast of lights. It answers the current OG map with the photographic version of the same idea. Weakest of the three because the geography can drift toward a recognisable outline (the Qatar peninsula, the Musandam tip), it sits closest to the Insights Overlook in grammar, and a satellite-like view can tip into the CGI-map look we are moving away from.

Risk to watch: any recognisable coastline shape (reroll), glowing lines between cities that read as a network graphic (reroll), an aircraft wing or window frame (reroll), labels. Check it reads as a photograph, not a render: grain, softness, no neon blue.

## Recommendation

Direction A, The Crossing. It is the only frame that shows reach as a physical connection rather than as a place, which is exactly what the H1 promises, and it does so with no map, no flag and no country singled out, so it is fair to all six markets. Its single horizontal line of gold carries through the flat 70 percent tint better than any other plate in the family, the dark sea gives a calm lower half edge to edge, and the composition is symmetrical, so one plate serves English and Arabic and any mobile crop still shows the line. B is the fallback if Ram wants a more regional, heritage reading; C if he wants to stay close to the current map idea in photographic form.

Alt text (A): A long sea bridge crossing calm Gulf water at blue hour, its line of warm lamps reflected below.

Alt text (B): Six wooden dhows moored along a quiet quay at blue hour, each with a warm lantern reflected in the water.

Alt text (C): The Gulf coastline from high altitude at blue hour, warm city lights strung along a dark shore.

The hero video is `aria-hidden`, so alt text applies to the OG image (replacing the current "A regional financial trading floor with live market data screens", which matches nothing on the page), the twitter image alt, and any still replacement.

## Checks before wiring

1. No letterforms anywhere: zoom the bridge piers and span, every dhow bow, masthead and lantern, and any distant building. No flags anywhere, including tiny ones on boats and poles.
2. No identifiable landmark, real causeway, real skyline or recognisable coastline shape.
3. Brightest point between 42 and 60 percent of the width and 32 to 45 percent of the height; lower half dark and even before the 70 percent tint. Preview at 1440 and 375, EN and AR.
4. No people or vehicles that read as more than soft light streaks, including in reflections.
5. If the slot stays video: animate only the approved still (very slow 3 percent drift, lamps steady, a faint ripple across the reflections), never a fresh text-to-video, encode 1920x1080 under 6 MB, and set the new plate as the `poster` (there is none today) so load and play show the same picture.
6. Retire the watermarked iStock video regardless of which direction wins.
7. Write new poster and OG files in this folder; do not overwrite `assets/webxv2/images/shared/common/gcc-market-access-hero.jpg`, which two other pages use. Update the preload, `og:image`, `twitter:image`, JSON-LD image and both alt attributes to the new file in the same pass.
