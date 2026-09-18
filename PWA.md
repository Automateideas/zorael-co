# ZORAEL & CO. — PWA SPECIFICATION

The website and PWA are the same application. No separate mobile codebase.

## Required
- Web App Manifest
- icons
- theme/background colors
- standalone display
- service worker
- installability
- offline fallback
- safe-area support
- responsive behavior

## Manifest
Name: ZORAEL & CO.
Theme: `#171613`
Background: `#F5F1E8`
Display: `standalone`
Orientation: `portrait`

Provide 192x192 and 512x512 icons and maskable support where appropriate.

## Offline
Create an elegant Zorael offline page with a retry action.
Never show a generic browser error.

## Safe areas
For fixed mobile UI use:
`env(safe-area-inset-top)`
`env(safe-area-inset-bottom)`

Bottom navigation must not overlap the home indicator.

## Caching
Cache application shell/static assets/offline fallback carefully.
Do not insecurely cache private account, checkout or payment data.

## Install
Support installation when browser/platform requirements allow it. Avoid annoying repeated install prompts.

## Performance
PWA must not slow the site. Optimize images, fonts, JS and caching.
