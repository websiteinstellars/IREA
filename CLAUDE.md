# Instellars Banking CDH Demo

A demo banking site showcasing Pega Customer Decision Hub (CDH) — real-time, cross-channel offer personalization — across three surfaces: this multi-page website, an embedded mobile app (`mobile-app.html`), and an agent desktop (`agent-desktop.html`).

**Before making changes, read [`DEVELOPER_HANDOVER.md`](DEVELOPER_HANDOVER.md) in this same directory.** It's the full project history — architecture, customer/journey data model, live Pega API endpoints and their quirks, every bug found and fixed, and open items — written by prior sessions for whoever picks this up next. It's long; skim the section headers and read what's relevant to the task at hand rather than the whole thing top to bottom.

A few things worth knowing before diving in, expanded on in the handover doc:

- `mobile-app.html` and `agent-desktop.html` are standalone single files with their **own inlined copies** of shared logic (customer data, offer catalog, CDH calls, explainability). A fix in `js/*.js` usually needs mirroring into these files by hand — check the handover doc's convention notes before assuming a shared-file fix is enough.
- `instellars-cdh-demo.html` (if present in a parent folder) was meant to stay byte-identical to `mobile-app.html` but has drifted — don't trust that convention without checking.
- CORS behavior against the live Pega endpoints (`instellars02.pegalabs.io`) varies by environment — test directly with a `fetch()` call rather than assuming it's blocked or open.
- When you finish a working session, add a new numbered section to `DEVELOPER_HANDOVER.md` (matching its existing style: what was asked, root cause, fix, how it was verified live) rather than leaving changes undocumented.
