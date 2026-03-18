'use client'

import { useState } from 'react'

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('reminders')
    return saved !== null ? saved === 'true' : true
  })

  const toggle = () => {
    const newValue = !enabled
    setEnabled(newValue)
    localStorage.setItem('reminders', String(newValue))
  }

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <input type="checkbox" checked={enabled} onChange={toggle} />
      {enabled ? 'Activados' : 'Desactivados'}
    </label>
  )
}