import type { Dataset, Meta, RawData } from '../types'

function toI8(a: number[]) { return Int8Array.from(a) }
function toI16(a: number[]) { return Int16Array.from(a) }
function toI32(a: number[]) { return Int32Array.from(a) }
function toF64(a: number[]) { return Float64Array.from(a) }

/** data.json + meta.json yuklab, tezkor typed-array Dataset quradi. */
export async function loadDataset(base = import.meta.env.BASE_URL): Promise<Dataset> {
  const [rawRes, metaRes] = await Promise.all([
    fetch(base + 'data.json'),
    fetch(base + 'meta.json'),
  ])
  if (!rawRes.ok || !metaRes.ok) throw new Error('Ma\'lumot yuklanmadi (data.json / meta.json)')
  const raw: RawData = await rawRes.json()
  const meta: Meta = await metaRes.json()
  const c = raw.cols

  const goDim = meta.dims.go
  const sfDim = meta.dims.st_from
  const stDim = meta.dims.st_to

  const goLower = goDim.map((s) => s.toLowerCase())
  const stFromLower = sfDim.map((s) => s.toLowerCase())
  const stToLower = stDim.map((s) => s.toLowerCase())

  return {
    n: raw.n,
    gu12: c.gu12,
    appDate: c.appDate,
    year: toI16(c.year),
    month: toI8(c.month),
    plan: toI16(c.plan),
    go: toI32(c.go),
    nomenk: toI16(c.nomenk),
    rju: toI8(c.rju),
    st_from: toI32(c.st_from),
    st_to: toI32(c.st_to),
    rod_vag: toI16(c.rod_vag),
    parkCat: toI8(c.parkCat),
    park: toI32(c.park),
    status: toI16(c.status),
    tPlan: toF64(c.tPlan),
    tDone: toF64(c.tDone),
    vPlan: toF64(c.vPlan),
    vDone: toF64(c.vDone),
    goLower,
    stFromLower,
    stToLower,
    meta,
  }
}
