'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Save, CheckCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/lib/auth/AuthContext'
import { updateProfile } from '@/lib/supabase/profile'
import styles from './page.module.css'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
  }, [profile])

  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')

  const getInitials = () => {
    if (firstName.trim() && lastName.trim()) {
      return (firstName[0] + lastName[0]).toUpperCase()
    }
    if (firstName.trim()) return firstName[0].toUpperCase()
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const displayName = firstName.trim() || user?.email?.split('@')[0] || 'Usuario'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!firstName.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      await updateProfile(user.id, { full_name: fullName })
      refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Configuración</h1>
          <p>Administra tu perfil y preferencias</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Información Personal</h2>

          {/* Avatar preview */}
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>{getInitials()}</div>
            <div>
              <p className={styles.avatarName}>{displayName}</p>
              <p className={styles.avatarEmail}>{user?.email}</p>
              <span className={styles.planBadge}>Plan Gratuito</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="first-name">Nombre *</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                    maxLength={40}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="last-name">Apellido</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                    maxLength={40}
                  />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={styles.disabledInput}
                />
              </div>
              <p className={styles.hint}>El correo no se puede cambiar por ahora.</p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {saved ? (
                  <>
                    <CheckCircle size={18} />
                    ¡Guardado!
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
