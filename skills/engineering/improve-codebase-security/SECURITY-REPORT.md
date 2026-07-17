# Security Report Format

Render the review as one CDN-backed HTML file in the OS temp directory. Tailwind provides layout and Mermaid renders trust-boundary flows. Keep the content readable if either CDN fails: prose and evidence must remain in normal HTML, outside Mermaid diagrams.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Security review — {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "strict" });
    </script>
    <style>
      .boundary { stroke-dasharray: 5 5; }
      .attack { stroke: #dc2626; stroke-width: 2px; }
      .control { stroke: #059669; stroke-width: 3px; }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="coverage">...</section>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

Do not embed repository source, credentials, tokens, cookies, personal data, or raw malicious payloads in the report. Use minimal, redacted examples.

## Header and coverage

Show the repository name, review date, and declared scope. Follow it with a compact coverage table:

| Entry point | Status | Sinks traced | Note |
|---|---|---|---|
| `/webhooks/order` | Traced | signature parser, order write | — |
| image upload | Cleared | decoder, object storage | controls present |
| legacy CLI | Untraced | unknown | excluded: local-only |

List exclusions explicitly. Never label a scoped or sampled review as exhaustive.

## Candidate card

Each finding is an `<article>` with:

- **Title** — name the broken or missing control, not a vague category
- **Badge row** — severity or `Hygiene`, confidence, and weakness class
- **Files and lines** — monospaced links or paths
- **Boundary** — actor, asset, less-trusted side, more-trusted side
- **Before / After diagram** — side by side; the centerpiece
- **Evidence path** — compact source → controls → sink chain
- **Attack scenario** — input shape, prerequisites, path, impact
- **Control gap** — one sentence explaining why current enforcement fails
- **Fix** — one sentence placing the control at the trust boundary

Keep claims proportional to evidence. `Confirmed` means the path was demonstrated safely in an isolated environment; static source-to-sink reasoning is normally `Likely`; an incomplete path is `Speculative` or `Hygiene`.

## Diagram patterns

Every candidate gets a before/after visualization. Use Mermaid for graph-shaped flows and hand-built HTML/SVG when it communicates the control more clearly.

### Trust-boundary flow

Draw the actor and untrusted input on the left, a dashed trust boundary in the middle, and the sink or protected asset on the right. In **Before**, use a red path through the missing or bypassed control. In **After**, stop that path at one green control placed on the boundary.

```html
<div class="grid gap-4 md:grid-cols-2">
  <figure class="rounded-lg border border-red-200 bg-white p-4">
    <figcaption class="font-semibold">Before</figcaption>
    <pre class="mermaid">
      flowchart LR
        A[Untrusted actor] --> B[Route]
        B --> C[Privileged sink]
        classDef attack stroke:#dc2626,stroke-width:2px;
        class A,B,C attack
    </pre>
  </figure>
  <figure class="rounded-lg border border-emerald-200 bg-white p-4">
    <figcaption class="font-semibold">After</figcaption>
    <pre class="mermaid">
      flowchart LR
        A[Untrusted actor] --> B[Boundary control]
        B -->|accepted| C[Privileged sink]
        B -->|rejected| D[Safe failure]
        classDef control stroke:#059669,stroke-width:3px;
        class B control
    </pre>
  </figure>
</div>
```

### Authorization sequence

Use a Mermaid sequence diagram when identity, resource lookup, tenant context, and policy evaluation happen in the wrong order. The after diagram should show authorization before the protected action.

### Secret exposure path

Use hand-built boxes or a flowchart from secret source → build/runtime → log, error, or client artifact. Show redacted labels only; never include the secret value.

### Dependency reachability

Show application entry point → affected package function → vulnerable behavior. If the application cannot reach the affected function, present the advisory in the coverage or hygiene area rather than drawing an exploit path.

## Visual rules

- Use red only for attacker-controlled flows and failed controls.
- Use emerald for enforcement added at the trust boundary.
- Use amber for uncertainty and `Hygiene`, not confirmed vulnerabilities.
- Keep diagrams approximately 320px tall and readable without horizontal scrolling.
- Keep prose sparse, but never replace evidence with visual drama.
- Use escaped text nodes for repository-derived labels. Do not interpolate raw source or attacker input into HTML or Mermaid.

## Top recommendation

Render one larger card containing the candidate name and one sentence explaining the choice in terms of severity, confidence, boundary leverage, and regression-test cost. Link back to the candidate card.
