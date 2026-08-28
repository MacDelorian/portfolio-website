# Hero artwork

`hero.webp` is the painting behind the landing screen — the hand-painted night
sky that carries the lettered name. `../index.html` is a single self-contained
file, so the artwork is embedded in it as a data URI; this copy is kept as the
source file.

To swap it for another painting: replace this file, then re-encode it into
`index.html` (the `<img class="hero-art">` src) and, if the proportions differ
from 2000 × 1266, update `--art-ratio` and the two `1.5806` / `2000/1266`
values in the `.hero` styles.

The page crops the artwork to the window from the centre, so keep the lettering
near the middle of the canvas: the small "Graphic design & illustration" line is
positioned just above it.
