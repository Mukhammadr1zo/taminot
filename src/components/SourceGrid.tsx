import { useCallback, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, GridApi, GridReadyEvent, ValueFormatterParams } from 'ag-grid-community'
import * as XLSX from 'xlsx'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useStore } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { fmtInt, fmt2, shortLabel } from '../lib/format'
import type { Dataset } from '../types'

export interface Row {
  gu12: string; year: number; month: number; day: number; plan: string; shipper: string
  nomenk: string; rju: number; stFrom: string; stTo: string; rodVag: string
  tPlan: number; tDone: number; vPlan: number; vDone: number; park: string
  status: string; appDate: string
}

function parkCatShort(s: string): string {
  const m = s.match(/^(\d)\s*-\s*([^(]*)/)
  return m ? `${m[1]} · ${m[2].trim()}` : s
}

export function buildRows(dataset: Dataset, indices: number[]): Row[] {
  const dims = dataset.meta.dims
  return indices.map((i) => ({
    gu12: dataset.gu12[i],
    year: dataset.year[i],
    month: dataset.month[i],
    day: dataset.day[i],
    plan: dims.plan[dataset.plan[i]],
    shipper: shortLabel(dims.go[dataset.go[i]]),
    nomenk: dims.nomenk[dataset.nomenk[i]],
    rju: dataset.rju[i],
    stFrom: shortLabel(dims.st_from[dataset.st_from[i]]),
    stTo: shortLabel(dims.st_to[dataset.st_to[i]]),
    rodVag: dims.rod_vag[dataset.rod_vag[i]],
    tPlan: dataset.tPlan[i],
    tDone: dataset.tDone[i],
    vPlan: dataset.vPlan[i],
    vDone: dataset.vDone[i],
    park: parkCatShort(dims.park[dataset.park[i]]),
    status: dims.status[dataset.status[i]],
    appDate: dataset.appDate[i],
  }))
}

/** Xom ГУ-12 yozuvlari jadvali (DataTable + SourceModal uchun umumiy). */
export default function SourceGrid({ dataset, indices, height = 540, fileName = 'vagon-taminoti' }: {
  dataset: Dataset; indices: number[]; height?: number | string; fileName?: string
}) {
  const locale = useStore((s) => s.locale)
  const theme = useStore((s) => s.theme)
  const t = makeT(locale)
  const apiRef = useRef<GridApi<Row> | null>(null)
  const [quick, setQuick] = useState('')

  const rowData = useMemo<Row[]>(() => buildRows(dataset, indices), [dataset, indices])

  const numFmt = (p: ValueFormatterParams) => (p.value != null ? fmtInt(p.value) : '')
  const num2Fmt = (p: ValueFormatterParams) => (p.value != null ? fmt2(p.value) : '')

  const columnDefs = useMemo<ColDef<Row>[]>(() => [
    { field: 'gu12', headerName: t('tbl.gu12'), width: 100, filter: 'agTextColumnFilter', pinned: 'left' },
    { field: 'year', headerName: t('tbl.year'), width: 75, filter: 'agNumberColumnFilter' },
    { field: 'month', headerName: t('tbl.month'), width: 70, filter: 'agNumberColumnFilter' },
    { field: 'day', headerName: t('flt.day'), width: 65, filter: 'agNumberColumnFilter' },
    { field: 'plan', headerName: t('tbl.plan'), width: 120 },
    { field: 'shipper', headerName: t('tbl.shipper'), width: 230, filter: 'agTextColumnFilter', tooltipField: 'shipper' },
    { field: 'nomenk', headerName: t('tbl.nomenk'), width: 200, tooltipField: 'nomenk' },
    { field: 'rju', headerName: t('tbl.rju'), width: 75, filter: 'agNumberColumnFilter' },
    { field: 'stFrom', headerName: t('tbl.stFrom'), width: 150, tooltipField: 'stFrom' },
    { field: 'stTo', headerName: t('tbl.stTo'), width: 150, tooltipField: 'stTo' },
    { field: 'rodVag', headerName: t('tbl.rodVag'), width: 90 },
    { field: 'tPlan', headerName: t('tbl.tPlan'), width: 110, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: num2Fmt },
    { field: 'tDone', headerName: t('tbl.tDone'), width: 110, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: num2Fmt },
    { field: 'vPlan', headerName: t('tbl.vPlan'), width: 95, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: numFmt },
    { field: 'vDone', headerName: t('tbl.vDone'), width: 95, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: numFmt },
    { field: 'park', headerName: t('tbl.park'), width: 180, tooltipField: 'park' },
    { field: 'status', headerName: t('tbl.status'), width: 110 },
    { field: 'appDate', headerName: t('tbl.appDate'), width: 110 },
  ], [t])

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: true,
  }), [])

  const onGridReady = useCallback((e: GridReadyEvent<Row>) => { apiRef.current = e.api }, [])
  const onQuick = (v: string) => { setQuick(v); apiRef.current?.setGridOption('quickFilterText', v) }
  const exportCsv = () => apiRef.current?.exportDataAsCsv({ fileName: fileName + '.csv' })
  const exportXlsx = () => {
    const rows: Row[] = []
    apiRef.current?.forEachNodeAfterFilterAndSort((node) => { if (node.data) rows.push(node.data) })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Taminot')
    XLSX.writeFile(wb, fileName + '.xlsx')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] muted">{fmtInt(rowData.length)} {t('app.records')}</span>
        <div className="flex items-center gap-1">
          <input value={quick} onChange={(e) => onQuick(e.target.value)} placeholder={t('flt.searchIn')}
            className="w-44 rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-[11px] outline-none focus:border-brand-400" />
          <button onClick={exportCsv} className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] hover:border-brand-400">{t('lbl.exportCsv')}</button>
          <button onClick={exportXlsx} className="rounded-md border border-[var(--border)] bg-brand-600 px-2 py-1 text-[11px] text-white">{t('lbl.exportXlsx')}</button>
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'} min-h-0 flex-1`} style={{ height, width: '100%' }}>
        <AgGridReact<Row>
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[50, 100, 200, 500]}
          enableCellTextSelection={true}
          tooltipShowDelay={300}
          animateRows={false}
        />
      </div>
    </div>
  )
}
