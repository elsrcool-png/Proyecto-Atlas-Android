# Atlas Observer v2

Stable observation surface for the Atlas 4.4.1 + 2.62.8 builder.

- `latest.json` is the canonical machine-readable state.
- `latest.md` is the human-readable dashboard.
- The observer reacts to builder completion and polls every 10 minutes as a recovery path.
- Automatic fallback selects the newest completed run only.
- Manual inspection can target a specific run ID.
- Playtest Agent is not part of this pipeline.
