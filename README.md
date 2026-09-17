Live site: https://<github-username>.github.io/overlap/

Owner steps: create repo overlap → push main → Settings → Pages → Source = GitHub Actions.
Success = shared github.io link works for any visitor.

---

# OVERLAP — Client-Side Pairwise Document Similarity Analyzer

OVERLAP is a public, zero-backend document similarity engine built for researchers, legal reviewers, educators, and engineers. Visitors can upload 2 to 5 PDF or DOCX files and immediately analyze pairwise semantic overlap directly within the browser.

## Key Principles

- **100% Client-Side Privacy**: Uploaded documents never leave the visitor's device. No data is sent over the network, no AI APIs are contacted, no telemetry is tracked, and no server storage is used.
- **Vercel / Linear Dark Precision**: Engineered with an austere dark aesthetic, Geist typography, copper accents (`#d47a3a`), and warm paper text (`#efe6d4`).
- **Mathematical Rigor**: Evaluates pairwise TF-IDF Cosine similarity as the primary metric, paired with Jaccard lexical intersection as a secondary metric.

## Features

- **Document Constraints**: Supports PDF and DOCX files up to 12MB each.
- **Corpus Slots**: Supports 2 to 5 documents (`D1` through `D5`). A single file cannot execute a comparison.
- **Interactive Heatmap**: Visual $N \times N$ matrix displaying full pairwise similarity with copper gradient heat levels. Clicking any matrix cell instantly loads that pair into the inspector.
- **Compare [A] with [B] Switcher**: Instantly reassign comparator slots or swap $[A] \leftrightarrow [B]$ with a single click.
- **Animated Circular Meter**: Precision SVG circular gauge with smooth stroke animation and categorical overlap assessment.
- **Top Overlapping Terminology**: Inspect shared key phrases weighted by corpus inverse document frequency.
- **Scanned PDF Safeguard**: Flags and warns users if extracted text contains fewer than 80 characters, alerting them to image-only or scanned documents requiring OCR.
- **Demo Mode**: Built-in 3-document dataset for immediate testing without local files.

## Technical Architecture

- **Framework**: Vite + React 19 + TypeScript + Tailwind CSS
- **PDF Engine**: `pdfjs-dist@3.11.174` with web worker from unpkg
- **DOCX Engine**: `mammoth` client-side arraybuffer parser
- **Deployment**: GitHub Pages Action (`.github/workflows/deploy.yml`)
