/* ─────────────────────────────────────────────────────────────────────────
   ds-tailwind-config.js — brand-token Tailwind config (part of the runtime)

   Load order in the page head:
     1) tailwind.cdn.js   (the JIT engine; creates the global `tailwind`)
     2) ds-tailwind-config.js   (this file; registers brand tokens)

   Maps the DS brand tokens onto Tailwind's theme so authored markup can use
   token-named utilities (bg-navy, text-blue, font-arabic) instead of raw
   arbitrary values (bg-[#072447]). Tailwind's default breakpoints already
   match the DS scale (md 768 / lg 1024 / xl 1280), so screens are untouched.
   ───────────────────────────────────────────────────────────────────────── */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans:   ['var(--font-sans)'],
        arabic: ['var(--font-arabic)'],
      },
      borderColor: {
        /* preflight default border-color must follow the theme, not
           Tailwind's gray-200 (which equals ENBD's border only by luck) */
        DEFAULT: 'var(--border)',
      },
      colors: {
        /* CSS variables, NOT literals — utilities like text-blue must follow
           the active brand theme (themes.css). None of the authored markup
           uses alpha modifiers (text-blue/50), so plain var() is safe. */
        navy:   'var(--navy)',
        blue:   'var(--blue)',
        mid:    'var(--mid)',
        light:  'var(--light)',
        hair:   'var(--border)',   /* hairline border */
        /* derived brand tier (ds.css :root) — themable like the base five */
        'navy-deep':   'var(--navy-deep)',
        'navy-shade':  'var(--navy-shade)',
        'navy-strong': 'var(--navy-strong)',
        'blue-strong': 'var(--blue-strong)',
        'blue-ink':    'var(--blue-ink)',
        'blue-deep':   'var(--blue-deep)',
        'blue-soft':   'var(--blue-soft)',
        'blue-pale':   'var(--blue-pale)',
        'blue-wash':   'var(--blue-wash)',
        steel:         'var(--steel)',
        'steel-soft':  'var(--steel-soft)',
      },
    },
  },
};
