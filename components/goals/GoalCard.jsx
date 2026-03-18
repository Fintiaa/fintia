'use client'

import { useState } from "react"
import GoalProgress from "./GoalProgress"
import styles from "./goals.module.css"

export default function GoalCard({goal,onAdd,onDelete}){

  const [amount,setAmount] = useState("")

  const percent = Math.min((goal.saved / goal.target) * 100,100)

  const remaining = goal.target - goal.saved

  const addMoney = ()=>{

    const value = Number(amount)

    if(!value) return

    onAdd(goal.id,value)

    setAmount("")
  }

  return(

    <div className={styles.card}>

      <h3 className={styles.goalTitle}>
        {goal.name}
      </h3>

      <p className={styles.goalAmount}>
        ${goal.saved} / ${goal.target}
      </p>

      <GoalProgress progress={percent}/>

      <div className={styles.goalInfo}>
        <span>Faltan ${remaining}</span>
        <span>{percent.toFixed(0)}%</span>
      </div>

      <div className={styles.addBox}>

        <input
          className={styles.inputSmall}
          type="number"
          placeholder="Añadir dinero"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
        />

        <button
          className={styles.addBtn}
          onClick={addMoney}
        >
          Guardar
        </button>

      </div>

      <button
        className={styles.deleteBtn}
        onClick={()=>onDelete(goal.id)}
      >
        Eliminar
      </button>

    </div>
  )
}