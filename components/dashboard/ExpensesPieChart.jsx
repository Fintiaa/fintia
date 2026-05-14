'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

// Palette of distinct colors for categories that lack one
const FALLBACK_COLORS = ['#B9D8C2', '#9AC2C9', '#8AA1B1', '#FFCB47', '#7ab98d', '#4A5043', '#d4e8da', '#c8d8c0']
const OTROS_COLOR = '#cbd5e1'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '8px 12px', fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{name}</p>
      <p style={{ color: '#6b7280', margin: 0 }}>{fmt(value)}</p>
    </div>
  )
}

const renderLegend = (props) => {
  const { payload } = props
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
      gap: '6px 16px', marginTop: 8,
    }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: entry.color, flexShrink: 0, display: 'inline-block',
          }} />
          <span style={{ fontSize: '0.78rem', color: '#374151' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function normalizeData(data) {
  if (Array.isArray(data)) return data
  // legacy object format fallback
  return Object.entries(data).map(([id, value]) => ({ id, name: id, icon: '📦', color: null, value }))
}

export default function ExpensesPieChart({ data, emptyText }) {
  const raw = normalizeData(data).filter((d) => d.value > 0)

  if (raw.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 260, color: '#9ca3af', fontSize: '0.9rem',
      }}>
        {emptyText}
      </div>
    )
  }

  // Step 1: merge entries with the same name (e.g. multiple unresolved → "Otros")
  const merged = new Map()
  raw.forEach((item, i) => {
    const key = item.name
    if (merged.has(key)) {
      merged.get(key).value += item.value
    } else {
      merged.set(key, {
        ...item,
        color: item.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      })
    }
  })

  const items = [...merged.values()].sort((a, b) => b.value - a.value)
  const total = items.reduce((s, d) => s + d.value, 0)

  // Step 2: group items < 5% AND not the top 5 into one "Otros"
  const top5 = items.slice(0, 5)
  const rest = items.slice(5)
  const smallFromTop = top5.filter((item) => item.value / total < 0.05 && item.name !== 'Otros')
  const main = top5.filter((item) => item.value / total >= 0.05 || item.name === 'Otros')

  let othersValue = rest.reduce((s, d) => s + d.value, 0)
  othersValue += smallFromTop.reduce((s, d) => s + d.value, 0)

  // If there's already an "Otros" entry in main, merge into it
  const existingOtros = main.find((d) => d.name === 'Otros')
  const chartData = main.filter((d) => d.name !== 'Otros')

  const finalOtrosValue = (existingOtros?.value ?? 0) + othersValue
  if (finalOtrosValue > 0) {
    chartData.push({ id: '__otros__', name: 'Otros', color: OTROS_COLOR, value: finalOtrosValue })
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="42%"
          innerRadius={55}
          outerRadius={88}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  )
}
