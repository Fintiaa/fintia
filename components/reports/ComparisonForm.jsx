"use client"

import { useState } from "react"
import styles from "./comparison.module.css"

const months = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" }
]

export default function ComparisonForm({ onCompare }) {

  const [chartType,setChartType] = useState("bar")
  const [period1,setPeriod1] = useState(1)
  const [period2,setPeriod2] = useState(2)

  const handleSubmit = () => {
    onCompare({
      chartType,
      period1,
      period2
    })
  }

  return (

    <div className={styles.card}>

      <h2>Crear comparación</h2>

      {/* Tipo de gráfico */}

      <label>Tipo de gráfico</label>
      <select
        className={styles.select}
        value={chartType}
        onChange={(e)=>setChartType(e.target.value)}
      >
        <option value="bar">Barras</option>
        <option value="line">Línea</option>
        <option value="pie">Pastel</option>
      </select>

      {/* Periodos */}

      <div className={styles.row}>

        <select
          className={styles.select}
          value={period1}
          onChange={(e)=>setPeriod1(Number(e.target.value))}
        >
          {months.map(m=>(
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={period2}
          onChange={(e)=>setPeriod2(Number(e.target.value))}
        >
          {months.map(m=>(
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

      </div>

      <button
        className={styles.button}
        onClick={handleSubmit}
      >
        Comparar
      </button>

    </div>

  )
}