"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/AuthContext"
import ComparisonForm from "@/components/reports/ComparisonForm"
import ComparisonChart from "@/components/reports/ComparisonChart"
import PercentageChange from "@/components/reports/PercentageChange"
import { calculatePercentage, getMonthlyTotal } from "@/lib/reports"
import styles from "@/components/reports/comparison.module.css"

export default function ReportsPage(){

  const { profile } = useAuth()
  const [data,setData] = useState(null)

  if(profile?.plan !== "premium" && profile?.role !== "admin"){
    return (
      <div className={styles.upgradeCard}>

        <h2>Reportes Premium</h2>

        <p>
          Los reportes avanzados están disponibles solo para usuarios Premium.
        </p>

        <button className={styles.upgradeButton}>
          Hazte Premium
        </button>

      </div>
    )
  }

  const handleCompare = async ({period1,period2,chartType})=>{

    const year = new Date().getFullYear()

    const total1 = await getMonthlyTotal(year,period1,"expense")
    const total2 = await getMonthlyTotal(year,period2,"expense")

    const percentage = calculatePercentage(total1,total2)

    setData({
      totals:[total1,total2],
      percentage,
      chartType
    })
  }

  return(

    <div>

      <ComparisonForm onCompare={handleCompare}/>

      {data && (
        <div className={styles.chartCard}>

            <h3 className={styles.chartTitle}>
                Comparación de gastos
            </h3>

            <PercentageChange value={data.percentage}/>

            <ComparisonChart 
                data={data.totals}
                chartType={data.chartType}
            />
        </div>
    )}

    </div>
  )
}