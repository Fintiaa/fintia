'use client'

import { useState, useEffect } from 'react'

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('reminders')
    if (saved !== null) setEnabled(saved === 'true')
  }, [])

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