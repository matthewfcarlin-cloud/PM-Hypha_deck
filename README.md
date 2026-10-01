# Hypha pitch deck (Group 11)

**Hypha: packaging that grows to fit.** A smart void-fill system that 3D-prints a biodegradable, mycelium-based foam directly into the shipping box.

- `index.html`: the animated deck. Open it in a browser. Use ← → or space to move, **N** for speaker notes, **F** for fullscreen.
- `Hypha_Pitch_Deck_with_Sources.pdf`: the submission version. Every slide is shown fully revealed, with a numbered source line along the bottom and clickable references on the last two pages.

## Rebuilding the PDF after editing the deck

```bash
cd pdf-build
npm install
python3 make_deck.py      # copies index.html with local fonts
node render.js            # screenshots each slide (source footers are set in render.js)
pip install reportlab pillow
python3 build_pdf.py      # writes ../Hypha_Pitch_Deck_with_Sources.pdf
```

If you add or remove slides, update the footer numbers in `render.js`, plus the slide count and the reference list in `build_pdf.py`.
