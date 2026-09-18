# ZORAEL & CO. — COMPONENT ARCHITECTURE

## Global
Header, DesktopNav, MobileHeader, MobileBottomNav, Footer, Logo, Container.

## Navigation
ShopMenu, SearchTrigger, AccountTrigger, BagTrigger.

## Buttons
Button, PillButton, TextButton, IconButton.

## Product
ProductCard, ProductGrid, ProductGallery, ProductInfo, ProductPrice, VariantSelector, SizeSelector, QuantityControl, AddToBagButton, RelatedProducts.

## Shop
ShopHeader, ShopFilters, FilterPill, SortControl.

## Search
SearchInput, SearchOverlay, SearchResults, SearchSuggestion, SearchEmptyState.

## Collections
CollectionCard, CollectionHero, CollectionGrid.

## Editorial
HeroSection, EditorialSection, EditorialBanner, BrandStory, FeatureSection.

## Commerce
CartDrawer, CartItem, CartSummary, CheckoutForm, OrderSummary.

## Content
JournalCard, JournalGrid, Newsletter, Breadcrumbs.

## States
LoadingState, ErrorState, EmptyState, Skeleton.

## Rules
1. One clear responsibility per component.
2. Reuse instead of duplicate.
3. Strongly typed props.
4. Keep business logic out of purely visual components.
5. Avoid giant components.
6. Avoid unnecessary Client Components.
7. Semantic HTML and accessibility.
8. Follow DESIGN-SYSTEM.md.

Use shadcn/ui + Base UI and Lucide. Do not add another component library without a clear reason.

Mobile bottom navigation is exactly:
Home / Shop / Search / Bag

Desktop navigation is:
Shop / Search / About / Journal / Account / Bag
