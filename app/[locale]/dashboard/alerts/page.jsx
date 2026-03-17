'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Check,
  Zap,
  ArrowRight,
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/lib/auth/AuthContext'
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from '@/lib/supabase/alerts'
import { getCategoryById } from '@/lib/data/categories'
import styles from './page.module.css'

export default function AlertsPage() {
  const { profile } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'warning' | 'exceeded'

  const isPremium = profile?.subscription_tier === 'premium'

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts()
      setAlerts(data)
    } catch (err) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isPremium) fetchAlerts()
    else setLoading(false)
  }, [isPremium])

  const handleMarkRead = async (id) => {
    try {
      await markAlertAsRead(id)
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      )
    } catch (err) {
      console.error('Error marking alert as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsAsRead()
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })))
    } catch (err) {
      console.error('Error marking all alerts as read:', err)
    }
  }

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return !a.is_read
    if (filter === 'warning') return a.type === 'warning'
    if (filter === 'exceeded') return a.type === 'exceeded'
    return true
  })

  const unreadCount = alerts.filter((a) => !a.is_read).length

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(n)

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Alertas</h1>
            <p>Notificaciones de sobre-gasto en tus presupuestos</p>
          </div>
          {isPremium && unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
              <Check size={16} />
              Marcar todo como leído
            </button>
          )}
        </div>

        {!isPremium ? (
          <div className={styles.premiumGate}>
            <div className={styles.premiumIcon}>
              <Zap size={32} />
            </div>
            <h2>Funcionalidad Premium</h2>
            <p>
              Recibe alertas inteligentes cuando te acerques o superes los límites
              de tus presupuestos configurados.
            </p>
            <ul className={styles.premiumFeatures}>
              <li><CheckCircle size={16} /> Alerta al 80% del presupuesto</li>
              <li><CheckCircle size={16} /> Alerta cuando excedas el límite</li>
              <li><CheckCircle size={16} /> Historial de alertas completo</li>
              <li><CheckCircle size={16} /> Generación en tiempo real</li>
            </ul>
            <button className={styles.upgradeBtn}>
              Actualizar a Premium <ArrowRight size={18} />
            </button>
          </div>
        ) : loading ? (
          <p className={styles.loadingText}>Cargando alertas...</p>
        ) : (
          <>
            {/* Filters */}
            <div className={styles.filters}>
              {[
                { value: 'all', label: 'Todas' },
                { value: 'unread', label: `Sin leer (${unreadCount})` },
                { value: 'warning', label: 'Advertencias' },
                { value: 'exceeded', label: 'Excedidos' },
              ].map((f) => (
                <button
                  key={f.value}
                  className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredAlerts.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={48} className={styles.emptyIcon} />
                <h3>
                  {filter === 'all'
                    ? 'No hay alertas'
                    : 'No hay alertas con este filtro'}
                </h3>
                <p>
                  {filter === 'all'
                    ? 'Las alertas se generan automáticamente cuando te acerques a los límites de tus presupuestos.'
                    : 'Prueba con otro filtro para ver más alertas.'}
                </p>
              </div>
            ) : (
              <div className={styles.alertsList}>
                {filteredAlerts.map((alert) => {
                  const cat = getCategoryById(alert.category_id)
                  const isExceeded = alert.type === 'exceeded'

                  return (
                    <div
                      key={alert.id}
                      className={`${styles.alertCard} ${!alert.is_read ? styles.alertUnread : ''} ${isExceeded ? styles.alertExceeded : styles.alertWarning}`}
                    >
                      <div className={styles.alertIcon}>
                        {isExceeded ? (
                          <XCircle size={22} />
                        ) : (
                          <AlertTriangle size={22} />
                        )}
                      </div>
                      <div className={styles.alertContent}>
                        <div className={styles.alertTop}>
                          <span className={styles.alertCategoryBadge}>
                            {cat?.icon} {cat?.name || alert.category_id}
                          </span>
                          <span className={styles.alertTime}>{formatDate(alert.created_at)}</span>
                        </div>
                        <p className={styles.alertMessage}>{alert.message}</p>
                        <div className={styles.alertDetails}>
                          <span>Gastado: <strong>{fmt(Number(alert.amount_spent))}</strong></span>
                          <span>Límite: <strong>{fmt(Number(alert.budget_amount))}</strong></span>
                          <span className={isExceeded ? styles.percentExceeded : styles.percentWarning}>
                            {alert.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {!alert.is_read && (
                        <button
                          className={styles.readBtn}
                          onClick={() => handleMarkRead(alert.id)}
                          title="Marcar como leída"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
