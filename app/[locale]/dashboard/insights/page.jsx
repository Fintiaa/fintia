'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useInsights } from '@/lib/hooks/useInsights'
import { useTranslations, useLocale } from 'next-intl'
import styles from './page.module.css'

export default function InsightsPage() {
  const t = useTranslations('Insights')
  const locale = useLocale()

  const { insights, stats, loading, error } = useInsights()

  const formatNumber = (value) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO').format(
      Number(value || 0)
    )

  return (
    <div className={styles.page}>
    {/* 🔹 HEADER */}
    <div className={styles.header}>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
    </div>

    {/* 🔹 SUMMARY */}
    <div className={styles.summaryGrid}>
        <div className={styles.card}>
        <span className={styles.cardLabel}>
            {t('totalIncome')}
        </span>
        <strong className={styles.cardValue}>
            {formatNumber(stats?.income)}
        </strong>
        </div>

        <div className={styles.card}>
        <span className={styles.cardLabel}>
            {t('totalExpenses')}
        </span>
        <strong className={styles.cardValue}>
            {formatNumber(stats?.expenses)}
        </strong>
        </div>

        <div className={styles.card}>
        <span className={styles.cardLabel}>
            {t('balance')}
        </span>
        <strong className={styles.cardValue}>
            {formatNumber(stats?.balance)}
        </strong>
        </div>
    </div>

    {/* 🔹 STATES */}
    {loading && (
        <p className={styles.status}>
        {t('loading')}
        </p>
    )}

    {error && (
        <p className={styles.error}>
        {error}
        </p>
    )}

    {!loading && !error && insights.length === 0 && (
        <p className={styles.empty}>
        {t('noInsights')}
        </p>
    )}

    {/* 🔹 INSIGHTS */}
    {!loading && !error && insights.length > 0 && (
        <div className={styles.insightsGrid}>
        {insights.map((item, index) => (
            <article
            key={`${item.title}-${index}`}
            className={styles.insightItem}
            >
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            </article>
        ))}
        </div>
    )}
    </div>
  )
}