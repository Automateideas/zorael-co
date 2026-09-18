# ZORAEL & CO. — MASTER CLAUDE CODE INSTRUCTIONS

You are building the production website for **ZORAEL & CO.**, a premium international luxury fashion house.

Read and follow these files as the project source of truth:
- DESIGN-SYSTEM.md
- PAGES.md
- COMPONENTS.md
- CONTENT.md
- PWA.md
- PROMPT.md

## Non-negotiable
Never use:
- glassmorphism / frosted glass
- neon colors
- loud gradients
- excessive gold
- heavy shadows
- generic SaaS styling
- flashy/bouncy animation
- clutter
- random colors
- excessive rounded cards

**LESS GOLD = MORE LUXURY.**

Use solid/opaque surfaces. Pills/capsules are mainly for buttons, filters, tags and compact controls.

## Brand
ZORAEL & CO. must feel:
- refined
- elegant
- editorial
- quiet luxury
- timeless
- premium
- modern
- international

Make the site feel expensive through typography, whitespace, photography, hierarchy and restraint.

## Colors
```css
--zorael-ivory: #F5F1E8;
--zorael-cream: #EDE6D8;
--zorael-white: #FFFDF8;
--zorael-charcoal: #171613;
--zorael-black: #0D0D0B;
--zorael-gold: #B79A5A;
--zorael-muted-gold: #9F8650;
--zorael-border: #D8CFBF;
```

Ivory = primary background. Charcoal = primary text/UI. Gold = restrained accent only.

## Stack
Use:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Base UI
- Lucide icons
- PWA support

Use App Router. Server Components by default. Client Components only when interaction/browser APIs require them.

## Navigation
Desktop: Shop / Search / About / Journal / Account / Bag

Mobile header: Menu / ZORAEL & CO. / Bag

Mobile bottom navigation: **Home / Shop / Search / Bag**

Collections are inside Shop, not bottom navigation.

## Shop
Categories:
- All
- Clothes
- Jewelry
- Hand Bags
- Collections

## Typography
Editorial headings: Instrument Serif, Cormorant Garamond or Playfair Display.
UI/body: Inter, Geist or Manrope.
Use one consistent serif + sans pairing.

## Imagery
Use editorial fashion, premium product, jewelry close-ups and handbag photography.
Preferred ratios:
- products: ~4:5
- editorial: ~3:4
- hero: 16:9/cinematic
- mobile hero: ~4:5

## Animation
Subtle fade/slide/reveal/gentle scale only. Usually 300–700ms. Respect prefers-reduced-motion.

## Pages
Required:
- /
- /shop
- /shop/[slug]
- /search
- /collections/[slug]
- /about
- /journal
- /journal/[slug]
- /bag
- /checkout
- /account

## Homepage
Hero → Featured Categories → New Collection → Editorial Banner → Jewelry Feature → Hand Bag Feature → Brand Story → Newsletter → Footer.

## Quality
Prioritize:
- accessibility
- SEO
- responsive design
- image optimization
- performance
- reusable components
- semantic HTML
- strong typing
- secure server-side handling
- loading/error/empty states

Use Next/Image. Avoid unnecessary dependencies and client JavaScript.

## PWA
The same Next.js app is the PWA. Implement manifest, icons, theme/background colors, standalone display, service worker, offline fallback, installability and mobile safe areas.

PWA theme: `#171613`
PWA background: `#F5F1E8`

Do not aggressively cache private account/checkout/payment data.

## Development behavior
Before a feature:
1. Read the relevant supporting file.
2. Inspect existing code/components.
3. Reuse tokens/components.
4. Implement cleanly.
5. Test mobile/tablet/desktop.
6. Check accessibility and visual consistency.

Do not rewrite unrelated working code.

## Golden rule
When choosing between decoration and restraint, choose restraint.
When choosing between more UI and whitespace, choose whitespace.
When choosing between trend and timelessness, choose timelessness.

**ZORAEL & CO. should feel expensive without trying to prove that it is expensive.**
