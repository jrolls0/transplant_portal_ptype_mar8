# UI redesign operating rules

This project already has a prototype. The goal is to improve weak or generic UI, not to produce a default AI-generated dashboard.

## When working on UI
1. First inspect the current screen(s), nearby files, component patterns, and screenshots.
2. Before coding, generate exactly 3 distinct visual directions.
3. For each direction, define:
   - visual philosophy
   - typography
   - spacing / density
   - color usage
   - component language
   - interaction style
   - why it fits this product and user
4. Prefer strong hierarchy, deliberate typography, realistic content, and clear workflows.
5. Reuse existing components/tokens where possible. If needed, create a small reusable primitive rather than ad hoc styling.
6. Avoid generic AI-SaaS patterns:
   - default card-grid dashboards
   - giant decorative gradients
   - meaningless KPI cards
   - vague placeholder copy
   - default Tailwind/shadcn look
   - excessive borders, badges, shadows, and rounded corners
7. Use realistic product copy and believable example data.
8. After implementing, perform a visual self-critique:
   - what still looks generic?
   - what feels noisy or flat?
   - what spacing, hierarchy, or responsiveness problems remain?
9. Fix those issues before stopping.
10. Keep changes scoped and explain how to verify locally.

## Preferred collaboration style
- Be opinionated.
- Do the design thinking work instead of asking me to provide visual ideas.
- If constraints are unclear, infer the most plausible product-grade direction from the repo and existing UI.