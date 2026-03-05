# Wilds Aura — Design Brainstorm

## Approach 1: Dark Wilderness Brutalism
<response>
<text>
**Design Movement:** Neo-Brutalism meets Dark Wilderness

**Core Principles:**
- Raw, unpolished textures contrasted with sharp typography
- Asymmetric grid with deliberate tension
- Photography as the dominant visual element, UI as a frame

**Color Philosophy:** Near-black (#0d0d0d) base with forest-moss green (#3a6b35) as the only accent. The darkness evokes the depth of a forest at dusk — mysterious, alive, untamed.

**Layout Paradigm:** Offset masonry grid for gallery. Hero uses a full-bleed image with text anchored bottom-left. Navigation floats as a translucent strip.

**Signature Elements:**
- Thick green borders on hover states
- Grain/noise overlay on hero image
- Staggered photo cards with slight rotation

**Interaction Philosophy:** Hover reveals metadata (location, date, camera) via sliding text. Click opens full-screen lightbox.

**Animation:** Slow fade-in on scroll. Gallery cards lift on hover with a subtle shadow bloom.

**Typography System:** Playfair Display (display/headings) + DM Mono (metadata/captions). High contrast between serif and monospace.
</text>
<probability>0.08</probability>
</response>

## Approach 2: Organic Field Journal (SELECTED)
<response>
<text>
**Design Movement:** Editorial Nature Journal — dark, tactile, immersive

**Core Principles:**
- Deep charcoal backgrounds that let photography breathe
- Editorial hierarchy: large display type, small refined captions
- Organic flow — sections feel like turning pages of a field journal

**Color Philosophy:** Background: #0f1410 (near-black with green undertone). Accent: #4a7c59 (muted forest green). Text: #e8e4dc (warm off-white). The palette is drawn from the forest floor — dark soil, moss, and pale moonlight.

**Layout Paradigm:** Left-anchored hero text with full-width image backdrop. Gallery in a fluid asymmetric masonry. Navigation uses a minimal top bar with a logo mark.

**Signature Elements:**
- Thin horizontal rules (1px, green-tinted) as section dividers
- Category pills with outlined style, filled on active
- Subtle vignette on hero image

**Interaction Philosophy:** Gallery items reveal title/category on hover with a smooth overlay. Filter tabs animate with a sliding underline.

**Animation:** Entrance animations via framer-motion: hero text slides up, gallery items fade in staggered. Smooth scroll behavior.

**Typography System:** Cormorant Garamond (hero display) + Jost (body/UI). The serif brings gravitas; the geometric sans brings clarity.
</text>
<probability>0.09</probability>
</response>

## Approach 3: Cinematic Dark Minimal
<response>
<text>
**Design Movement:** Cinematic Minimalism — inspired by nature documentary title cards

**Core Principles:**
- Maximum negative space, minimal UI chrome
- Photography speaks; UI whispers
- Monochromatic with a single warm accent

**Color Philosophy:** Pure black (#080808) with amber-gold (#c8a96e) accent. Evokes the golden hour — the most prized moment for wildlife photographers.

**Layout Paradigm:** Single-column hero with centered type. Gallery uses a strict 3-column grid with uniform aspect ratios. Whitespace is aggressive.

**Signature Elements:**
- All-caps tracking for category labels
- Gold underline on active states
- Minimal hamburger nav that expands to full-screen overlay

**Interaction Philosophy:** Everything is deliberate and slow. Hover states are gentle. Transitions are long (400ms+).

**Animation:** Cinematic fade transitions. Parallax on hero image. Gallery items scale very slightly on hover.

**Typography System:** Bebas Neue (display) + Lato (body). The contrast between condensed display and humanist sans creates cinematic tension.
</text>
<probability>0.07</probability>
</response>

---

**Selected: Approach 2 — Organic Field Journal**

Dark editorial aesthetic with Cormorant Garamond + Jost typography, forest-floor color palette, and fluid asymmetric gallery layout.
