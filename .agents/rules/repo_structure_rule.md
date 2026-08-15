# Repository Structure Directive

1. **The application lives at the repository root.** Source is `src/`, entry point is
   `index.html` -> `src/main.jsx`, and Vite builds from the root `vite.config.js`.

2. **Never create or edit files under `ICJ BACKEND/`.** That nested path is a stale
   duplicate. Vite does not build it, so anything written there compiles into nothing and
   never reaches the deployed site. It was deleted on 2026-08-11 and has since reappeared;
   do not treat its presence as permission to write there.

3. **Edit exactly one copy of a file.** If a file appears at both `src/foo.jsx` and
   `ICJ BACKEND/ICJ BACKEND/src/foo.jsx`, the root one is authoritative. Do not mirror
   changes into a second location.

4. **Why this matters:** in August 2026 a finished onboarding feature was written only to the
   nested path and never shipped, while unrelated voice fixes were written only to the root
   path. The two copies silently diverged in opposite directions. The unshipped work is
   preserved in `docs/legacy/UNSHIPPED_*`.
