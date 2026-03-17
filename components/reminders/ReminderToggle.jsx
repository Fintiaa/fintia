"use client"

import { useState } from "react"

export default function ReminderToggle(){

  const [enabled,setEnabled] = useState(()=>{
    const saved = localStorage.getItem("reminders")
    return saved !== null ? saved === "true" : true
  })

  const toggle = ()=>{

    const newValue = !enabled

    setEnabled(newValue)

    localStorage.setItem("reminders",newValue)

  }

  return(

    <label className="reminderToggle">

      Recordatorios

      <input
        type="checkbox"
        checked={enabled}
        onChange={toggle}
      />

    </label>
  )
}