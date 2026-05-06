'use client'

import { useInsights } from '@/lib/hooks/useInsights'
import styles from './page.module.css'

const TYPE_STYLES = {
  good: { bg: '#f0fdf4', border: '#86efac', label: '#166534' },
  bad: { bg: '#fef2f2', border: '#fca5a5', label: '#991b1b' },
  warning: { bg: '#fefce8', border: '#fde047', label: '#854d0e' },
  tip: { bg: '#eff6ff', border: '#93c5fd', label: '#1e40af' },
}

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n || 0))

export default function InsightsPage() {
  const { insights, stats, loading, error } = useInsights()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Insights financieros ✨</h1>
        <p>Fintia analiza tus movimientos del mes y te da su opinión (con cariño).</p>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Ingresos del mes</span>
          <strong className={styles.cardValue} style={{ color: '#16a34a' }}>{fmt(stats?.income)}</strong>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Gastos del mes</span>
          <strong className={styles.cardValue} style={{ color: '#dc2626' }}>{fmt(stats?.expenses)}</strong>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Balance</span>
          <strong className={styles.cardValue} style={{ color: stats?.balance >= 0 ? '#16a34a' : '#dc2626' }}>
            {fmt(stats?.balance)}
          </strong>
        </div>
      </div>

      {loading && (
        <div className={styles.loadingBox}>
          <div className={styles.loadingDots}><span /><span /><span /></div>
          <p>Fintia está analizando tus finanzas...</p>
        </div>
      )}

      {error && !loading && (
        <p className={styles.error}>⚠️ {error}</p>
      )}

      {!loading && !error && insights.length === 0 && (
        <p className={styles.empty}>Registra algunas transacciones este mes para recibir insights 🙌</p>
      )}

      {!loading && !error && insights.length > 0 && (
        <div className={styles.insightsGrid}>
          {insights.map((item, i) => {
            const s = TYPE_STYLES[item.type] || TYPE_STYLES.tip
            return (
              <article
                key={i}
                className={styles.insightItem}
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className={styles.insightHeader}>
                  <span className={styles.insightIcon}>{item.icon}</span>
                  <h3 style={{ color: s.label }}>{item.title}</h3>
                </div>
                <p>{item.detail}</p>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}