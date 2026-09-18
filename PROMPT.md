# ZORAEL & CO. — MASTER CLAUDE CODE BUILD PROMPT

You are the lead designer and senior frontend engineer for ZORAEL & CO.

First read:
1. CLAUDE.md
2. DESIGN-SYSTEM.md
3. PAGES.md
4. COMPONENTS.md
5. CONTENT.md
6. PWA.md

Treat them as the source of truth.

## Objective
Build a production-quality luxury fashion e-commerce website that feels editorial, timeless, refined, warm, modern and premium.

The visitor should naturally want to scroll and explore.

## Visual source of truth
Ivory `#F5F1E8`
Cream `#EDE6D8`
White `#FFFDF8`
Charcoal `#171613`
Black `#0D0D0B`
Gold `#B79A5A`
Muted gold `#9F8650`
Border `#D8CFBF`

## NEVER
- glassmorphism
- frosted glass
- neon
- loud gradients
- excessive gold
- generic SaaS/template styling
- excessive shadows
- bouncy/flashy animation
- unnecessary decorative elements
- fake social proof

## Navigation
Desktop: Shop / Search / About / Journal / Account / Bag
Mobile header: Menu / ZORAEL & CO. / Bag
Mobile bottom: Home / Shop / Search / Bag
Collections live inside Shop.

## Stack
Next.js + TypeScript + Tailwind + shadcn/ui + Base UI + Lucide + PWA.

## Build order
1. Inspect existing repository.
2. Preserve working setup.
3. Install only required dependencies.
4. Create design tokens and typography.
5. Global layout.
6. Header/navigation.
7. Mobile bottom nav.
8. Reusable components.
9. Homepage.
10. Shop.
11. Product detail.
12. Search.
13. Collections.
14. Bag.
15. Checkout shell.
16. Account shell.
17. About.
18. Journal.
19. PWA.
20. SEO/performance/accessibility.
21. Responsive polish.

Use Server Components by default. Use Client Components only when needed.

## Final check
Verify:
- routes
- navigation
- mobile/tablet/desktop
- Search prominence
- Collections inside Shop
- PWA
- safe areas
- accessibility
- SEO
- optimized images
- loading/error/empty states
- no glassmorphism
- restrained gold
- no console errors
- configured build/typecheck/lint

Do not stop at a generic skeleton. Build the actual visual experience.
