"use client"

import { useState } from "react"
import styles from "./goals.module.css"

export default function GoalForm({onCreate}){

  const [name,setName] = useState("")
  const [amount,setAmount] = useState("")

  const submit = (e)=>{
    e.preventDefault()

    onCreate({
      name,
      target:Number(amount),
      saved:0
    })

    setName("")
    setAmount("")
  }

  return(

    <form
      className={styles.goalForm}
      onSubmit={submit}
    >

      <input
        className={styles.input}
        placeholder="Nombre de la meta"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        className={styles.input}
        type="number"
        placeholder="Monto objetivo"
        value={amount}
        onChange={(e)=>setAmount(e.target.value)}
      />

      <button className={styles.createBtn}>
        Crear meta
      </button>

    </form>

  )
}