/* ═══════════════════════════════════════════════════════════════════════════
   THE COLOUR LAW — the single source of truth for the DS colour vocabulary
   ─────────────────────────────────────────────────────────────────────────
   THE LAW (2026-09-03, Hakan):
     Surfaces, inks and overlays are declared in MARKUP.
     CSS never adapts content by context.
     A different look on a different ground is a DIFFERENT MARKUP COMPOSITION.

   Responsibility for layout / surface / colour choices belongs to the AUTHOR;
   the library's job is that every vocabulary word renders exactly as declared.

   AMENDMENT (2026-09-04, Hakan, verbatim):
     "any eyebrow on media, any text-only link on media is white."
   Encoded in § 4b as a ROLE-OVERRIDE MAP over the one pairing table, reached
   through the single function inkForAtom(). It SUPERSEDES the narrower
   hero/opener phrasing shipped before it; solid dark grounds are unchanged.

   This file is the ONE place the vocabulary and the pairing rulebook live.
   Both consumers read it — there is no second copy:
     · scripts/verify.mjs  — the gate (closed vocabulary, no-new-indirection,
                             anti-context lint, block pairing conformance)
     · assets/js/library.js + frame.html — the gallery Surface control, which
                             RECOMPOSES the demo markup rather than relying on
                             CSS to adapt it.

   Loadable both ways on purpose: `module.exports` for node (the gate) and a
   `window.DSPalette` global for the browser (the gallery). No build step.
═══════════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.DSPalette = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ── 1 · THE PALETTE ────────────────────────────────────────────────────
     ONE palette, three prefixes. The palette WORD names a role-position; the
     prefix realises that position in its own medium — `surface-` as a ground,
     `ink-` as text, `ov-` as an overlay wash. For white / primary / accent /
     dark the three realisations are literally the same colour. For soft and
     mute they are the same POSITION read in two media: a ground one step of
     separation away from its extreme, an ink one step of hierarchy away from
     its extreme (see CONVENTIONS.md § The palette). An overlay is paint, so
     `ov-X` always carries the GROUND colour of word X.                    */
  var PALETTE = ['white', 'soft', 'mute', 'primary', 'primary-soft', 'accent', 'accent-soft', 'dark'];

  /* grounds: every palette word + the surface-only MODES */
  var GROUND_MODES = ['image', 'clear', 'glass', 'glass-25', 'glass-50', 'glass-75'];
  var SURFACES = PALETTE.concat(GROUND_MODES).map(function (w) { return 'surface-' + w; });

  /* inks: every palette word + `faint`, the 8th ink, for ornaments */
  var INKS = PALETTE.concat(['faint']).map(function (w) { return 'ink-' + w; });

  /* overlays: colour (a subset of the palette — the two -soft grounds are too
     pale to function as a wash), strength, paint */
  var OV_COLOURS = ['white', 'soft', 'mute', 'primary', 'accent', 'dark'];
  var OV_STRENGTHS = ['30', '40', '50', '60', '70', '75', '80', '90'];
  var OV_PAINTS = ['tint', 'scrim', 'gradient-b', 'gradient-t', 'gradient-l', 'gradient-r', 'radial', 'vignette'];
  var OVERLAYS = ['ov']
    .concat(OV_COLOURS.map(function (w) { return 'ov-' + w; }))
    .concat(OV_STRENGTHS.map(function (n) { return 'ov-' + n; }))
    .concat(OV_PAINTS.map(function (p) { return 'ov-' + p; }));

  /* ── 2 · DEPRECATED SPELLINGS ───────────────────────────────────────────
     Kept alive as inert aliases so an older snippet still renders; every
     first-party file must migrate. The gate WARNs on each occurrence.

     END OF LIFE (written 2026-09-03, estate audit canon gap C-2). This table
     used to say only that the aliases exist "so an older snippet still
     renders", and never said when they die — so nothing could decide whether
     the estate sweep should end with them deleted. The policy:

       STAGE 1 (now, and the state this sweep leaves behind) — every alias is
       INERT and WARNED. Inert means pinned to its old LIGHT-ground value: it
       does not flip, so a page still carrying one looks the same as before
       the migration but is provably not participating in the palette. The
       gate WARNs per page (flow 8e). First-party count after the estate
       sweep: ZERO — pages, blocks and the gallery all speak the palette.

       STAGE 2 — with the estate at zero, the WARN becomes a FAIL. Nothing
       first-party can regress, and a stray old class fails LOUDLY at the gate
       instead of rendering plausibly. This is a gate change only; no paint
       moves. It is the correct next step and needs no new information.

       STAGE 3 — the alias DEFINITIONS come out of ds.css, at which point an
       old spelling paints nothing. That is the irreversible one: the CMS and
       any third-party snippet outside this repo are not covered by our gate,
       so stage 3 is a deliberate, announced cadence with Hakan's go — not a
       consequence of the estate reaching zero. Until then the aliases stay
       defined and this table stays the record of what each one becomes.     */
  var DEPRECATED = {
    /* grounds renamed by the palette */
    'surface-grey': 'surface-soft',
    'surface-grey-2': 'surface-mute',
    'surface-navy': 'surface-primary',
    'surface-blue': 'surface-accent',
    /* overlays renamed by the palette */
    'ov-black': 'ov-dark',
    'ov-blue': 'ov-accent',
    /* the type-… and text-… spellings lose their COLOUR duty entirely —
       type-… keeps only size, weight and spacing */
    'type-navy': 'ink-primary',
    'text-navy': 'ink-primary',
    'type-blue': 'ink-accent',
    'text-blue': 'ink-accent',
    'type-blue-soft': 'ink-accent-soft',
    'text-blue-pale': 'ink-accent-soft',
    'type-white': 'ink-white',
    'type-mid': 'ink-mute',
    'type-muted': 'ink-soft',   /* it already painted #D7DEE6 */
    /* the relative-ink layer is gone — ink is declared, never resolved */
    'on-surface': 'ink-primary (or ink-white on a dark ground)',
    'on-surface-mid': 'ink-mute (or ink-soft on a dark ground)',
    'on-surface-faint': 'ink-mute (it was INERT on light) / ink-faint for true ornaments',
    'on-surface-border': 'border-ink (or nothing — component hairlines derive from currentColor)',
    'on-light': 'declare the island\'s own surface class'
  };

  /* ── 3 · GROUND KINDS ───────────────────────────────────────────────────
     What a ground DOES to the pairing, categorically. Strength never matters:
     surface-glass-75 pairs exactly like surface-primary.                   */
  var GROUND_KIND = {
    'surface-white': 'light',
    'surface-soft': 'light',
    'surface-mute': 'light',
    'surface-primary-soft': 'light',
    'surface-accent-soft': 'light',
    'surface-primary': 'dark',
    'surface-dark': 'dark',
    'surface-glass': 'dark',
    'surface-glass-25': 'dark',
    'surface-glass-50': 'dark',
    'surface-glass-75': 'dark',
    'surface-accent': 'accent',
    'surface-image': 'media',
    'surface-clear': 'clear'
  };

  /* ── 4 · THE PAIRING RULEBOOK ───────────────────────────────────────────
     role × ground-kind → the ONE legal ink. Categorical. Strength never
     matters. `accent` is `dark` with one exception: an accent-ROLE element on
     the accent ground goes white (blue on blue is not a hierarchy).        */
  var ROLES = ['primary', 'secondary', 'accent', 'ornament'];
  var PAIRING = {
    light: { primary: 'ink-primary', secondary: 'ink-mute', accent: 'ink-accent', ornament: 'ink-soft' },
    dark: { primary: 'ink-white', secondary: 'ink-soft', accent: 'ink-accent-soft', ornament: 'ink-mute' },
    accent: { primary: 'ink-white', secondary: 'ink-soft', accent: 'ink-white', ornament: 'ink-mute' }
  };
  /* The four PAIRING inks are what each role MUST take. Three more inks are
     legal on a ground without being any role's default, so the vocabulary has
     somewhere to live: `ink-faint` is the ornament escape hatch on either
     side, `ink-dark` is near-black copy on a light ground, `ink-primary-soft`
     is the primary hue read as an accent on a dark one. Anything outside a
     ground's set is a pairing violation, whatever its strength. */
  var ALLOWED_INKS = {
    light: ['ink-primary', 'ink-mute', 'ink-accent', 'ink-soft', 'ink-dark', 'ink-faint'],
    dark: ['ink-white', 'ink-soft', 'ink-accent-soft', 'ink-mute', 'ink-primary-soft', 'ink-faint'],
    accent: ['ink-white', 'ink-soft', 'ink-mute', 'ink-accent-soft', 'ink-primary-soft', 'ink-faint']
  };

  /* ── 4b · ATOM ROLES + THE MEDIA EXCEPTION ──────────────────────────────
     THE RULING (2026-09-04, Hakan, verbatim):
       "any eyebrow on media, any text-only link on media is white."
     It SUPERSEDES the narrower hero/opener phrasing that shipped before it.

     WHY THIS IS AN OVERRIDE AND NOT A FOURTH PAIRING ROW. `media` is already
     a ground KIND (GROUND_KIND['surface-image'] === 'media'), but it is a kind
     that RESOLVES: kindOf() reads it through the overlay's colour, so an
     ov-primary hero pairs exactly like surface-primary and the four generic
     roles need no media row at all. What the ruling adds is narrower than a
     row and wider than a hero: two named ATOMS lose their accent family the
     moment the ground's paint is a photo, whatever the wash resolves to.
     Encoding that as a fourth PAIRING row would have forced a duplicate of
     every role AND thrown away the ov-direction resolution. So the pairing
     table stays the one categorical role×kind table it was, and this is a
     ROLE-OVERRIDE MAP hanging off it, consulted by ONE function — inkForAtom()
     — which both consumers call. There is still exactly one table to read.

     OFF media these two atoms are ACCENT-role elements and always were: an
     eyebrow is ink-accent on light and ink-accent-soft on dark (the estate
     agrees — 313 and 110 instances respectively), and .btn-text paints
     var(--blue). ATOM_BASE_ROLE is therefore not a new axis, it is the row
     of PAIRING these atoms have always read.

     SOLID DARK IS UNCHANGED: ink-accent-soft stays legal there (the ruling
     says so explicitly), and the standing hero-eyebrow-white ruling also
     stays legal there because ALLOWED_INKS.dark admits ink-white. Recomposing
     OFF media restores the accent family — that is the ruling's own wording
     ("back off media restores accent family"), so a hero recomposed from
     surface-image onto surface-primary lands on ink-accent-soft; a white hero
     eyebrow on solid navy remains a legal composition an author may declare,
     it is simply not what a generic recompose writes.

     EDGE, DOCUMENTED NOT INVENTED: a LIGHT-family wash over media (ov-white /
     ov-soft / ov-mute) would put white on white. The estate has ZERO of them
     (all 389 media grounds carry ov-primary, ov-dark or a bare .ov), so the
     ruling is applied as written rather than second-guessed with an exception
     nobody asked for. If a light wash over media is ever authored, that is the
     moment to take the case back to Hakan.

     THE CLASS SET — derived from CONVENTIONS, not guessed:
       eyebrow    · .ds-eyebrow — the standardized eyebrow atom (ds.css:862).
       text-link  · .btn-text  — CONVENTIONS § THE BUTTON MODEL names it "the
                    quiet text button + optional arrow", and § atoms calls
                    hand-rolling "a new text+arrow link" drift, so it is THE
                    text-only link of the system.
                  · .be-link   — the one hand-rolled survivor that is genuinely
                    a text-only link (a span of copy + an arrow inside a bento
                    tile) and genuinely sits on media: 22 instances, all of
                    them on surface-image.
     DELIBERATELY EXCLUDED: .art-c-link is not a text link — it is the whole
     clickable CARD (ds.css:4857 paints it background/border/radius/shadow).
     .bc-link (breadcrumb), .sn-link (subnav tab), .fo1-link (footer nav) and
     .ds-skip-link are navigation chrome, not the in-content "go deeper"
     affordance, and none of them occurs on a media ground.                 */
  var ATOM_ROLE = {
    'ds-eyebrow': 'eyebrow',
    'btn-text': 'text-link',
    'be-link': 'text-link'
  };
  /* which PAIRING role each atom reads when the ground is NOT media */
  var ATOM_BASE_ROLE = { 'eyebrow': 'accent', 'text-link': 'accent' };
  /* the override: on a media ground these atoms ignore the resolved family */
  var MEDIA_ROLE_INK = { 'eyebrow': 'ink-white', 'text-link': 'ink-white' };

  /* media resolves through the OVERLAY'S COLOUR (the declared intent), not
     through its strength: a light-family overlay reads as a light ground. */
  var OV_GROUND_KIND = {
    'ov-dark': 'dark', 'ov-primary': 'dark', 'ov-accent': 'accent',
    'ov-white': 'light', 'ov-soft': 'light', 'ov-mute': 'light'
  };
  var OV_DEFAULT_KIND = 'dark';   /* a bare .ov paints brand primary */

  /* ── 5 · ROLE INFERENCE ─────────────────────────────────────────────────
     Which role a class expresses. Used to migrate today's markup and to lint
     tomorrow's: the ink an element carries must be PAIRING[kind][role].    */
  var ROLE_OF_INK = {
    'ink-primary': 'primary', 'ink-white': 'primary', 'ink-dark': 'primary',
    'ink-mute': null,  /* mute is secondary on light, ornament on dark */
    'ink-soft': null,  /* soft is ornament on light, secondary on dark */
    'ink-accent': 'accent', 'ink-accent-soft': 'accent', 'ink-primary-soft': 'accent',
    'ink-faint': 'ornament'
  };
  /* the legacy classes, by the role their author meant */
  var ROLE_OF_LEGACY = {
    'on-surface': 'primary', 'type-navy': 'primary', 'text-navy': 'primary', 'type-white': 'primary',
    'on-surface-mid': 'secondary', 'type-mid': 'secondary', 'type-muted': 'secondary',
    'on-surface-faint': 'ornament',
    'type-blue': 'accent', 'text-blue': 'accent', 'type-blue-soft': 'accent', 'text-blue-pale': 'accent'
  };

  /* ── 6 · HELPERS ────────────────────────────────────────────────────────*/
  var SURFACE_SET = toSet(SURFACES), INK_SET = toSet(INKS), OV_SET = toSet(OVERLAYS);
  function toSet(a) { var s = Object.create(null); a.forEach(function (x) { s[x] = true; }); return s; }

  function isSurface(c) { return !!SURFACE_SET[c]; }
  function isInk(c) { return !!INK_SET[c]; }
  function isOverlay(c) { return !!OV_SET[c]; }

  /* Does this class LOOK like vocabulary (so the closed-vocabulary gate owns
     it) without BEING vocabulary? `surface-x`, `ink-y`, `ov-z`.
     Deliberately narrow: only the three reserved prefixes. */
  var RESERVED = /^(surface|ink|ov)-[a-z0-9-]+$/;
  function isReservedName(c) { return RESERVED.test(c) || c === 'ov'; }
  function inVocabulary(c) { return isSurface(c) || isInk(c) || isOverlay(c); }

  /* the ink a role must take on a ground */
  function inkFor(groundKind, role) {
    var t = PAIRING[groundKind] || PAIRING.light;
    return t[role] || t.primary;
  }

  /* ── the media exception, as three small pure functions ─────────────────
     inkForAtom() is the ONE entry point. The gate calls it to decide what an
     eyebrow / text-link must be carrying; recompose() calls it to write that
     ink when the ground changes. Neither restates the rule.               */
  function isMediaGround(ground) { return GROUND_KIND[ground] === 'media'; }
  /* the atom role a class list expresses, or null for ordinary copy */
  function atomRoleOf(classes) {
    for (var i = 0; i < classes.length; i++) if (ATOM_ROLE[classes[i]]) return ATOM_ROLE[classes[i]];
    return null;
  }
  /* the ONE legal ink for an atom role on a ground (media overrides family) */
  function inkForAtom(ground, ovColour, atomRole) {
    if (isMediaGround(ground) && MEDIA_ROLE_INK[atomRole]) return MEDIA_ROLE_INK[atomRole];
    return inkFor(kindOf(ground, ovColour), ATOM_BASE_ROLE[atomRole] || 'accent');
  }

  /* the ground kind of a resolved ground token, media resolved by overlay */
  function kindOf(ground, ovColour) {
    var k = GROUND_KIND[ground];
    if (k === 'media') return OV_GROUND_KIND[ovColour] || OV_DEFAULT_KIND;
    if (!k) return 'light';
    return k;
  }

  /* Remap ONE ink for a new ground: read its role on the old ground, then
     write the ink that role takes on the new one. This is the whole gallery
     Surface control — a pure function, no CSS involved. */
  function remapInk(ink, fromKind, toKind) {
    var role = roleOfInkOn(ink, fromKind);
    if (!role) return ink;
    return inkFor(toKind, role);
  }

  /* An ink's role is unambiguous once you know its ground: mute means
     "secondary" on light and "ornament" on dark, and soft is its mirror. */
  function roleOfInkOn(ink, kind) {
    var table = PAIRING[kind] || PAIRING.light;
    for (var i = 0; i < ROLES.length; i++) if (table[ROLES[i]] === ink) return ROLES[i];
    return ROLE_OF_INK[ink] || null;
  }

  /* Overlays are directional in COLOUR too: recomposing onto a light ground
     flips a dark wash to the light one, so declared intent survives. */
  var OV_REMAP_TO_LIGHT = { 'ov-dark': 'ov-white', 'ov-primary': 'ov-white', 'ov-accent': 'ov-white' };
  var OV_REMAP_TO_DARK = { 'ov-white': 'ov-primary', 'ov-soft': 'ov-primary', 'ov-mute': 'ov-primary' };
  function remapOverlay(ovColour, toKind) {
    if (toKind === 'light') return OV_REMAP_TO_LIGHT[ovColour] || ovColour;
    return OV_REMAP_TO_DARK[ovColour] || ovColour;
  }

  /* ── 7 · RECOMPOSITION — the gallery's Surface control ──────────────────
     "Switching a surface option should simply show a DIFFERENT MARKUP
      COMPOSITION." (Hakan, 2026-09-03)

     The rulebook is categorical, so recomposing is a PURE FUNCTION of the
     markup and the chosen ground: swap the ground word, recolour the washes
     that belong to it, and remap every ink whose ground IS that root. No CSS
     is involved and nothing adapts by context — the harness rewrites the
     composition exactly as an author would, which is why the same function
     feeds "Copy HTML": what you copy is what you see.

     DOM-only; the gate never calls these.                                  */

  function surfaceOn(el) {
    var cls = el.classList || [];
    for (var i = 0; i < cls.length; i++) {
      var c = cls[i];
      if (isSurface(c)) return c;
      var d = DEPRECATED[c];
      if (d && d.indexOf('surface-') === 0) return d;
    }
    return null;
  }
  /* the ground an element stands on, searching no further than `root` */
  function groundHost(el, root) {
    for (var n = el; n; n = n.parentElement) {
      var s = surfaceOn(n);
      if (s && s !== 'surface-clear') return n;
      if (n === root) break;
    }
    return root;
  }
  function ovColourOn(el) {
    var cls = el.classList || [];
    for (var i = 0; i < cls.length; i++) {
      var c = cls[i], k = DEPRECATED[c] || c;
      if (OV_GROUND_KIND[k]) return k;
    }
    return null;
  }
  /* the washes that belong to THIS ground (not to a nested one) */
  function ownedOverlays(root) {
    var out = [];
    var all = root.querySelectorAll ? root.querySelectorAll('.ov') : [];
    for (var i = 0; i < all.length; i++) if (groundHost(all[i].parentElement || root, root) === root) out.push(all[i]);
    return out;
  }
  function firstOvColour(root) {
    var ovs = ownedOverlays(root);
    for (var i = 0; i < ovs.length; i++) { var c = ovColourOn(ovs[i]); if (c) return c; }
    return null;
  }

  function recompose(root, toSurface) {
    if (!root || !root.classList) return root;
    var fromGround = surfaceOn(root) || 'surface-white';
    var fromKind = kindOf(fromGround, firstOvColour(root));

    /* 1 · the ground word */
    var drop = SURFACES.concat(Object.keys(DEPRECATED).filter(function (k) { return k.indexOf('surface-') === 0; }));
    drop.forEach(function (c) { root.classList.remove(c); });
    if (toSurface) root.classList.add(toSurface);
    var to = toSurface || 'surface-white';

    /* 2 · the washes this ground owns — a wash is directional, so a dark one
           becomes the light one when the ground turns light, and back */
    var provisional = GROUND_KIND[to] === 'media' ? OV_DEFAULT_KIND : (GROUND_KIND[to] || 'light');
    ownedOverlays(root).forEach(function (ov) {
      var c = ovColourOn(ov) || 'ov-primary';
      var next = remapOverlay(c, provisional === 'light' ? 'light' : 'dark');
      if (next === c) return;
      ov.classList.remove(c);
      Object.keys(DEPRECATED).forEach(function (k) { if (DEPRECATED[k] === c) ov.classList.remove(k); });
      ov.classList.add(next);
    });
    var toOv = firstOvColour(root);
    var toKind = kindOf(to, toOv);

    /* 3 · every ink whose ground IS this root.
       The guard is NOT just `fromKind !== toKind` any more: surface-primary
       and an ov-primary surface-image are BOTH kind `dark`, yet an eyebrow
       must move accent-soft → white across that flip and back. Crossing the
       media boundary is a change even when the resolved family is not. */
    var mediaFlip = isMediaGround(fromGround) !== isMediaGround(to);
    if ((fromKind !== toKind || mediaFlip) && root.querySelectorAll) {
      /* atom-role elements are collected whether or not they carry an ink —
         on media they MUST end up ink-white, so an un-inked one is written */
      var sel = INKS.map(function (i) { return '.' + i; })
        .concat(Object.keys(ATOM_ROLE).map(function (c) { return '.' + c; })).join(',');
      var inked = root.querySelectorAll(sel);
      for (var i = 0; i < inked.length; i++) {
        var el = inked[i];
        var own = surfaceOn(el);
        if (own && own !== 'surface-clear') continue;      // clear resolves THROUGH — its inks belong to this ground (Hakan, 2026-09-03)
        if (groundHost(el.parentElement || root, root) !== root) continue;
        var classes = [];
        for (var k = 0; k < el.classList.length; k++) classes.push(el.classList[k]);
        var atom = atomRoleOf(classes);
        if (atom) {
          /* the ruling: one legal ink, so drop whatever is there and declare it */
          var want = inkForAtom(to, toOv, atom);
          INKS.forEach(function (ink) { if (ink !== want) el.classList.remove(ink); });
          el.classList.add(want);
          continue;
        }
        for (var j = 0; j < INKS.length; j++) {
          var ink2 = INKS[j];
          if (!el.classList.contains(ink2)) continue;
          var next = remapInk(ink2, fromKind, toKind);
          if (next !== ink2) { el.classList.remove(ink2); el.classList.add(next); }
        }
      }
    }
    return root;
  }

  /* Recompose a block's SOURCE html (what "Copy HTML" hands the author) so
     the copied markup is the composition on screen, not the file on disk. */
  function recomposeHTML(html, toSurface) {
    if (typeof document === 'undefined') return html;
    var lead = /^\s*(?:<!--[\s\S]*?-->\s*)*/.exec(html)[0];
    var host = document.createElement('div');
    host.innerHTML = html.slice(lead.length);
    var cmp = host.querySelector('.cmp');
    if (!cmp) return html;
    recompose(cmp, toSurface);
    return lead + host.innerHTML;
  }

  return {
    PALETTE: PALETTE, SURFACES: SURFACES, INKS: INKS, OVERLAYS: OVERLAYS,
    surfaceOn: surfaceOn, recompose: recompose, recomposeHTML: recomposeHTML,
    GROUND_MODES: GROUND_MODES, OV_COLOURS: OV_COLOURS, OV_STRENGTHS: OV_STRENGTHS, OV_PAINTS: OV_PAINTS,
    DEPRECATED: DEPRECATED, GROUND_KIND: GROUND_KIND, PAIRING: PAIRING, ROLES: ROLES,
    ALLOWED_INKS: ALLOWED_INKS,
    ATOM_ROLE: ATOM_ROLE, ATOM_BASE_ROLE: ATOM_BASE_ROLE, MEDIA_ROLE_INK: MEDIA_ROLE_INK,
    isMediaGround: isMediaGround, atomRoleOf: atomRoleOf, inkForAtom: inkForAtom,
    OV_GROUND_KIND: OV_GROUND_KIND, OV_DEFAULT_KIND: OV_DEFAULT_KIND,
    ROLE_OF_INK: ROLE_OF_INK, ROLE_OF_LEGACY: ROLE_OF_LEGACY,
    isSurface: isSurface, isInk: isInk, isOverlay: isOverlay,
    isReservedName: isReservedName, inVocabulary: inVocabulary,
    inkFor: inkFor, kindOf: kindOf, remapInk: remapInk, roleOfInkOn: roleOfInkOn,
    remapOverlay: remapOverlay
  };
}));
