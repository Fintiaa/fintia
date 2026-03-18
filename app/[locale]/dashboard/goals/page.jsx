"use client"

import { useState } from "react"
import GoalForm from "@/components/goals/GoalForm"
import GoalCard from "@/components/goals/GoalCard"
import styles from "@/components/goals/goals.module.css"

export default function GoalsPage(){

  const [goals,setGoals] = useState([])

  const addGoal = (goal)=>{
    setGoals([...goals,{...goal,id:Date.now()}])
  }

  const deleteGoal = (id)=>{
    setGoals(goals.filter(g=>g.id !== id))
  }

  const addMoney = (id,amount)=>{

    setGoals(goals.map(goal=>{

      if(goal.id === id){
        return {
          ...goal,
          saved:goal.saved + amount
        }
      }

      return goal
    }))

  }

  return(

    <div className={styles.page}>

      {/* TÍTULO */}
      <h1 className={styles.title}>
        METAS
      </h1>

      <GoalForm onCreate={addGoal}/>

      <div className={styles.grid}>

        {goals.map(goal=>(
          <GoalCard
            key={goal.id}
            goal={goal}
            onDelete={deleteGoal}
            onAdd={addMoney}
          />
        ))}

      </div>

    </div>
  )
}