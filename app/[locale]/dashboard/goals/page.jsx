'use client'

import GoalForm from '@/components/goals/GoalForm'
import GoalCard from '@/components/goals/GoalCard'
import { useGoals } from '@/lib/hooks/useGoals'
import styles from '@/components/goals/goals.module.css'

export default function GoalsPage() {
  const { goals, loading, error, addGoal, addMoney, removeGoal } = useGoals()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Metas de ahorro</h1>
        <p>Define tus objetivos y ve cuánto te falta para alcanzarlos.</p>
      </div>

      <GoalForm onCreate={addGoal} />

      {loading && <p className={styles.loading}>Cargando metas...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && goals.length === 0 && (
        <p className={styles.empty}>Aún no tienes metas. ¡Crea la primera arriba! 🎯</p>
      )}

      <div className={styles.grid}>
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onDelete={removeGoal} onAdd={addMoney} />
        ))}
      </div>
    </div>
  )
}