# Arabic translation brief: Emirates NBD Wholesale Banking site

You are translating UI and marketing strings for the Arabic (RTL) edition of the
Emirates NBD Wholesale Banking website (the business formerly called Corporate & Institutional Banking). Audience: CFOs,
treasurers, finance teams and institutional investors in the UAE and GCC.

## Input / output

- Input: a JSON array of `{"id", "page", "en"}`. `page` is just context.
- Output: a JSON object `{"<id>": "<arabic>"}` covering EVERY id in your chunk.
- Write output in parts of about 120 entries each, to files
  `out/chunkNN_partK.json` (NN = your chunk number, K = 1, 2, 3...). Each part must
  be valid JSON (use the Write tool; no trailing commas; escape `"` inside strings as `\"`).
- When done, run the validator: `python3 validate.py NN` (from this tools folder).
  Fix every problem it reports and re-run until it prints `OK`.

## Placeholders (critical)

Strings may contain inline-tag placeholders: `<1>`, `</1>`, `<3/>`. They stand for
links, bold, spans, line breaks or icons. Rules:
- Keep EVERY placeholder exactly as written, the same count, none added, none removed.
- You may move them to fit Arabic word order, but keep pairs wrapped around the
  equivalent words (`<1>Learn more</1>` -> `<1>اعرف المزيد</1>`).
- Self-closing ones like `<3/>` (icons, `<br>`) usually stay in the same relative spot.
- Never translate or alter anything inside the angle brackets.

## Voice

- Modern Standard Arabic, formal, confident, concise. Premium corporate bank, not
  government-form stiff. Headlines short and punchy; keep the rhetorical rhythm
  ("Seamless, secure, intelligent payments." -> "مدفوعات سلسة وآمنة وذكية.").
- Address the reader in the plural/organisation sense where English says "you /
  your business" (e.g. "أعمالكم", "شركتكم") consistently. Use the plural "you" form (كم).
- Translate meaning, not word-for-word. Idioms get natural Arabic equivalents.
- Do NOT use em-dashes (—) or en-dashes as punctuation in Arabic output. Use the
  Arabic comma "،", a colon, or rephrase. Use Arabic punctuation ، ؛ ؟ where natural.
- Use Western digits 0-9 (as emiratesnbd.com/ar does). Keep numbers, percentages,
  years and figures exactly as in English.
- Arrows: in RTL, `→` and `&rarr;` become `←`; `›` becomes `‹`; `←` becomes `→`.
  Keep `↗` `↓` `↑` as they are.
- Dates: "06 Oct 2025" -> "06 أكتوبر 2025". Months: يناير فبراير مارس أبريل مايو يونيو
  يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر.
- Currency: amounts shown with the dirham symbol appear as placeholders around the number (keep them); where "AED" is written as letters, "AED 5 billion" -> "5 مليارات درهم"; "USD 500 million" -> "500 مليون دولار أمريكي".
  Keep ISO codes as-is in technical lists (e.g. "USD, EUR, GBP").
- Page titles keep the " | " separator; "| Emirates NBD" -> "| الإمارات دبي الوطني".

## Keep in Latin script (do not translate)

Product and platform brand names: businessONLINE, businessONLINE Connect, ENBD Business,
ENBD X, signONLINE, smartTRADE / smartTrade, smartSCF, smartGUARANTEES, smartCDM / Smart CDM,
smartDEAL, FX Hub, Emirates NBD Pay, Payment Tracker (may be glossed: "أداة Payment Tracker"),
API Banking may be "الخدمات المصرفية عبر API". Also: Swift, Swift gpi, IBAN, API, ERP, SAP,
Oracle, WPS, VAT (or ضريبة القيمة المضافة in prose), UAEDDS, Aani, KYC, ESG, ECA, PPP, MENAT,
GCC (or دول مجلس التعاون الخليجي in prose), FATCA, CRS, KFS, PDF, QR, POS (or نقاط البيع),
iOS, Android, Visa, Mastercard, Bloomberg, Refinitiv, LSEG, Celent, Euromoney, Global Finance,
The Banker, Asiamoney, IFR, LinkedIn, X, YouTube, Instagram, Facebook. Stock tickers and
ISINs. Email addresses, URLs, phone numbers.

People's names and company names in deal tombstones / client lists: keep in Latin
UNLESS the entity has a very well-established official Arabic name you are certain of
(e.g. Dubai Electricity and Water Authority (DEWA) -> هيئة كهرباء ومياه دبي (ديوا);
Salik -> سالك; Emaar -> إعمار; Government of Dubai -> حكومة دبي; Sharjah -> الشارقة;
Abu Dhabi -> أبوظبي). Cities and countries are always translated. Job titles are translated.
A string that is only a proper name (e.g. "Binghatti", "QIIB") stays as is: return it unchanged.

## Glossary (use consistently)

| English | Arabic |
|---|---|
| Emirates NBD | الإمارات دبي الوطني (use "بنك الإمارات دبي الوطني" where "the bank" is meant) |
| Emirates NBD Bank (P.J.S.C.) | بنك الإمارات دبي الوطني (ش.م.ع) |
| Emirates NBD Capital | الإمارات دبي الوطني كابيتال |
| Emirates NBD Securities | الإمارات دبي الوطني للأوراق المالية |
| Emirates Islamic | الإمارات الإسلامي |
| Wholesale Banking | الخدمات المصرفية بالجملة |
| Corporate & Institutional Banking (old name, if it still appears) | الخدمات المصرفية بالجملة |
| Wholesale Banking (header segment label) | الخدمات المصرفية بالجملة |
| Personal (segment label) | الأفراد |
| Business (segment label) | الأعمال |
| Private banking | الخدمات المصرفية الخاصة |
| Payments | المدفوعات |
| Trade & Supply Chain Finance | تمويل التجارة وسلاسل التوريد |
| Trade Finance | تمويل التجارة |
| Supply Chain Finance | تمويل سلاسل التوريد |
| Cash management | إدارة النقد |
| Liquidity management | إدارة السيولة |
| Virtual accounts | الحسابات الافتراضية |
| Instant payments | المدفوعات الفورية |
| Cross-border payments | المدفوعات عبر الحدود |
| Payroll | الرواتب |
| Guarantees | الضمانات |
| Letters of credit | خطابات الاعتماد |
| Digital Solutions / Digital Channels | الحلول الرقمية / القنوات الرقمية |
| Lending | التمويل (or الإقراض where explicitly loans) |
| Working capital | رأس المال العامل |
| Project finance | تمويل المشاريع |
| Sustainable finance | التمويل المستدام |
| Green bond / loan | سندات خضراء / قرض أخضر |
| Sustainability-linked | المرتبط بالاستدامة |
| Investment Banking | الخدمات المصرفية الاستثمارية |
| Debt Capital Markets (DCM) | أسواق الدين (DCM) |
| Equity Capital Markets (ECM) | أسواق رأس المال للأسهم (ECM) |
| Global Loan Solutions / Loan syndication | حلول القروض العالمية / القروض المشتركة |
| Agency services | خدمات الوكالة |
| Corporate finance / Advisory | تمويل الشركات / الاستشارات |
| IPO | الطرح العام الأولي |
| Bookrunner / Joint Lead Manager | مدير سجل الاكتتاب / مدير رئيسي مشترك |
| Sukuk | صكوك |
| Sharia-compliant | متوافق مع أحكام الشريعة الإسلامية |
| Islamic finance | التمويل الإسلامي |
| Murabaha, Ijara, Wakala, Mudaraba | مرابحة، إجارة، وكالة، مضاربة |
| Securities services | خدمات الأوراق المالية |
| Custody | الحفظ الأمين |
| Fund administration | إدارة الصناديق |
| Online trading / Margin trading | التداول الإلكتروني / التداول بالهامش |
| Institutional trading | التداول المؤسسي |
| Brokerage | الوساطة |
| Global Markets & Treasury | الأسواق العالمية والخزينة |
| Treasury | الخزينة |
| FX / Foreign exchange | العملات الأجنبية (FX) / صرف العملات الأجنبية |
| Rates | أسعار الفائدة |
| Fixed income | الدخل الثابت |
| Equities | الأسهم |
| Money markets | أسواق النقد |
| Commodities | السلع |
| Hedging | التحوط |
| Structured solutions | الحلول المهيكلة |
| Execution capabilities | قدرات التنفيذ |
| Relationship Manager | مدير العلاقة |
| Talk to a specialist / Talk to us | تحدّث إلى مختص / تواصل معنا |
| Contact us | اتصل بنا |
| Learn more / Explore | اعرف المزيد / استكشف |
| Download PDF | تنزيل PDF |
| Apply now / Start application | قدّم الآن / ابدأ الطلب |
| Support & Resources | الدعم والموارد |
| FAQs | الأسئلة الشائعة |
| Form centre | مركز النماذج |
| Fraud awareness | التوعية بالاحتيال |
| Tutorials & platform demos | الدروس التعليمية والعروض التوضيحية للمنصات |
| Insights & Research | الرؤى والأبحاث |
| Case studies | دراسات الحالة |
| Rankings & awards | التصنيفات والجوائز |
| Our people | فريقنا |
| Events | الفعاليات |
| Media library | المكتبة الإعلامية |
| Articles | المقالات |
| Tombstones (deal records) | سجل الصفقات |
| Skip to main content | انتقل إلى المحتوى الرئيسي |
| Menu / Close / Search | القائمة / إغلاق / بحث |
| Previous / Next | السابق / التالي |
| Careers with us | الوظائف لدينا |
| Investor Relations | علاقات المستثمرين |
| Terms and Conditions | الشروط والأحكام |
| Schedule of Charges | جدول الرسوم |
| Cookies Policy | سياسة ملفات تعريف الارتباط |
| Data Privacy Notice | إشعار خصوصية البيانات |
| Download our Apps | حمّل تطبيقاتنا |

## Quality bar

Read the whole chunk first to understand context (consecutive ids usually come
from the same page). Keep terminology consistent within the chunk. Strings that
are fragments ("Explore", "All") are UI labels: translate as UI labels.
Alt text: translate descriptively. Do not leave English sentences untranslated.
