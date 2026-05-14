'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const OTROS_COLOR = '#d1d5db'

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

// data can be either the old { id: amount } object or the new array [{ id, name, icon, color, value }]
function normalizeData(data) {
  if (Array.isArray(data)) return data
  // legacy object format — shouldn't happen after backend fix but keep as fallback
  return Object.entries(data).map(([id, value]) => ({ id, name: id, icon: '📦', color: '#9ca3af', value }))
}

export default function ExpensesPieChart({ data, emptyText }) {
  const items = normalizeData(data).filter((d) => d.value > 0)

  if (items.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 260, color: '#9ca3af', fontSize: '0.9rem',
      }}>
        {emptyText}
      </div>
    )
  }

  const total = items.reduce((s, d) => s + d.value, 0)

  // Group items < 4% of total into "Otros"
  const THRESHOLD = 0.04
  const main = []
  let othersValue = 0

  for (const item of items.sort((a, b) => b.value - a.value)) {
    if (item.value / total < THRESHOLD) {
      othersValue += item.value
    } else {
      main.push(item)
    }
  }

  const chartData = [...main]
  if (othersValue > 0) {
    chartData.push({ id: '__otros__', name: 'Otros', icon: '📦', color: OTROS_COLOR, value: othersValue })
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
