# 🚆 Vagon Ta'minoti Analitik Dashboard (2025–2026)
### Дашборд аналитики обеспечения вагонами

2025-yil (to'liq) va 2026-yil (yanvar–may) vagon ta'minoti reja-bajarilish ma'lumotlarining **to'liq** (80 088 yozuv) interaktiv, ikki tilli (UZ/RU) analitik dashboardi. React + Vite + ECharts + AG Grid asosida. Keyinchalik **d-railway.uz** platformasiga komponent sifatida ulanadi.

---

## 🚀 Ishga tushirish / Запуск

```bash
# 1) Bog'liqliklar (bir marta)
npm install

# 2) (Ixtiyoriy) Excel'dan ma'lumotni qayta yig'ish — public/data.json, public/meta.json
npm run etl          # python kerak: pip install openpyxl

# 3) Dev-server (brauzerda ochiladi)
npm run dev          # http://localhost:5173

# 4) Production build
npm run build        # -> dist/
npm run preview      # dist/ ni ko'rib chiqish
```

> **Eslatma:** dashboard `public/data.json` va `public/meta.json` ni `fetch` orqali yuklaydi, shuning uchun `file://` orqali emas, **server orqali** (dev/preview yoki istalgan statik hosting) ochilishi kerak.

---

## 📂 Tuzilma / Структура

```
Taminot/
  2025 йил вес год.xlsx       # manba (2025)
  2026 йил 5 ой.xlsx          # manba (2026)
  etl/build_data.py           # ETL: xlsx -> public/data.json + public/meta.json
  public/
    data.json                 # columnar, dictionary-encoded (5.5 MB)
    meta.json                 # lug'atlar (dims) + xulosa (1 MB)
  src/
    SupplyDashboard.tsx       # eksport qilinadigan asosiy komponent
    components/
      Dashboard.tsx           # barcha bo'limlarni yig'adi
      Header, FilterBar, Kpi, MultiSelect, Card, EChart, DataTable
      charts/                 # MonthlyTrend, Nomenk, WagonPie, ParkCharts,
                              #  RjuCharts, Sankey, ShippersBar, Stations,
                              #  Distribution, GaugeFunnel, YearCompare
    lib/                      # aggregate (crossfilter), data, options, format, palette
    store/useStore.ts         # zustand: filtrlar, til, mavzu, metrik
    i18n/strings.ts           # UZ/RU lug'at
    index.ts                  # kutubxona kirish nuqtasi
```

---

## 🧱 Ma'lumotlar / Данные

17 ustun → normallashtirilgan maydonlar. Reja/bajarilgan **tonna** va **vagon**, yuboruvchi (ГО), yuk guruhi, РЖУ (1–6), jo'natish/manzil stansiyasi, vagon turi, park mulkchiligi (1-Ijara / 2-СПС / 3-ТЙ Ma'muriyati), status.

**Tahlil eslatmasi:** vagon bajarilishi yuqori (~90–94%), tonna bajarilishi past (2025: 37%, 2026: 66%) — chunki ~23k qatorda ortig'i bilan bajarilgan va ~14k qatorda reja=0. Dashboard ikkala metrikani ham ko'rsatadi.

---

## 🎛 Imkoniyatlar / Возможности

- **KPI** kartalar (sparkline, bajarilish %)
- **Grafiklar:** oylik dinamika · yuk guruhi bar + treemap · vagon donut · park donut + operator drill · РЖУ bar + sunburst · **sankey** yo'nalishlar · yuboruvchilar · stansiyalar + **heatmap** · gauge · funnel · bajarilish histogrammasi · reja-vs-bajarilgan scatter · 2025-vs-2026 taqqoslash
- **Filtrlar:** yil, oy, reja turi, yuk guruhi, РЖУ, vagon turi, park, operator, yuboruvchi, jo'natish/manzil stansiyasi, status + tez presetlar + qidiruv + tonna/vagon toggle
- **Jadval:** AG Grid — saralash, ustun filtri, qidiruv, paginatsiya, **CSV + Excel eksport**
- **UZ/RU**, **dark/light**, har bir grafikni **PNG** yuklab olish

---

## 🔌 d-railway.uz integratsiyasi

Dashboard bitta React komponenti sifatida eksport qilinadi:

```tsx
import { SupplyDashboard } from './vagon-taminoti-dashboard/src'

<SupplyDashboard
  dataUrl="/static/taminot/"   // data.json va meta.json joylashgan baza URL
  defaultLocale="uz"           // 'uz' | 'ru'
  defaultTheme="light"         // 'light' | 'dark'
  embedded                     // <html> ga 'dark' klass qo'shilmaydi
/>
```

- `data.json` / `meta.json` ni istalgan statik papkaga yoki API endpoint'ga qo'ying va `dataUrl` ni ko'rsating.
- Komponent global side-effektsiz; Tailwind klasslari va CSS o'zgaruvchilari (`--bg`, `--panel`, `--accent` ...) orqali mavzulashtiriladi.
