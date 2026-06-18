# -*- coding: utf-8 -*-
"""
ETL: 2025 + 2026 vagon ta'minoti xlsx -> ixcham (dictionary-encoded, columnar) JSON.
Chiqish:
  public/data.json  - columnar massivlar (encoded indekslar + sonlar)
  public/meta.json  - lug'atlar (dims) + xulosa statistikasi + filtr ro'yxatlari
"""
import openpyxl, json, io, os, re
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
os.makedirs(PUBLIC, exist_ok=True)

FILES = [
    ('2025', os.path.join(ROOT, '2025 йил вес год.xlsx')),
    ('2026', os.path.join(ROOT, '2026 йил 5 ой.xlsx')),
]

COLS = ['gu12', 'plan', 'go', 'month_year', 'nomenk', 'rju', 'st_from', 'st_to',
        'rod_vag', 'tonna', 'vyp_tonna', 'nevyp_tonna', 'vagon', 'vyp_vagon',
        'nevyp_vagon', 'park', 'status']

PERIOD_RE = re.compile(r'^\s*(\d{1,2})\s*/\s*(\d{4})')
APPDATE_RE = re.compile(r'\((\d{2}-\d{2}-\d{4})\)')


def to_num(v):
    if v is None:
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace(' ', '').replace(',', '.')
    if s == '' or s == '-':
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


def clean_str(v):
    if v is None:
        return ''
    return re.sub(r'\s+', ' ', str(v)).strip()


def park_category(park):
    """Boshidagi raqam -> 1/2/3 (0 = noma'lum)."""
    m = re.match(r'\s*(\d)', park)
    return int(m.group(1)) if m else 0


class Encoder:
    """Dictionary encoder: string -> kichik int indeks."""
    def __init__(self):
        self.items = []
        self.index = {}

    def get(self, s):
        i = self.index.get(s)
        if i is None:
            i = len(self.items)
            self.index[s] = i
            self.items.append(s)
        return i


enc = {k: Encoder() for k in ['plan', 'go', 'nomenk', 'st_from', 'st_to', 'rod_vag', 'park', 'status']}

cols = {k: [] for k in [
    'gu12', 'year', 'month', 'plan', 'go', 'nomenk', 'rju', 'st_from', 'st_to',
    'rod_vag', 'parkCat', 'park', 'status', 'appDate',
    'tPlan', 'tDone', 'vPlan', 'vDone']}

summary = {}
n_total = 0
skipped = 0

for year_label, fpath in FILES:
    wb = openpyxl.load_workbook(fpath, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    yr_rows = 0
    s = {'rows': 0, 'tPlan': 0.0, 'tDone': 0.0, 'vPlan': 0.0, 'vDone': 0.0,
         'over_tonna_rows': 0, 'zero_plan_rows': 0}
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i < 2:            # 0: sarlavha, 1: ustun nomlari
            continue
        if row is None or row[0] is None:
            skipped += 1
            continue
        d = dict(zip(COLS, row))

        my = clean_str(d['month_year'])
        m = PERIOD_RE.match(my)
        if not m:
            skipped += 1
            continue
        month = int(m.group(1))
        year = int(m.group(2))
        adm = APPDATE_RE.search(my)
        app_date = adm.group(1) if adm else ''

        park = clean_str(d['park'])
        rju_raw = clean_str(d['rju'])
        try:
            rju = int(float(rju_raw)) if rju_raw not in ('', 'None') else 0
        except ValueError:
            rju = 0

        tp = round(to_num(d['tonna']), 3)
        td = round(to_num(d['vyp_tonna']), 3)
        vp = round(to_num(d['vagon']))
        vd = round(to_num(d['vyp_vagon']))

        cols['gu12'].append(clean_str(d['gu12']))
        cols['year'].append(year)
        cols['month'].append(month)
        cols['plan'].append(enc['plan'].get(clean_str(d['plan'])))
        cols['go'].append(enc['go'].get(clean_str(d['go'])))
        cols['nomenk'].append(enc['nomenk'].get(clean_str(d['nomenk'])))
        cols['rju'].append(rju)
        cols['st_from'].append(enc['st_from'].get(clean_str(d['st_from'])))
        cols['st_to'].append(enc['st_to'].get(clean_str(d['st_to'])))
        cols['rod_vag'].append(enc['rod_vag'].get(clean_str(d['rod_vag'])))
        cols['parkCat'].append(park_category(park))
        cols['park'].append(enc['park'].get(park))
        cols['status'].append(enc['status'].get(clean_str(d['status'])))
        cols['appDate'].append(app_date)
        cols['tPlan'].append(tp)
        cols['tDone'].append(td)
        cols['vPlan'].append(vp)
        cols['vDone'].append(vd)

        s['rows'] += 1
        s['tPlan'] += tp
        s['tDone'] += td
        s['vPlan'] += vp
        s['vDone'] += vd
        if (tp - td) < 0:
            s['over_tonna_rows'] += 1
        if tp == 0:
            s['zero_plan_rows'] += 1
        yr_rows += 1
        n_total += 1
    wb.close()
    for k in ('tPlan', 'tDone', 'vPlan', 'vDone'):
        s[k] = round(s[k], 2)
    summary[year_label] = s
    print(f'{year_label}: {yr_rows} qator')

# --- meta ---
meta = {
    'rowCount': n_total,
    'skipped': skipped,
    'years': [2025, 2026],
    'parkCatLabels': {
        '0': {'uz': "Noma'lum", 'ru': 'Неизвестно'},
        '1': {'uz': 'Ijara (Аренда)', 'ru': 'Аренда Ж.Д. вагонов'},
        '2': {'uz': 'СПС (operator parki)', 'ru': 'СПС (собственный парк)'},
        '3': {'uz': "ТЙ Ma'muriyati", 'ru': 'Ж.Д. Администрации'},
    },
    'dims': {k: enc[k].items for k in enc},
    'summary': summary,
}

with io.open(os.path.join(PUBLIC, 'data.json'), 'w', encoding='utf-8') as f:
    json.dump({'n': n_total, 'cols': cols}, f, ensure_ascii=False, separators=(',', ':'))

with io.open(os.path.join(PUBLIC, 'meta.json'), 'w', encoding='utf-8') as f:
    json.dump(meta, f, ensure_ascii=False, separators=(',', ':'))

print('Jami qatorlar:', n_total, '| tashlandi:', skipped)
print('Dim o\'lchamlari:', {k: len(enc[k].items) for k in enc})
print('Summary:', json.dumps(summary, ensure_ascii=False))
dp = os.path.getsize(os.path.join(PUBLIC, 'data.json')) / 1e6
mp = os.path.getsize(os.path.join(PUBLIC, 'meta.json')) / 1e6
print(f'data.json: {dp:.2f} MB | meta.json: {mp:.2f} MB')