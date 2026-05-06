'use client'

import { useState } from 'react'
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { api } from '@/lib/api/client'
import ComparisonChart from '@/components/reports/ComparisonChart'
import styles from './page.module.css'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function pct(oldVal, newVal) {
  if (oldVal === 0) return newVal > 0 ? 100 : 0
  return ((newVal - oldVal) / oldVal) * 100
}

async function fetchMonthStats(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, Number(month), 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return api.get('/transactions/stats', { from: start, to: end })
}

function Badge({ value }) {
  if (Math.abs(value) < 0.5) return <span className={`${styles.badge} ${styles.badgeFlat}`}><Minus size={11} /> Sin cambio</span>
  if (value > 0) return <span className={`${styles.badge} ${styles.badgeUp}`}><TrendingUp size={11} /> +{value.toFixed(1)}%</span>
  return <span className={`${styles.badge} ${styles.badgeDown}`}><TrendingDown size={11} /> {value.toFixed(1)}%</span>
}

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function CompararPage() {
  const { profile } = useAuth()
  const [period1, setPeriod1] = useState(new Date().getMonth()) // 0-indexed
  const [period2, setPeriod2] = useState(Math.max(0, new Date().getMonth() - 1))
  const [chartType, setChartType] = useState('bar')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isPremium = profile?.subscription_tier === 'premium'

  if (!isPremium) {
    return (
      <div className={styles.locked}>
        <span className={styles.lockIcon}>👑</span>
        <h2>Función Premium</h2>
        <p>La comparación entre períodos está disponible solo para usuarios Premium.</p>
        <a href="../settings" className={styles.upgradeBtn}>Ver planes</a>
      </div>
    )
  }

  const handleCompare = async () => {
    setLoading(true); setError('')
    try {
      const year = new Date().getFullYear()
      const [s1, s2] = await Promise.all([
        fetchMonthStats(year, period1 + 1),
        fetchMonthStats(year, period2 + 1),
      ])
      setData({
        chartType,
        period1, period2,
        income: [s1.income, s2.income],
        expenses: [s1.expenses, s2.expenses],
        balances: [s1.balance ?? (s1.income - s1.expenses), s2.balance ?? (s2.income - s2.expenses)],
        pctIncome: pct(s1.income, s2.income),
        pctExpense: pct(s1.expenses, s2.expenses),
        pctBalance: pct(s1.balance ?? (s1.income - s1.expenses), s2.balance ?? (s2.income - s2.expenses)),
      })
    } catch {
      setError('No se pudo cargar la comparación. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Comparar períodos</h1>
        <p>Analiza cómo evolucionaron tus finanzas entre dos meses</p>
      </div>

      <div className={styles.card}>
        <p className={styles.cardTitle}>Selecciona los períodos</p>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label>Período 1 (base)</label>
            <select value={period1} onChange={(e) => setPeriod1(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Período 2 (comparar)</label>
            <select value={period2} onChange={(e) => setPeriod2(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Tipo de gráfico</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="bar">Barras</option>
              <option value="line">Línea</option>
              <option value="pie">Pastel</option>
            </select>
          </div>
        </div>
        <button className={styles.compareBtn} onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparando…' : <><ArrowRight size={16} /> Comparar</>}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Cargando datos…</p>}

      {data && (
        <>
          <div className={styles.card}>
            <p className={styles.resultsTitle}>{MONTHS[data.period1]} vs {MONTHS[data.period2]}</p>
            <div className={styles.statsRow}>
              {[
                { label: 'Ingresos', v1: data.income[0], v2: data.income[1], pct: data.pctIncome },
                { label: 'Gastos', v1: data.expenses[0], v2: data.expenses[1], pct: data.pctExpense },
                { label: 'Balance', v1: data.balances[0], v2: data.balances[1], pct: data.pctBalance },
              ].map(({ label, v1, v2, pct: p }) => (
                <div key={label} className={styles.statCard}>
                  <p className={styles.statLabel}>{label}</p>
                  <div className={styles.statValues}>
                    <span className={styles.statValue1}>{MONTHS[data.period1]}: {fmt(v1)}</span>
                    <span className={styles.statValue2}>{MONTHS[data.period2]}: {fmt(v2)}</span>
                  </div>
                  <Badge value={p} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartCard}>
            <ComparisonChart data={data.income} chartType={data.chartType} />
          </div>
        </>
      )}
    </div>
  )
}
