# Legacy and unshipped work

## `UNSHIPPED_*` — code that never reached the deployed site

A duplicate copy of the app exists at `ICJ BACKEND/ICJ BACKEND/`. Vite builds only from the
repository root, so nothing in that folder is ever compiled or deployed. The two copies
drifted in opposite directions, and the duplicate was removed on 2026-08-11 — but it
reappeared and is present again as of 2026-08-16. See `.agents/rules/repo_structure_rule.md`.

These files are the work that existed **only** in the duplicate as of 2026-08-11, and which
still has no equivalent at the repository root:

| File | What it is |
|---|---|
| `UNSHIPPED_intake_services_feature.patch` | A "Select Service Needed / आवश्यक सेवा का चयन करें" picker for the public onboarding form (Notary, Drafting, Writer/Typist, Court Representation). Adds an `INTAKE_SERVICES` constant, an `intakeServices` form field, a `handleToggleIntakeService` handler, and the UI block. |
| `UNSHIPPED_voiceStorageService.js` | A voice-note storage service. Nothing in the live app imported it. |
| `UNSHIPPED_MyAdvocateSettings.jsx` | An advocate settings card. Nothing in the live app imported it. |

To restore the onboarding feature, from the repository root:

```sh
git apply -R docs/legacy/UNSHIPPED_intake_services_feature.patch
```

The patch is reversed (`-R`) because it was generated as root → duplicate. Review the result
and rebuild before committing; it has not been tested against the current `PublicOnboarding.jsx`,
which has changed since.

**Do not** copy the duplicate's other files back wholesale. Its `VoiceCommentaryStudio.jsx`
was *older* than the root version and would undo several commits of speech-recognition fixes.

## Other contents

The remaining files here are planning and status documents inherited from an earlier,
abandoned copy of the project. They are kept for reference and are not maintained.
