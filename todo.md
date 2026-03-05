# Wilds Aura — Project TODO

## Core Setup
- [x] Full-stack upgrade (database, server, user auth)
- [x] Database schema: posts, likes, comments tables
- [x] DB push (migrations applied)
- [x] tRPC routers: posts, visitor, admin

## Design & Assets
- [x] Dark nature theme (CSS tokens, OKLCH colors)
- [x] Google Fonts: Playfair Display, Inter, Montserrat
- [x] Hero background image (AI generated)
- [x] WA logo (AI generated)
- [x] Gallery grid (masonry columns)

## Public Frontend
- [x] Navbar with logo, social links (FB, IG, YouTube)
- [x] Hero section with background, tagline, CTA
- [x] Category filter tabs (All, Wildlife, Landscape, Street)
- [x] Photo/Video gallery grid
- [x] Post cards with like, comment, share, download buttons
- [x] Post modal with full view, comments, actions
- [x] Footer with social links

## Visitor Features
- [x] Like / unlike posts (anonymous via sessionId or logged-in)
- [x] Comment on posts (guest name or logged-in user)
- [x] Share post (Web Share API or clipboard copy)
- [x] Download photo with watermark (Canvas API, "© Wilds Aura")

## Admin Panel (/admin)
- [x] Login guard (redirect to login if not authenticated)
- [x] Role guard (only admin role can access)
- [x] Upload photo post (drag & drop, title, caption, category, location)
- [x] Add YouTube video post (URL + title + caption + category + location)
- [x] Edit post (title, caption, category, location, YouTube URL)
- [x] Delete post (with confirmation)
- [x] Toggle publish/unpublish post
- [x] Post list with thumbnails

## Tests
- [x] auth.me tests (public and admin)
- [x] admin.listPosts FORBIDDEN for non-admin
- [x] auth.logout clears cookie

## Routing
- [x] / → Home (gallery)
- [x] /post/:id → Post detail page
- [x] /admin → Admin panel

## Updates
- [x] Replace AI logo with user's actual Wildsaura Photography golden logo
- [x] Fix admin panel access — make admin button visible and accessible
