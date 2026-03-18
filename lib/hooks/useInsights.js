'use client'

import { useState, useEffect } from 'react'
import { getTransactions, getStatsForPeriod, getCategoryExpenses } from '@/lib/supabase/transactions'
import { getCategoryById } from '@/lib/data/categories'
import { useLocale } from 'next-intl'

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function buildInsights(transactions, stats, categoryData, locale) {
  const insights = []

  const totalExpenses = stats.expenses
  const totalIncome = stats.income
  const balance = stats.balance

  if (totalIncome > 0) {
    const savingRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    insights.push({
      title: 'Tasa de ahorro',
      detail: `Tu tasa de ahorro actual es de ${savingRate}%. Si mantienes este ritmo podrías ahorrar más con pequeños ajustes en las categorías más gastadoras.`,
    })

    if (savingRate < 10) {
      insights.push({
        title: 'Ahorro bajo',
        detail: 'Tu ahorro es menor al 10%. Intenta eliminar un gasto recurrente no esencial o ajustar presupuesto en entretenimiento.',
      })
    } else if (savingRate >= 30) {
      insights.push({
        title: 'Buen progreso',
        detail: 'Excelente, estás ahorrando más del 30%. Sigue así y evalúa inversiones pequeñas con el dinero ahorrado.',
      })
    }
  }

  const categoryEntries = Object.entries(categoryData).sort((a, b) => b[1] - a[1])
  if (categoryEntries.length > 0) {
    const [topCategoryId, topAmount] = categoryEntries[0]
    const topCategory = getCategoryById(topCategoryId)
    insights.push({
      title: 'Mayor gasto por categoría',
      detail: `Gastaste ${formatCurrency(topAmount, locale)} en ${topCategory?.name || topCategoryId} (%${((topAmount || 0) / Math.max(1, totalExpenses) * 100).toFixed(1)} del total). Revisa si puedes bajar un 10% en esta categoría.`,
    })

    if (categoryEntries.length > 1) {
      const [secondId, secondAmount] = categoryEntries[1]
      const secondCategory = getCategoryById(secondId)
      insights.push({
        title: 'Segunda categoría con más peso',
        detail: `También estás gastando ${formatCurrency(secondAmount, locale)} en ${secondCategory?.name || secondId}. Tal vez una categoría menos presente sea mejor prioridad para recortar.`,
      })
    }
  }

  if (balance > 0) {
    insights.push({
      title: 'Balance positivo',
      detail: `Tu balance actual es ${formatCurrency(balance, locale)}. Considera destinar un 10-20% a un fondo de emergencia o meta de ahorro.`,
    })
  } else if (balance < 0) {
    insights.push({
      title: 'Balance negativo',
      detail: `Tu balance actual es ${formatCurrency(balance, locale)}. Necesitas ajustar gastos rápido para evitar quedarte sin liquidez.`,
    })
  }

  // restringir de 3 a 5 insights
  return insights.slice(0, 5)
}

export function useInsights() {
  const locale = useLocale()
  const [insights, setInsights] = useState([])
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })
  const [categoryData, setCategoryData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let canceled = false

    const loadInsights = async () => {
      setLoading(true)
      setError('')
      try {
        const transactions = await getTransactions({ limit: 500 })

        const now = new Date()
        const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const to = now.toISOString().split('T')[0]

        const statsData = await getStatsForPeriod(from, to)
        const catData = await getCategoryExpenses(from, to)

        if (canceled) return

        setStats(statsData)
        setCategoryData(catData)

        const generated = buildInsights(transactions, statsData, catData, locale)
        setInsights(generated)
      } catch (err) {
        if (canceled) return
        setError(err.message || 'No se pudieron generar insights')
        setInsights([])
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    loadInsights()

    return () => {
      canceled = true
    }
  }, [locale])

  return { insights, stats, categoryData, loading, error }
}
