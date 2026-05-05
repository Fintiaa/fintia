'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Save, CheckCircle, Zap, Star, Crown, MessageCircle, Phone, Bell, Copy, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { api } from '@/lib/api/client'
import ReminderToggle from '@/components/reminders/ReminderToggle'
import styles from './page.module.css'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: '$0',
    period: 'para siempre',
    icon: Star,
    color: 'planFree',
    features: [
      'Registro manual de transacciones',
      'Categorización de gastos',
      'Dashboard básico con gráficas',
      'Categorías personalizadas',
      'Transacciones recurrentes',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$2.000 COP',
    period: 'por mes',
    icon: Crown,
    color: 'planPremium',
    features: [
      'Todo lo del plan gratuito',
      'Sincronización automática con Gmail',
      'Presupuestos por categoría',
      'Alertas inteligentes de gasto',
      'Exportación de reportes PDF/Excel',
      'Comparación entre períodos',
      'Objetivos de ahorro',
      'Insights financieros con AI',
    ],
  },
]

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [planLoading, setPlanLoading] = useState(false)
  const [planSuccess, setPlanSuccess] = useState(false)

  const [whatsapp, setWhatsapp] = useState('')
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  const [whatsappSaved, setWhatsappSaved] = useState(false)
  const [joinCopied, setJoinCopied] = useState(false)

  const currentPlan = profile?.subscription_tier || 'free'
  const isPremium = currentPlan === 'premium'

  useEffect(() => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
    if (profile?.whatsapp_number) {
      setWhatsapp(profile.whatsapp_number)
    }
  }, [profile])

  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')

  const getInitials = () => {
    if (firstName.trim() && lastName.trim()) return (firstName[0] + lastName[0]).toUpperCase()
    if (firstName.trim()) return firstName[0].toUpperCase()
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const displayName = firstName.trim() || user?.email?.split('@')[0] || 'Usuario'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!firstName.trim()) { setError('El nombre es obligatorio.'); return }
    setLoading(true); setError(''); setSaved(false)
    try {
      await api.put('/profile', { full_name: fullName })
      refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsappSave = async () => {
    let cleaned = whatsapp.replace(/\s/g, '')
    // Auto-prepend +57 if no country code
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+57' + cleaned
      setWhatsapp(cleaned)
    }
    if (cleaned && !/^\+\d{7,15}$/.test(cleaned)) {
      setError('Número inválido. Ej: 3001234567 o +573001234567')
      return
    }
    setWhatsappLoading(true); setError('')
    try {
      await api.put('/profile', { whatsapp_number: cleaned || null })
      setWhatsappSaved(true)
      setTimeout(() => setWhatsappSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar el número.')
    } finally {
      setWhatsappLoading(false)
    }
  }

  const copyJoinCode = () => {
    navigator.clipboard.writeText('join also-many')
    setJoinCopied(true)
    setTimeout(() => setJoinCopied(false), 2000)
  }

  const handleChangePlan = async (planId) => {
    if (planId === currentPlan) return
    if (planId === 'premium') {
      setPlanLoading(true)
      try {
        const { checkoutUrl } = await api.post('/payments/create-checkout', {})
        window.location.href = checkoutUrl
      } catch (err) {
        setError(err.message || 'Error al iniciar el pago.')
        setPlanLoading(false)
      }
      return
    }
    setPlanLoading(true); setPlanSuccess(false)
    try {
      await api.put('/profile', { subscription_tier: planId })
      refreshProfile()
      setPlanSuccess(true)
      setTimeout(() => setPlanSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al cambiar de plan.')
    } finally {
      setPlanLoading(false)
    }
  }

  return (
    
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Configuración</h1>
          <p>Administra tu perfil y preferencias</p>
        </div>

        {/* Perfil */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Información Personal</h2>

          <div className={styles.avatarSection}>
            <div className={styles.avatar}>{getInitials()}</div>
            <div>
              <p className={styles.avatarName}>{displayName}</p>
              <p className={styles.avatarEmail}>{user?.email}</p>
              <span className={`${styles.planBadge} ${isPremium ? styles.planBadgePremium : ''}`}>
                {isPremium ? <><Crown size={11} /> Premium</> : <><Star size={11} /> Gratuito</>}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="first-name">Nombre *</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input id="first-name" type="text" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre" maxLength={40} required />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="last-name">Apellido</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input id="last-name" type="text" value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido" maxLength={40} />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input id="email" type="email" value={user?.email || ''} disabled className={styles.disabledInput} />
              </div>
              <p className={styles.hint}>El correo no se puede cambiar por ahora.</p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {saved ? <><CheckCircle size={18} />¡Guardado!</> : <><Save size={18} />{loading ? 'Guardando...' : 'Guardar cambios'}</>}
              </button>
            </div>
          </form>
        </div>

        {/* Plan */}
        <div className={styles.card}>
          <div className={styles.planHeader}>
            <h2 className={styles.cardTitle}>Plan de suscripción</h2>
            {planSuccess && (
              <span className={styles.planSavedMsg}>
                <CheckCircle size={15} /> Plan actualizado
              </span>
            )}
          </div>

          <div className={styles.plansGrid}>
            {PLANS.map((plan) => {
              const Icon = plan.icon
              const isActive = currentPlan === plan.id
              return (
                <div key={plan.id} className={`${styles.planCard} ${isActive ? styles.planCardActive : ''} ${plan.id === 'premium' ? styles.planCardPremium : ''}`}>
                  {plan.id === 'premium' && <div className={styles.popularBadge}><Zap size={11} /> Recomendado</div>}
                  <div className={styles.planIcon}><Icon size={22} /></div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.planAmount}>{plan.price}</span>
                    <span className={styles.planPeriod}>{plan.period}</span>
                  </div>
                  <ul className={styles.planFeatures}>
                    {plan.features.map((f) => (
                      <li key={f}><CheckCircle size={13} />{f}</li>
                    ))}
                  </ul>
                  <button
                    className={`${styles.planBtn} ${isActive ? styles.planBtnActive : plan.id === 'premium' ? styles.planBtnPremium : styles.planBtnFree}`}
                    onClick={() => handleChangePlan(plan.id)}
                    disabled={isActive || planLoading}
                  >
                    {isActive ? 'Plan actual' : planLoading ? 'Cambiando...' : `Cambiar a ${plan.name}`}
                  </button>
                </div>
              )
            })}
          </div>

          <p className={styles.planNote}>
            * Los pagos no están habilitados aún. Puedes cambiar de plan libremente durante el desarrollo.
          </p>
        </div>

        {/* Recordatorios */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Bell size={18} style={{ display: 'inline', marginRight: 8 }} />
            Recordatorios
          </h2>
          <p className={styles.hint} style={{ marginBottom: 16 }}>
            Fintia te avisará cuando lleves más de 3 días sin registrar movimientos.
          </p>
          <ReminderToggle />
        </div>

        {/* WhatsApp */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <MessageCircle size={18} style={{ display: 'inline', marginRight: 8, color: '#25d366' }} />
            Asistente por WhatsApp
          </h2>

          {!isPremium ? (
            <div className={styles.whatsappLocked}>
              <Crown size={28} className={styles.whatsappLockedIcon} />
              <p>Vincula tu WhatsApp y registra gastos enviando un mensaje como <em>"gasté 20 mil en el almuerzo"</em>.</p>
              <span className={styles.premiumOnlyTag}>Solo Premium</span>
            </div>
          ) : (
            <>
              <p className={styles.whatsappDesc}>
                Vincula tu número para registrar gastos enviando un mensaje a Fintia desde WhatsApp.
              </p>

              {/* Phone input */}
              <div className={styles.whatsappRow}>
                <div className={styles.inputWrapper} style={{ flex: 1 }}>
                  <Phone size={18} className={styles.inputIcon} />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="3001234567 o +573001234567"
                    className={styles.whatsappInput}
                  />
                </div>
                <button
                  className={styles.saveBtn}
                  onClick={handleWhatsappSave}
                  disabled={whatsappLoading}
                >
                  {whatsappSaved
                    ? <><CheckCircle size={17} /> Guardado</>
                    : whatsappLoading ? 'Guardando...' : <><Save size={17} /> Guardar</>}
                </button>
              </div>
              <p className={styles.hint} style={{ marginBottom: 12 }}>
                Si no pones código de país, se asume <strong>+57</strong> (Colombia).
              </p>

              {/* Fintia number + open chat */}
              <div className={styles.whatsappNumberCard}>
                <MessageCircle size={18} style={{ color: '#25d366' }} />
                <div>
                  <p className={styles.whatsappNumberLabel}>Número de Fintia en WhatsApp</p>
                  <p className={styles.whatsappNumber}>+1 (415) 523-8886</p>
                </div>
                <a
                  href="https://wa.me/14155238886?text=join%20also-many"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappOpenBtn}
                >
                  Abrir chat
                </a>
              </div>

              {/* Join code */}
              <div className={styles.whatsappNumberCard} style={{ marginTop: 10 }}>
                <div style={{ flex: 1 }}>
                  <p className={styles.whatsappNumberLabel}>Código de activación (solo primera vez)</p>
                  <p className={styles.whatsappNumber} style={{ fontFamily: 'monospace' }}>join also-many</p>
                </div>
                <button className={styles.whatsappOpenBtn} onClick={copyJoinCode}>
                  {joinCopied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
                </button>
              </div>
              <p className={styles.hint}>
                Al abrir el chat, el mensaje ya viene listo. Solo envíalo una vez para activar el bot.
              </p>

              <p className={styles.hint} style={{ marginTop: 4 }}>
                Tu número en formato internacional. Ej: <strong>+573001234567</strong>
              </p>
            </>
          )}
        </div>
      </div>
    
  )
}
