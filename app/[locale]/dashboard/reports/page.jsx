'use client'

import { useState, useEffect, useMemo } from 'react'
import { Download, FileText, FileSpreadsheet, Zap, ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/lib/auth/AuthContext'
import { getTransactions, getCategoryExpenses, getMonthlyHistory } from '@/lib/supabase/transactions'
import { getAllBudgetsWithSpending } from '@/lib/supabase/budgets'
import { getCategoryById } from '@/lib/data/categories'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import styles from './page.module.css'

export const formatDateISO = (date) => date.toISOString().split('T')[0]

export const datePrefix = (amountDays = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - amountDays)
  return formatDateISO(d)
}

export const escapeCsvField = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return `"${str.replace(/"/g, '""')}"`
}

const imageToDataUrl = async (src) => {
  try {
    const response = await fetch(src)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error loading image:', error)
    return null
  }
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const computeTotals = (reportType, budgets = [], transactions = []) => {
  if (reportType === 'budgets') {
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.amount || 0), 0)
    const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0)
    return { totalBudget, totalSpent, totalProgress: totalBudget === 0 ? 0 : (totalSpent / totalBudget) * 100 }
  }

  const totalAmount = transactions.reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  const income = transactions.filter((tx) => tx.type === 'income').reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  const expenses = transactions.filter((tx) => tx.type === 'expense').reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  return { totalAmount, income, expenses }
}

export default function ReportsPage() {
  const t = useTranslations('Reports')
  const locale = useLocale()
  const { profile } = useAuth()

  const isPremium = profile?.subscription_tier === 'premium'
  const [from, setFrom] = useState(datePrefix(30))
  const [to, setTo] = useState(formatDateISO(new Date()))
  const [reportType, setReportType] = useState('complete')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [categoryData, setCategoryData] = useState({})
  const [historyData, setHistoryData] = useState([])

  const reportReady = isPremium && !loading && (reportType === 'budgets' ? budgets.length > 0 : transactions.length > 0)
  const rowCount = reportType === 'budgets' ? budgets.length : transactions.length
  const totals = useMemo(() => computeTotals(reportType, budgets, transactions), [reportType, budgets, transactions])

  const fetchReport = async () => {
    if (!isPremium) return
    if (!from || !to) {
      setError(t('errorDateRange'))
      return
    }

    setLoading(true)
    setError('')

    try {
      if (reportType === 'budgets') {
        const data = await getAllBudgetsWithSpending()
        setBudgets(data || [])
        setTransactions([])
        setCategoryData({})
        setHistoryData([])
      } else {
        const data = await getTransactions({
          filters: {
            type: reportType === 'income' ? 'income' : reportType === 'expenses' ? 'expense' : undefined,
            from,
            to,
          },
        })
        setTransactions(data || [])
        setBudgets([])

        const categoryExpenses = await getCategoryExpenses(from, to)
        setCategoryData(categoryExpenses || {})

        const history = await getMonthlyHistory(6)
        setHistoryData(history || [])
      }
    } catch (err) {
      console.error(err)
      setError(t('errorLoad'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isPremium) {
      fetchReport()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium])

  const inReportRows = useMemo(() => {
    if (reportType === 'budgets') {
      return budgets.map((b) => {
        const cat = getCategoryById(b.category_id)
        return {
          category: cat?.name ?? b.category_id,
          period: b.period,
          amount: Number(b.amount),
          spent: Number(b.spent),
          progress: `${Math.min(100, Number(b.percentage || 0)).toFixed(1)}%`,
        }
      })
    }

    return transactions.map((tx) => {
      const cat = getCategoryById(tx.category_id)
      return {
        date: tx.date,
        type: tx.type,
        category: cat?.name ?? tx.category_id,
        description: tx.description || '-',
        amount: Number(tx.amount),
      }
    })
  }, [reportType, budgets, transactions])

  const downloadCsv = () => {
    const now = new Date().toISOString().split('T')[0]
    const filename = `fintia-report-${reportType}-${from}-${to}-${now}.csv`
    let csv = ''

    const firstLine = [
      `Fintia - ${t('brandSubtitle')}`,
      `Reporte: ${t(`reportTypes.${reportType}`)}`,
      `Rango: ${from} a ${to}`,
      `Generado: ${now}`,
    ].join(',') + '\n'

    if (reportType === 'budgets') {
      csv += [t('colCategory'), t('colPeriod'), t('colBudget'), t('colSpent'), t('colProgress')].join(',') + '\n'
      for (const row of inReportRows) {
        csv += [row.category, row.period, row.amount, row.spent, row.progress].map(escapeCsvField).join(',') + '\n'
      }
    } else {
      csv += [t('colDate'), t('colType'), t('colCategory'), t('colDescription'), t('colAmount')].join(',') + '\n'
      for (const row of inReportRows) {
        csv += [row.date, row.type, row.category, row.description, row.amount].map(escapeCsvField).join(',') + '\n'
      }
    }

    csv = firstLine + csv

    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, filename)
    setNotification({ type: 'success', message: t('notifyCsv') })
  }

  const downloadXls = () => {
    const now = new Date().toISOString().split('T')[0]
    const filename = `fintia-report-${reportType}-${from}-${to}-${now}.xls`

    const tableHeader = reportType === 'budgets'
      ? [t('colCategory'), t('colPeriod'), t('colBudget'), t('colSpent'), t('colProgress')]
      : [t('colDate'), t('colType'), t('colCategory'), t('colDescription'), t('colAmount')]

    const rows = inReportRows

    const headerHtml = `<tr><td colspan="${tableHeader.length}" style="font-weight:bold;">Fintia - ${t('brandSubtitle')} | ${t('reportTypes.' + reportType)} | ${from} -> ${to}</td></tr>`;
    const htmlTable = `
      <table>
        <thead>${headerHtml}<tr>${tableHeader.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map((row) => {
            if (reportType === 'budgets') {
              return `<tr><td>${row.category}</td><td>${row.period}</td><td>${row.amount}</td><td>${row.spent}</td><td>${row.progress}</td></tr>`
            }
            return `<tr><td>${row.date}</td><td>${row.type}</td><td>${row.category}</td><td>${row.description}</td><td>${row.amount}</td></tr>`
          }).join('')}
        </tbody>
      </table>`

    const blob = new Blob(['\ufeff', htmlTable], { type: 'application/vnd.ms-excel' })
    downloadBlob(blob, filename)
    setNotification({ type: 'success', message: t('notifyXlsx') })
  }

  const downloadPdf = async () => {
  const now = new Date().toISOString().split('T')[0]
  const filename = `fintia-report-${reportType}-${from}-${to}-${now}.pdf`

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const marginLeft = 40
  const marginRight = 40
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let currentY = 30

  const ensureSpace = (needed = 80) => {
    if (currentY + needed > pageHeight - 40) {
      doc.addPage()
      currentY = 40
    }
  }

  // Logo
  const logoData = await imageToDataUrl('/images/NombreLogo.png')
  if (logoData) {
    doc.addImage(logoData, 'PNG', marginLeft, currentY, 95, 48)
  }

  currentY += 75

  doc.setTextColor(0)
  doc.setFontSize(20)
  doc.text(t('title'), marginLeft, currentY)

  currentY += 26
  doc.setFontSize(12)
  doc.text(`${t('fromDate')}: ${from}`, marginLeft, currentY)

  currentY += 18
  doc.text(`${t('toDate')}: ${to}`, marginLeft, currentY)

  currentY += 18
  doc.text(`${t('reportType')}: ${t(`reportTypes.${reportType}`)}`, marginLeft, currentY)

  currentY += 30

  const columns = reportType === 'budgets'
    ? [t('colCategory'), t('colPeriod'), t('colBudget'), t('colSpent'), t('colProgress')]
    : [t('colDate'), t('colType'), t('colCategory'), t('colDescription'), t('colAmount')]

  const rows = inReportRows.map((row) => {
    if (reportType === 'budgets') {
      return [row.category, row.period, row.amount, row.spent, row.progress]
    }
    return [row.date, row.type, row.category, row.description, row.amount]
  })

  // Categorías
  if (reportType !== 'budgets' && Object.keys(categoryData).length > 0) {
    ensureSpace(140)

    doc.setFontSize(13)
    doc.text(t('chartExpensesByCategory'), marginLeft, currentY)
    currentY += 16

    const catRows = Object.entries(categoryData).map(([id, amount]) => [
      getCategoryById(id)?.name || id,
      new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
        style: 'currency',
        currency: 'COP',
      }).format(amount),
    ])

    autoTable(doc, {
      head: [[t('colCategory'), t('colAmount')]],
      body: catRows,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [40, 84, 113],
        textColor: 255,
      },
      margin: { left: marginLeft, right: marginRight },
    })

    currentY = (doc.lastAutoTable?.finalY || currentY) + 30
  }

  // Gráfico
  if (reportType !== 'budgets' && historyData.length > 0) {
    ensureSpace(220)

    doc.setFontSize(13)
    doc.setTextColor(0)
    doc.text(t('chartIncomeVsExpenses'), marginLeft, currentY)
    currentY += 20

    const maxValue = Math.max(
      ...historyData.map((d) => Math.max(d.income || 0, d.expenses || 0)),
      1
    )

    const chartX = marginLeft
    const chartY = currentY
    const chartWidth = pageWidth - marginLeft - marginRight
    const chartHeight = 140
    const barSpace = chartWidth / historyData.length

    historyData.forEach((h, index) => {
      const x = chartX + index * barSpace
      const yBase = chartY + chartHeight
      const incomeHeight = ((h.income || 0) / maxValue) * chartHeight
      const expenseHeight = ((h.expenses || 0) / maxValue) * chartHeight

      doc.setFillColor('#9AC2C9')
      doc.rect(x + barSpace * 0.12, yBase - incomeHeight, barSpace * 0.25, incomeHeight, 'F')

      doc.setFillColor('#FFCB47')
      doc.rect(x + barSpace * 0.50, yBase - expenseHeight, barSpace * 0.25, expenseHeight, 'F')

      doc.setFontSize(8)
      doc.setTextColor('#374151')
      doc.text(h.month.substring(0, 3), x + barSpace * 0.18, yBase + 14)
    })

    currentY += chartHeight + 40
  }

  // Tabla principal
  ensureSpace(120)

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: currentY,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [40, 84, 113],
      textColor: 255,
    },
    margin: { left: marginLeft, right: marginRight },
  })

  doc.save(filename)
  setNotification({ type: 'success', message: t('notifyPdf') })
}

  if (!isPremium) {
    return (
      <DashboardLayout>
        <div className={styles.premiumGate}>
          <div className={styles.premiumIcon}>
            <Zap size={36} />
          </div>
          <h1>{t('title')}</h1>
          <p>{t('premiumOnly')}</p>
          <button className={styles.upgradeBtn}>
            {t('upgradeButton')} <ArrowRight size={16} />
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className={styles.page}>
    <div className={styles.header}>
        <div>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
        </div>
    </div>

    <div className={styles.controls}>
        <div className={styles.controlGroup}>
        <label>{t('fromDate')}</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className={styles.controlGroup}>
        <label>{t('toDate')}</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className={styles.controlGroup}>
        <label>{t('reportType')}</label>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="complete">{t('reportTypes.complete')}</option>
            <option value="income">{t('reportTypes.income')}</option>
            <option value="expenses">{t('reportTypes.expenses')}</option>
            <option value="budgets">{t('reportTypes.budgets')}</option>
        </select>
        </div>
        <button className={styles.generateBtn} onClick={fetchReport} disabled={loading}>
        <Download size={16} /> {loading ? t('loading') : t('generate')}
        </button>
    </div>

    {error && <div className={styles.error}>{error}</div>}

    {notification && (
        <div className={styles.notification + ' ' + styles[notification.type]}>
        {notification.message}
        </div>
    )}

    {loading && <p className={styles.status}>{t('loading')}</p>}

    {!loading && reportReady && (
        <>
        <div className={styles.cardSummary}>
            <div>
            <strong>{t('summaryCount')}:</strong> {rowCount}
            </div>
            {reportType === 'budgets' ? (
            <>
                <div>
                <strong>{t('summaryBudget')}:</strong> {new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format(totals.totalBudget || 0)}
                </div>
                <div>
                <strong>{t('summarySpent')}:</strong> {new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format(totals.totalSpent || 0)}
                </div>
                <div>
                <strong>{t('summaryProgress')}:</strong> {totals.totalProgress.toFixed(2)}%
                </div>
            </>
            ) : (
            <>
                <div>
                <strong>{t('summaryIncome')}:</strong> {new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format(totals.income || 0)}
                </div>
                <div>
                <strong>{t('summaryExpenses')}:</strong> {new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format(totals.expenses || 0)}
                </div>
                <div>
                <strong>{t('summaryBalance')}:</strong> {new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format((totals.income || 0) - (totals.expenses || 0))}
                </div>
            </>
            )}
        </div>

        <div className={styles.actions}>
            <button className={styles.exportBtn} onClick={downloadCsv}>
            <FileText size={16} /> {t('downloadCsv')}
            </button>
            <button className={styles.exportBtn} onClick={downloadXls}>
            <FileSpreadsheet size={16} /> {t('downloadXlsx')}
            </button>
            <button className={styles.exportBtn} onClick={downloadPdf} disabled={rowCount === 0}>
            <FileText size={16} /> {t('downloadPdf')}
            </button>
        </div>
        </>
    )}

    {!loading && !reportReady && <p className={styles.status}>{t('noData')}</p>}

    {!loading && reportReady && (
        <div className={styles.preview}>
        <table>
            <thead>
            <tr>
                {reportType === 'budgets' ? (
                <>
                    <th>{t('colCategory')}</th>
                    <th>{t('colPeriod')}</th>
                    <th>{t('colBudget')}</th>
                    <th>{t('colSpent')}</th>
                    <th>{t('colProgress')}</th>
                </>
                ) : (
                <>
                    <th>{t('colDate')}</th>
                    <th>{t('colType')}</th>
                    <th>{t('colCategory')}</th>
                    <th>{t('colDescription')}</th>
                    <th>{t('colAmount')}</th>
                </>
                )}
            </tr>
            </thead>
            <tbody>
            {inReportRows.map((row, index) => (
                <tr key={`${index}-${row.category || row.date}`}>
                {reportType === 'budgets' ? (
                    <>
                    <td>{row.category}</td>
                    <td>{row.period}</td>
                    <td>{new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format(row.amount)}</td>
                    <td>{new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format(row.spent)}</td>
                    <td>{row.progress}</td>
                    </>
                ) : (
                    <>
                    <td>{row.date}</td>
                    <td>{row.type}</td>
                    <td>{row.category}</td>
                    <td>{row.description}</td>
                    <td>{new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'currency', currency: 'COP' }).format(row.amount)}</td>
                    </>
                )}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    )}
    </div>
  )
}
