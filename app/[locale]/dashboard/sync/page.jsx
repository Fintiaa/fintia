'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Mail,
  RefreshCw,
  Unlink,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  ArrowRight,
  XCircle,
  SkipForward,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function SyncPage() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const [connection, setConnection] = useState(null)
  const [syncedEmails, setSyncedEmails] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  const isPremium = profile?.subscription_tier === 'premium'

  // Check URL params for success/error from OAuth callback
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'connected') {
      setMessage({ type: 'success', text: 'Gmail conectado exitosamente.' })
    } else if (error) {
      const errorMessages = {
        access_denied: 'Acceso denegado. Intenta de nuevo.',
        missing_params: 'Error en la conexión. Intenta de nuevo.',
        auth_mismatch: 'Error de autenticación. Inicia sesión de nuevo.',
        token_exchange: 'Error al conectar con Gmail. Intenta de nuevo.',
        storage_error: 'Error al guardar la conexión. Intenta de nuevo.',
      }
      setMessage({ type: 'error', text: errorMessages[error] || 'Error desconocido.' })
    }
  }, [searchParams])

  // Fetch connection status and synced emails
  useEffect(() => {
    async function fetchData() {
      try {
        const [statusRes, supabase] = await Promise.all([
          fetch('/api/gmail/status'),
          Promise.resolve(createClient()),
        ])

        const { connection: conn } = await statusRes.json()
        setConnection(conn)

        if (conn) {
          const { data } = await supabase
            .from('synced_emails')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

          setSyncedEmails(data || [])
        }
      } catch (err) {
        console.error('Error fetching sync data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

  // Auto-sync every 5 minutes when connected
  useEffect(() => {
    if (!connection || !isPremium) return

    const autoSync = async () => {
      try {
        const res = await fetch('/api/gmail/sync', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.summary?.created > 0) {
            setSyncResult(data.summary)
            setMessage({
              type: 'success',
              text: `Auto-sync: ${data.summary.created} nuevas transacciones.`,
            })
            // Refresh synced emails list
            const supabase = createClient()
            const { data: emails } = await supabase
              .from('synced_emails')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(20)
            setSyncedEmails(emails || [])
          }
        }
      } catch {
        // Silent fail for auto-sync
      }
    }

    const interval = setInterval(autoSync, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [connection, isPremium])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/gmail/auth')
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Error al conectar' })
        return
      }

      window.location.href = data.url
    } catch {
      setMessage({ type: 'error', text: 'Error al iniciar conexión con Gmail' })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('¿Deseas desconectar tu cuenta de Gmail?')) return

    try {
      const res = await fetch('/api/gmail/disconnect', { method: 'POST' })
      if (res.ok) {
        setConnection(null)
        setSyncedEmails([])
        setMessage({ type: 'success', text: 'Gmail desconectado.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al desconectar' })
    }
  }

  const handleSync = async (full = false) => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch(`/api/gmail/sync${full ? '?full=true' : ''}`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Error al sincronizar' })
        return
      }

      setSyncResult(data.summary)
      setMessage({
        type: 'success',
        text: `Sincronización completa: ${data.summary.created} transacciones creadas.`,
      })

      // Refresh synced emails list
      const supabase = createClient()
      const { data: emails } = await supabase
        .from('synced_emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      setSyncedEmails(emails || [])

      // Refresh connection status
      const statusRes = await fetch('/api/gmail/status')
      const { connection: conn } = await statusRes.json()
      setConnection(conn)
    } catch {
      setMessage({ type: 'error', text: 'Error durante la sincronización' })
    } finally {
      setSyncing(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created': return <CheckCircle size={16} className={styles.statusCreated} />
      case 'skipped': return <SkipForward size={16} className={styles.statusSkipped} />
      case 'error': return <XCircle size={16} className={styles.statusError} />
      default: return <Clock size={16} className={styles.statusPending} />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'created': return 'Registrada'
      case 'skipped': return 'Omitida'
      case 'error': return 'Error'
      default: return 'Pendiente'
    }
  }

  return (
    
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Sincronización Gmail</h1>
          <p>Importa transacciones automáticamente desde correos de tu banco</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`${styles.messageBanner} ${styles[message.type]}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className={styles.dismissBtn}>×</button>
          </div>
        )}

        {/* Premium Gate */}
        {!isPremium ? (
          <div className={styles.premiumGate}>
            <div className={styles.premiumIcon}>
              <Zap size={32} />
            </div>
            <h2>Funcionalidad Premium</h2>
            <p>
              La sincronización automática de transacciones desde Gmail está disponible
              en el plan Premium. Conecta tu correo y deja que Fintia registre tus
              gastos automáticamente.
            </p>
            <ul className={styles.premiumFeatures}>
              <li><CheckCircle size={16} /> Lectura automática de correos bancarios</li>
              <li><CheckCircle size={16} /> Categorización inteligente con AI</li>
              <li><CheckCircle size={16} /> Soporte para bancos colombianos (Bancolombia, Lulo Bank, Davivienda, Nequi...)</li>
              <li><CheckCircle size={16} /> Seguridad: solo lectura, tokens encriptados</li>
            </ul>
            <button className={styles.upgradeBtn}>
              Actualizar a Premium
              <ArrowRight size={18} />
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loadingState}>
            <RefreshCw size={24} className={styles.spinner} />
            <p>Cargando...</p>
          </div>
        ) : (
          <>
            {/* Connection Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2><Mail size={20} /> Conexión de Gmail</h2>
              </div>

              {!connection ? (
                <div className={styles.connectSection}>
                  <div className={styles.connectInfo}>
                    <Shield size={40} className={styles.shieldIcon} />
                    <h3>Conecta tu cuenta de Gmail</h3>
                    <p>
                      Fintia leerá automáticamente los correos de notificaciones
                      bancarias para registrar tus transacciones. Solo solicitamos
                      permiso de <strong>lectura</strong>.
                    </p>
                    <div className={styles.bankLogos}>
                      Bancos soportados: Bancolombia, Lulo Bank, Davivienda, BBVA, Nequi, Daviplata, Banco de Bogotá
                    </div>
                  </div>
                  <button
                    className={styles.connectBtn}
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    <Mail size={18} />
                    {connecting ? 'Conectando...' : 'Conectar Gmail'}
                  </button>
                </div>
              ) : (
                <div className={styles.connectedSection}>
                  <div className={styles.connectionStatus}>
                    <div className={styles.connectionInfo}>
                      <CheckCircle size={20} className={styles.connectedIcon} />
                      <div>
                        <p className={styles.connectedEmail}>{connection.gmail_email}</p>
                        <p className={styles.connectedMeta}>
                          Conectado el {formatDate(connection.created_at)}
                        </p>
                        {connection.last_sync_at && (
                          <p className={styles.connectedMeta}>
                            Última sincronización: {formatDate(connection.last_sync_at)}
                          </p>
                        )}
                        {connection.sync_error && (
                          <p className={styles.syncError}>
                            <AlertCircle size={14} /> {connection.sync_error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={styles.connectionActions}>
                      <button
                        className={styles.syncBtn}
                        onClick={() => handleSync(false)}
                        disabled={syncing}
                      >
                        <RefreshCw size={16} className={syncing ? styles.spinner : ''} />
                        {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                      </button>
                      <button
                        className={styles.syncBtn}
                        onClick={() => handleSync(true)}
                        disabled={syncing}
                        style={{ background: 'var(--gray-600, #4b5563)' }}
                      >
                        <RefreshCw size={16} />
                        Sync completo (90 días)
                      </button>
                      <button className={styles.disconnectBtn} onClick={handleDisconnect}>
                        <Unlink size={16} />
                        Desconectar
                      </button>
                    </div>
                  </div>

                  {/* Sync Result */}
                  {syncResult && (
                    <div className={styles.syncResult}>
                      <h4>Resultado de sincronización</h4>
                      <div className={styles.syncStats}>
                        <div className={styles.syncStat}>
                          <span className={styles.syncStatValue}>{syncResult.total}</span>
                          <span className={styles.syncStatLabel}>Correos procesados</span>
                        </div>
                        <div className={styles.syncStat}>
                          <span className={`${styles.syncStatValue} ${styles.created}`}>{syncResult.created}</span>
                          <span className={styles.syncStatLabel}>Transacciones creadas</span>
                        </div>
                        <div className={styles.syncStat}>
                          <span className={styles.syncStatValue}>{syncResult.skipped}</span>
                          <span className={styles.syncStatLabel}>Omitidos</span>
                        </div>
                        <div className={styles.syncStat}>
                          <span className={`${styles.syncStatValue} ${syncResult.errors > 0 ? styles.errored : ''}`}>{syncResult.errors}</span>
                          <span className={styles.syncStatLabel}>Errores</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Synced Emails History */}
            {syncedEmails.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Historial de sincronización</h2>
                </div>
                <div className={styles.emailsList}>
                  {syncedEmails.map((email) => (
                    <div key={email.id} className={styles.emailItem}>
                      <div className={styles.emailStatus}>
                        {getStatusIcon(email.status)}
                      </div>
                      <div className={styles.emailInfo}>
                        <p className={styles.emailSubject}>{email.subject || 'Sin asunto'}</p>
                        <p className={styles.emailMeta}>
                          {email.sender?.split('<')[0]?.trim() || 'Desconocido'} · {formatDate(email.received_at)}
                        </p>
                      </div>
                      <div className={styles.emailStatusLabel}>
                        <span className={`${styles.badge} ${styles[`badge_${email.status}`]}`}>
                          {getStatusLabel(email.status)}
                        </span>
                        {email.parsed_data?.amount && (
                          <span className={styles.emailAmount}>
                            {email.parsed_data.type === 'income' ? '+' : '-'}
                            ${Number(email.parsed_data.amount).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    
  )
}
