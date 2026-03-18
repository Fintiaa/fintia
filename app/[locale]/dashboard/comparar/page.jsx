'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { calculatePercentage, getMonthlyTotal } from '@/lib/reports'
import ComparisonChart from '@/components/reports/ComparisonChart'
import ComparisonForm from '@/components/reports/ComparisonForm'
import PercentageChange from '@/components/reports/PercentageChange'
import styles from './page.module.css'

export default function CompararPage() {
  const { profile } = useAuth()
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
        <a href="/dashboard/settings" className={styles.upgradeBtn}>Ver planes</a>
      </div>
    )
  }

  const handleCompare = async ({ period1, period2, chartType }) => {
    setLoading(true)
    setError('')
    try {
      const year = new Date().getFullYear()
      const [income1, expense1, income2, expense2] = await Promise.all([
        getMonthlyTotal(year, period1, 'income'),
        getMonthlyTotal(year, period1, 'expense'),
        getMonthlyTotal(year, period2, 'income'),
        getMonthlyTotal(year, period2, 'expense'),
      ])

      const balance1 = income1 - expense1
      const balance2 = income2 - expense2
      const pctIncome = calculatePercentage(income1, income2)
      const pctExpense = calculatePercentage(expense1, expense2)
      const pctBalance = calculatePercentage(balance1, balance2)

      setData({
        chartType,
        income: [income1, income2],
        expenses: [expense1, expense2],
        balances: [balance1, balance2],
        pctIncome,
        pctExpense,
        pctBalance,
        period1,
        period2,
      })
    } catch {
      setError('No se pudo cargar la comparación. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Comparar períodos</h1>
        <p className={styles.subtitle}>Analiza cómo evolucionaron tus finanzas entre dos meses</p>
      </div>

      <ComparisonForm onCompare={handleCompare} />

      {error && <p className={styles.error}>{error}</p>}

      {loading && <p className={styles.loading}>Cargando comparación…</p>}

      {data && (
        <div className={styles.results}>
          <h2 className={styles.resultsTitle}>
            {MONTHS[data.period1 - 1]} vs {MONTHS[data.period2 - 1]}
          </h2>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Ingresos</p>
              <p className={styles.statValue}>{fmt(data.income[0])}</p>
              <p className={styles.statValue2}>{fmt(data.income[1])}</p>
              <PercentageChange value={data.pctIncome} />
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Gastos</p>
              <p className={styles.statValue}>{fmt(data.expenses[0])}</p>
              <p className={styles.statValue2}>{fmt(data.expenses[1])}</p>
              <PercentageChange value={data.pctExpense} />
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Balance</p>
              <p className={styles.statValue}>{fmt(data.balances[0])}</p>
              <p className={styles.statValue2}>{fmt(data.balances[1])}</p>
              <PercentageChange value={data.pctBalance} />
            </div>
          </div>

          <div className={styles.chartCard}>
            <ComparisonChart data={data.income} chartType={data.chartType} />
          </div>
        </div>
      )}
    </div>
  )
}
