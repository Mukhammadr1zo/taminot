# Vagon Ta'minoti Analitik Dashboard — Texnik Spetsifikatsiya (PROMPT)
### Дашборд аналитики обеспечения вагонами — Техническая спецификация

> **Maqsad:** 2025-yil (to'liq yil) va 2026-yil (yanvar–may) bo'yicha vagon ta'minoti / yuk tashish reja-bajarilish ma'lumotlarining **to'liq** (top-N kesilmasdan, barcha 80 088 yozuv) interaktiv, ikki tilli (UZ/RU) analitik dashboardi. Hozir mustaqil ishlaydi, keyin **d-railway.uz** (React/Next.js) platformasiga embed qilinadi.

---

## 1. Ma'lumotlar manbasi va hajmi
| Fayl | Davr | Yozuvlar |
|---|---|---|
| `2025 йил вес год.xlsx` | 2025 to'liq yil (01–12) | 53 691 |
| `2026 йил 5 ой.xlsx` | 2026 yanvar–may (01–05) | 26 397 |
| **Jami** | | **80 088** |

**17 ustun (ikkala faylda bir xil):** №ГУ-12, План, ГО (yuboruvchi), Месяц/Год, Номенк. группа, РЖУ, Ст. отправления, Ст. назначения, Род ваг, Тонна, Выпол. Тонна, Не выпол. Тонна, Вагон, Выпол. Вагон, Не выпол. Вагон, Принад. парка, Статус.

---

## 2. Texnologiya (stack)
- **React 18 + Vite + TypeScript** — mustaqil SPA, keyin d-railway.uz (React/Next) ga komponent sifatida import qilinadi.
- **Apache ECharts** (`echarts`, `echarts-for-react`) — barcha grafik turlari: bar, line/area, pie/donut, **treemap**, **sunburst**, **sankey**, **heatmap**, scatter, gauge, funnel, boxplot. Barchasida **qiymat yorliqlari (data labels)** ko'rinib turadi.
- **Tailwind CSS** + yengil komponentlar (KPI kartalar, filter chiplar) — zamonaviy, dark/light mavzu.
- **AG Grid Community** (yoki TanStack Table) — to'liq ma'lumot jadvali: saralash, ustun filtrlari, virtual scroll, CSV/Excel eksport.
- **Zustand** — global filter holati (state).
- **Client-side crossfilter** — barcha ~80k yozuv ixcham (dictionary-encoded, columnar) JSON sifatida brauzerga yuklanadi; barcha agregatsiyalar brauzerda hisoblanadi → **bir necha filtr bir vaqtda, darhol (instant)**.
- **i18n** (react-i18next yoki oddiy lug'at) — UZ + RU almashtirgich.
- **Data ETL** — Python (openpyxl) skripti: tozalash → dictionary-encode → `public/data.json` + `public/meta.json`.

---

## 3. Ma'lumot modeli va tozalash qoidalari (ETL)
Har bir ustun normallashtiriladi:
| Maydon | Manba / qoida |
|---|---|
| `gu12` | ariza raqami (string) |
| `planType` | `ДПГруженный` → **ДП**, `ОП` → **ОП** |
| `shipperId`, `shipperName` | "kod (raqam) - NOMI" ajratiladi |
| `year`, `month` | "MM/YYYY(dd-mm-yyyy)" dan oldingi **MM/YYYY** → yil + oy. Qavs ichidagi sana = `appDate` (drill uchun) |
| `nomenk` | yuk guruhi (33 qiymat) |
| `rju` | 1–6; `0`/bo'sh → "Noma'lum" |
| `stFromCode/Name`, `stToCode/Name` | "kod - nomi"; "Все станции по УТИ" va eksport ("Галаба (эксп.) [Хайратан]") alohida saqlanadi |
| `rodVag` | КР, ПВ, ЦС, ПЛ, ЦМВ, ЗРВ, МВЗ, ПР |
| `tonnaPlan/Done/Undone` | son; vergul→nuqta; null→0. Undone manfiy = **ortig'i bilan bajarilgan** |
| `vagonPlan/Done/Undone` | son |
| `parkCat` | boshidagi 1/2/3 → **1-Ijara**, **2-СПС (operator parki)**, **3-ТЙ Ma'muriyati** |
| `parkOperator` | СПС(...) ichidagi operator nomi (sub-o'lchov) |
| `status` | Утверждён / Отменено |
| **Hosilaviy** | `tonnaFulfill%`, `vagonFulfill%`, `isOver` (ortiqcha), `isZeroPlan` (reja=0) |

Tozalash: sarlavha 2 qatori tashlanadi · bo'shliqlar trim · yuqori kardinallikli o'lchovlar (yuboruvchi, stansiya, operator, nomenklatura) **dictionary-encode** qilinadi → JSON ixcham (bir necha MB) va tez.

---

## 4. Global filtrlar (barchasi — multi-select, qidiruvli, "tanlash/tozalash")
1. **Yil** — 2025 / 2026 / Ikkalasi (taqqoslash)
2. **Oy** — 1–12 (slider + checkbox)
3. **Reja turi** — ДП / ОП
4. **Yuk guruhi** — 33 qiymat
5. **РЖУ** — 1–6 (+0)
6. **Vagon turi** — 8 qiymat
7. **Park mulkchiligi** — 3 guruh
8. **Operator (park)** — qidiruvli (yuzlab)
9. **Yuboruvchi (ГО)** — qidiruvli (~1.4k)
10. **Jo'natish stansiyasi** — qidiruvli
11. **Manzil stansiyasi** — qidiruvli
12. **Status** — Утверждён / Отменено
13. **Metric toggle** — **Tonna ↔ Vagon** (barcha grafiklarning o'lchovini almashtiradi)
14. **Erkin qidiruv** (yuboruvchi/stansiya bo'yicha)
15. **Tez presetlar** — "Faqat bajarilmagan" · "Ortig'i bilan bajarilgan" · "Reja=0 (operativ qo'shilgan)"

Faol filtrlar — o'chiriladigan **chiplar** ko'rinishida · "Hammasini tozalash" · filtrlangan yozuvlar soni · **filtr holati URL'da** (ulashish/embed uchun).

---

## 5. KPI sarlavha (kartalar — trend ko'rsatkichi bilan)
Jami arizalar · Reja tonna · Bajarilgan tonna (+%) · Bajarilmagan tonna · Reja vagon · Bajarilgan vagon (+%) · Bajarilmagan vagon · O'rtacha bajarilish % · **2025↔2026 farqi** (ikkalasi tanlanganda — ↑/↓ strelka + sparkline). Hammasi filtrga qarab yangilanadi.

---

## 6. Grafiklar (har bir so'ralgan tur — qiymatlar ko'rinib turadi)
Har bir grafikda: data-label · boy tooltip · legend · PNG yuklab olish · "top-N ↔ barchasi" almashtirgich · metric (tonna/vagon) global toggle'ga bo'ysunadi.

- **A. Oylik dinamika** — line+bar combo: reja vs bajarilgan, 2-o'qda bajarilish % chizig'i; 2025 va 2026 ustma-ust taqqoslash.
- **B. Yuk guruhi bo'yicha** — gorizontal bar (reja/bajarilgan, **barcha 33**, scroll) **+ Treemap** (o'lcham=bajarilgan, rang=bajarilish%).
- **C. Vagon turi** — **Pie/Donut** (% va mutlaq qiymat) + grouped bar.
- **D. Park mulkchiligi** — **Pie/Donut** (3 guruh) → operatorlarga **drill** (Treemap/Bar).
- **E. РЖУ bo'yicha** — bar (reja/bajarilgan/%) **+ Sunburst** РЖУ → yuk guruhi → vagon turi.
- **F. Yo'nalishlar — SANKEY** — stansiya→stansiya oqimlari (kengaytiriladigan); muqobil: РЖУ→yuk→vagon turi sankey.
- **G. Top yuboruvchilar** — gorizontal bar, saralanadigan, **barchasiga (1.4k)** kengaytiriladi (virtual).
- **H. Stansiyalar** — top jo'natish/manzil bar **+ Heatmap** (stansiya×oy yoki yuk×oy).
- **I. Bajarilish taqsimoti** — histogram/boxplot + scatter (reja vs bajarilgan, diagonal=100%, over/under).
- **J. Gauge + Funnel** — umumiy bajarilish % gauge; reja→bajarilgan→bajarilmagan funnel.
- **K. 2025 vs 2026 taqqoslash paneli** — yonma-yon bar / slope chart (2026 = 5 oy bo'lgani uchun 2025 ning yan–may bilan adolatli solishtiriladi, aniq belgilanadi).

---

## 7. To'liq ma'lumot jadvali (barcha qatorlar)
AG Grid: filtrlangan barcha qatorlar (virtual scroll) · barcha ustunlar (ko'rsatish/yashirish) · multi-sort · ustun filtrlari · global qidiruv · qator detali (to'liq ГУ-12) · **CSV + Excel eksport** (joriy ko'rinish) · pastki agregatlar (filtrlangan sum).

---

## 8. UX / dizayn
Karta-asosli responsive grid · **dark/light** mavzu · **UZ/RU** almashtirgich (barcha UI matni ikki tilda; ma'lumot qiymatlari asl tilida) · raqam formati (mingliklar ajratkichi, т / vagon, % 1 kasr) · loading/empty holatlar · rang-ko'r xavfsiz palitra · d-railway.uz mavzulashtirishga tayyor (CSS o'zgaruvchilari).

---

## 9. d-railway.uz integratsiyaga tayyorlik (React/Next)
- Butun dashboard bitta `<SupplyDashboard locale data theme embedded />` komponenti.
- Global side-effektsiz; Tailwind prefiks/CSS-modul (klash bo'lmasin).
- Ma'lumot **sozlanadigan URL**dan olinadi (keyin API'ga almashtirish oson).
- Build: hozir mustaqil `dist/` (statik) + import qilinadigan komponent eksporti.

---

## 10. Loyiha tuzilishi
```
Taminot/
  data/                 # manba xlsx (saqlanadi)
  etl/build_data.py     # ETL → public/data.json + meta.json
  public/data.json, meta.json
  src/
    Dashboard.tsx       # eksport qilinadigan asosiy komponent
    components/         # KPI, FilterBar, charts/*, DataTable
    store/filters.ts    # zustand
    i18n/{uz,ru}.ts
    lib/                # agregatsiya, crossfilter, format
  index.html, package.json, vite.config.ts, tailwind.config.js
  README.md             # ishga tushirish + integratsiya (UZ/RU)
```
Ishga tushirish: `npm install` → `npm run dev` → brauzer · `npm run build`.

---

## 11. Bajarish bosqichlari (workflow)
1. **ETL** — Python skript: ikkala fayl tozalanadi → `data.json`+`meta.json`; jami raqamlar profil bilan tekshiriladi.
2. **Skelet** — Vite+React+TS+Tailwind+ECharts+AG Grid; data loader; filter store; i18n.
3. **Filtrlar + KPI sarlavha.**
4. **Grafiklar 1-to'plam** — dinamika, nomenklatura bar+treemap, vagon pie, park pie+drill.
5. **Grafiklar 2-to'plam** — РЖУ bar+sunburst, sankey, yuboruvchilar, heatmap, taqsimot/scatter, gauge/funnel, taqqoslash.
6. **Ma'lumot jadvali + eksport.**
7. **Mavzu, i18n, responsive, README, integratsiya wrapper.**
8. **Tekshirish** — dev-server ishga tushiriladi, raqamlar ETL bilan solishtiriladi, skrinshot.

---

## ⚠️ Muhim analitik eslatma
- **Vagon bajarilishi yuqori (~90–94%)**, lekin **tonna bajarilishi past (2025: 37%, 2026: 66%)** — chunki ~13k qatorda ortig'i bilan bajarilgan (manfiy "bajarilmagan tonna") va ~7k qatorda reja=0 bo'lib haqiqiy yetkazilgan. Dashboard **ikkala metrikani ham** (vagon va tonna) va **over/under bajarilish** ko'rinishini alohida ko'rsatadi — bu noto'g'ri talqindan saqlaydi.
- 2026 atigi 5 oy — yillik taqqoslashda doimo "yan–may" bilan solishtiriladi va aniq belgilanadi.