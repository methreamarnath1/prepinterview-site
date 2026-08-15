# PrepInterview

A static, deployable, multi-subject interview prep library. Started with a
full Python notes library (43 chapters); built so you can keep adding more
subjects — Java, SQL, System Design, whatever you're studying next — without
touching any app code.

Sidebar navigation with a subject switcher, search (scoped to whichever
subject you're in), code highlighting, dark mode, and per-chapter
read-progress tracking (saved in your browser via `localStorage`).

## Project structure

```
pynotes/
├── index.html
├── style.css
├── app.js                        # you shouldn't need to touch this for content updates
└── content/
    ├── subjects.json             # <-- top-level index of every subject. Add subjects here.
    └── python/
        ├── manifest.json         # <-- drives Python's nav. Add chapters/parts here.
        ├── part1/ch01.md ... ch09.md
        ├── part2/ch10.md ... ch19.md
        ├── part3/ch01.md ... ch13.md
        ├── part4/ch01.md ... ch08.md
        └── appendix/*.md
```

## Running it locally

The app fetches markdown/JSON at runtime, so opening `index.html` directly
(`file://`) will fail in most browsers (CORS blocks local fetch). Serve it:

```bash
cd pynotes
python3 -m http.server 8080
# open http://localhost:8080
```

or `npx serve .`

## Deploying it

Plain static site, no build step:

- **Vercel**: `npx vercel` from inside `pynotes/`, or drag-and-drop the
  folder at vercel.com/new.
- **Netlify**: drag-and-drop the folder at app.netlify.com/drop.
- **GitHub Pages**: push the folder to a repo, enable Pages on the root
  (or `/docs`).

Read progress and your dark/light preference are stored per-browser, so they
won't sync across devices unless you're signed into the same browser with
sync on.

## Adding a whole new subject

This is the main thing you'll do over time.

1. Make a folder: `content/<subject-id>/` (e.g. `content/java/`).
2. Inside it, write `manifest.json` with the same shape as
   `content/python/manifest.json`:
   ```json
   {
     "title": "Java",
     "subtitle": "Interview-ready Java notes",
     "parts": [
       {
         "id": "part1",
         "label": "Part 1",
         "title": "Java Foundations",
         "chapters": [
           { "id": "ch01", "num": 1, "title": "JVM & Execution Model", "file": "content/java/part1/ch01.md" }
         ]
       }
     ]
   }
   ```
3. Put your chapter `.md` files at the paths you referenced (e.g.
   `content/java/part1/ch01.md`).
4. Add ONE entry to `content/subjects.json`:
   ```json
   { "id": "java", "label": "Java", "description": "Interview-ready Java notes", "accent": "#E5484D", "manifest": "content/java/manifest.json" }
   ```
5. Redeploy (or refresh, if running locally). The new subject shows up as a
   card on the home page and in the sidebar subject switcher automatically.

`accent` is any hex color — it's just the small swatch dot next to the
subject name, so pick something different from your other subjects to tell
them apart at a glance.

## Adding a chapter to an existing subject

1. Drop a new `.md` file into `content/<subject-id>/partN/`.
2. Add one entry to that part's `chapters` array in that subject's
   `manifest.json`.

## Adding a whole new part within a subject

Add a new object to that subject manifest's top-level `parts` array, same
shape as the existing ones, pointing at a new `content/<subject-id>/partN/`
folder.

## Markdown support

Headings, bold/italic, lists, tables, blockquotes, fenced code blocks (with
syntax highlighting), and links all render automatically — source `.md`
files don't need any special formatting beyond standard Markdown.

## If you want Claude to keep extending this for you

Come back with new `.md` notes and say what subject/part they belong to —
whether it's a new chapter in Python or an entirely new subject. The
manifest-driven structure means these are small, targeted edits rather than
a full rebuild each time.
