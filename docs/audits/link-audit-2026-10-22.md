# Broken link audit, 2026-10-22

Scope: all 163 root-level pages, English and Arabic (157 site pages plus the 6 tooling pages: index, frame, category, all-components, audit, start-here).

Checked:
- every `href`, `src`, `srcset`, `poster`, `data-src`, `data-src-m` and `data-bg`
- links to other pages
- `#anchors`, both on the same page and on the target page
- images, video, scripts and stylesheets
- all 590 unique external URLs, requested live

Commented-out markup and links built by JavaScript were not checked.

## Summary

| Check | Result |
|---|---|
| Missing files (images, video, CSS, JS) | **0** |
| Links to pages that do not exist | **167** (142 on site pages, 25 in the all-components gallery) |
| Broken in-page anchors | **5**, all in the all-components gallery |
| External links failing | **2 real** (1 dead domain, 1 old password-locked deploy); 7 rate-limited, not broken |
| Placeholder links (`href="#"`) | **9,847** on site pages: 5,743 header, 3,788 footer, 316 page body |

## 1. Links to pages that do not exist

| Missing target | Links | Where | Suggested fix |
|---|---|---|---|
| `personal-home-v3a.html` | 120 | The "Personal" tab in the site header, on almost every page | Point to the live Personal site (`https://www.emiratesnbd.com/en`), or build the page |
| `commodities.html` | 16 | Markets pages (markets, treasury, fx, rates, money markets, fixed income, equities; EN and AR), in the related-products links | No commodities page exists: build it, or link to `markets-v2.html` |
| `contact-us.html` | 3 | `investment-banking-v2.html:677`, `investment-banking-v2-ar.html:624`, all-components | `contact-us-v3.html` (AR: `contact-us-v3-ar.html`) |
| `corporate-institutional.html` | 2 | `contact-us-v3.html:896`, `contact-us-v3-ar.html:843` | Decide the target, probably `cib-home-final.html` |
| `businessonline-x-v1a.html` | 2 | `digital-solutions-v1a.html:570`, `digital-solutions-v1a-ar.html:524` | `businessonline-x-v2.html` (AR: `businessonline-x-v2-ar.html`) |
| `api-banking.html` | 9 | all-components gallery only (from a block) | Fix in the block: `api-banking-v1a.html` |
| `businessonline-x.html` | 1 | all-components gallery only | Fix in the block: `businessonline-x-v2.html` |
| `../*.html` (11 targets) | 14 | all-components gallery only | Header and footer blocks use `../` paths, which work from `blocks/` but break in the gallery page; tooling only |

## 2. Broken anchors

- **Gallery demo:** `all-components.html:186-190` (`#how`, `#benefits`, `#industries`, `#faq`, `#contact`). A demo nav points at sections the gallery does not contain. Tooling only.
- **Tombstones deep links (not broken):** `#ecm`, `#dcm`, `#agency`, `#loan-syndications` and `#corporate-finance` look broken on a static check, but they work. The tombstones page opens the matching tab from the URL (`data-tabs-hash`).

## 3. External links

| URL | Status | Where | Suggested fix |
|---|---|---|---|
| `https://smartbusiness.emiratesnbd.com/` | **Domain does not resolve** | `smarttrade-v1a.html:789, 1023`; `smarttrade-v1a-ar.html:712, 926` ("Raise a request on smartTRADE", "Log in to smartTRADE") | Get the current smartTRADE login URL from the product team |
| `https://ds-hu-9s249.ondigitalocean.app/cib-home-final.html` | **401, old password-locked deploy** | `cib-home-final.html:9-11` and `cib-home-final-ar.html:9-11` (canonical, Open Graph and alternate URLs in the page head) | Point to the real home page URL; search engines and link previews use these |
| 7 company logos on `upload.wikimedia.org` | 429 (rate limited during the check; they load normally) | all-components, from `blocks/logo-wall-marquee.html` | Not broken, but hotlinked: copy them into `assets/webxv2/images/` |
| `https://businessonline.emiratesnbd.com/` | 200, redirects to `businessonline2.emiratesnbd.com` | several pages | Works; optionally update to the new host |

The other 581 external URLs returned 200.

## 4. Placeholder links (`href="#"`)

These click through to nothing. Almost all come from the shared header and footer, so the fix is in those blocks, not on each page.

**Header (5,743):**
- **Segment tabs:** Priority, Private, Emirati, Business, Islamic, International, Premium, Innovation.
- **Top links:** About us, Customer Care, ATM & Branches.
- **Our Websites menu:** each sister site's English and Arabic links.
- **Menu items:** ESG, signONLINE, Economics, Markets, Forecasts and similar.

**Footer (3,788):**
- **Company links:** Careers, Community Engagement, Financial Results, Investor Relations, Modern Slavery Act.
- **Banking links:** Debt Assist, Ways of banking, Update your information, IBAN/Swift codes.
- **Legal links:** FATCA & CRS, Cookies Policy, Data Privacy Notice.
- **App and social:** app download banners and social icons.

**Page body (316, on 45 pages).** The biggest are:

| Page | Body placeholders |
|---|---|
| form-centre-v2 (EN and AR) | 80 each: the form download links |
| tutorials-platform-demos-v2 (EN and AR) | 20 each |
| support-businessonline-v2 (EN and AR) | 12 each |
| events-library | 9 |
| industry-specific-finance-v1a (EN and AR) | 8 each |
| article-example | 6 |
| payment-tracker-v1a, payments-trade-finance-v1a (EN and AR) | 4 each |
| get-app, media-library, trade-supply-chain-finance-v1a | 3 each |
| cib-home-final, our-expertise-partnerships (EN and AR) | 2 each |

Fixing the header and footer blocks clears about 97% of these. That needs the real destination URLs, most of which are on www.emiratesnbd.com.
