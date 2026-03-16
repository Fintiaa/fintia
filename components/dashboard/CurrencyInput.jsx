'use client'

import { useState, useEffect } from 'react'

function toDisplay(raw) {
  if (!raw && raw !== 0) return ''
  const digits = String(raw).replace(/\D/g, '')
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Text input that displays formatted numbers with thousand separators (1,000,000)
 * but calls onChange with the raw numeric string ('1000000').
 */
export default function CurrencyInput({ value, onChange, className, placeholder, id, required }) {
  const [display, setDisplay] = useState(toDisplay(value))

  // Sync display when parent resets value (e.g., form clear)
  useEffect(() => {
    setDisplay(toDisplay(value))
  }, [value])

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '').replace(/\D/g, '')
    setDisplay(toDisplay(raw))
    onChange(raw)
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      required={required}
      autoComplete="off"
    />
  )
}
