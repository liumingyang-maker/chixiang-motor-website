# Spanish Support Content Plan (ES) — Phase 2 Discovery

Research only. **No production file changed.** This plans informational (guide) content for the Spanish locale.

## Architecture facts that constrain every recommendation (OBSERVED)
- EN already runs the model to copy: two guide pages exist — `/en/air-cooled-vs-water-cooled-motorcycle-engine` and `/en/how-to-choose-motorcycle-engine-manufacturer-china` (`page_type=guide`, entity role `article`). ES and PT have **zero** guides.
- `es/news.html` is titled "Noticias y guias" and already acts as the article hub, but it currently links readers to the **English** guides. That is the natural index/host for ES support pages.
- Breadcrumb convention for articles (from `scripts/site-entity-manifest.js`): `Home → Noticias → <article>` (`role=article`).
- **Hard dependency — creating ANY new ES URL is a Foundation change:** it requires a coordinated edit to `sitemap.xml`, `scripts/site-entity-manifest.js` (`classify()` regexes currently whitelist only the two EN article slugs; a new `/es/guia/...` would otherwise be misclassified as `family/CollectionPage` with a wrong `Products` breadcrumb), the page's own JSON-LD/breadcrumb, and the entity/schema tests. This must go through the AGENTS.md exception flow (explicit approval + evidence + separate PR + tests + Preview + rollback). This plan therefore recommends **content, and flags the plumbing**, but builds nothing this round.
- Proposed slug scheme (for the future approved batch, pending the manifest decision): `/es/guia/<topic>/` (directory index) or `/es/<topic>` flat — decision belongs to the plumbing PR, not to copy.

## Recommended ES support pages (few, high-quality, owner-linked)

### ES-G1 — "¿Qué es un motor CG? Diferencias entre motor CG y motor CB" (P1, highest confidence)
- Target intent: informational / definitional + comparison.
- Supporting keywords: que es un motor cg, motor cg, diferencias motor cg y cb, motor cb vs cg, motor tipo cg, qué significa CG/CB.
- Commercial Owner it serves: `/es/motor-cg` (primary) and `/es/motor-cb` (secondary).
- Why a separate page: `que es un motor cg` reached ~Top 10 historically and the "CG vs CB" SERP is owned by YouTube/forums/AJ1moto, not a manufacturer — a clean explanatory page wins informational clicks the transactional owner page is not scoped to answer, then hands the buyer to the owner.
- Cannibalization risk: MEDIUM — it MUST NOT target `fabricante/proveedor/mayorista/precio`. Keep commercial CTAs as links to owners; owner pages keep the supplier terms.
- Required evidence (EVIDENCE_NEEDED): real CG and CB engine photos; a labeled cutaway or spec comparison (valve train: OHV "varillas" CG vs overhead-cam CB), which the approved ENGINE_SPEC already supports ("camshaft upward" CB note). No invented performance claims.
- Internal-link role: hub from `/es/news`; body links to `/es/motor-cg`, `/es/motor-cb`, `/es/repuestos-motor`, `/es/contacto`; owners get a "learn what a CG is" contextual link (added later, guarded — owners are page-1).

### ES-G2 — "Motor horizontal para motocicleta: qué es y dónde se usa" (P2)
- Target intent: informational, motorcycle-qualified.
- Supporting keywords: motor horizontal para motocicleta, motor de motocicleta horizontal, para qué sirve un motor horizontal, motor horizontal 110 125 150.
- Owner: `/es/motor-horizontal`.
- Why separate: helps disambiguate the `motores horizontales` intent (which is partly industrial/agricultural). Explains the motorcycle application, steering the ambiguous demand toward the right page.
- Cannibalization risk: LOW vs owner (different intent) but must NOT broaden into industrial/general-purpose (would create a wrong-intent page).
- Required evidence: horizontal engine + application photos (pit bike / light ATV / cargo tricycle per approved applications).
- Internal-link role: `/es/news` hub → guide → `/es/motor-horizontal`.

### ES-G3 (optional, later) — ES version of the procurement guide "Cómo elegir un fabricante de motores de motocicleta en China" (P2)
- Mirrors the existing EN guide; target `comprar motores al por mayor china / fabricante confiable`. Serves About/Contact + all owners. Only after G1/G2.

## Deliberately NOT recommended
- Per-cc pages (`/es/motor-cg-150`, `-200`, `-250`) — NO_ACTION; keep displacement variants on the owner page. (Sprawl + cannibalization.)
- "Cómo elegir un motor CG" as its own page (ES registry row) — fold into ES-G1 unless a later SERP split proves enough distinct demand.
- Any generic industrial "motores horizontales" page — NO_ACTION (wrong buyer; forbidden thin-clone pattern).
- A separate CG-vs-CB page distinct from ES-G1 — merge; one guide is enough (SERP shows the same intent cluster).

## Cadence ceiling
2–3 ES support pieces per month is the maximum; the current evidence supports **1 immediately (ES-G1), then ES-G2**, i.e. not a batch of many. If ES-G1 evidence (real comparison photos) can't be produced, ship only ES-G2 or NONE.

## Guardrails for the (future) build
- Never edit `/es/motor-cg` copy to insert links without a WHY_CHANGE / EXPECTED_GAIN / RANKING_RISK / ROLLBACK note (it is a pos 8–10 asset); prefer adding the link from the guide side and from `/es/news`.
- Reuse existing schema/breadcrumb conventions exactly; do not invent new Schema IDs.
- Foundation contracts (canonical/hreflang/sitemap/robots/H1/Owner) untouched except via the explicit exception PR.