import { render, screen } from "@testing-library/react"
import GoalCard from "../components/goals/GoalCard"
import GoalProgress from "../components/goals/GoalProgress"

describe("HU12 - Objetivos de ahorro", () => {

  test("Debe mostrar el nombre del objetivo", () => {

    const goal = { id: 1, name: "Viaje", target: 1000, saved: 200 }
    render(<GoalCard goal={goal} onAdd={() => {}} onDelete={() => {}} />)
    expect(screen.getByText("Viaje")).toBeInTheDocument()

  })

  test("Debe mostrar el progreso visual del objetivo", () => {

    // GoalProgress recibe progress como porcentaje (0-100)
    render(<GoalProgress progress={20} />)
    const bar = document.querySelector('.progressBar')
    expect(bar).toBeTruthy()

  })

  test("Debe mostrar el monto guardado y el objetivo", () => {

    const goal = { id: 1, name: "Viaje", target: 1000, saved: 200 }
    render(<GoalCard goal={goal} onAdd={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/\$200/)).toBeInTheDocument()
    expect(screen.getByText(/\$1000/)).toBeInTheDocument()

  })

})