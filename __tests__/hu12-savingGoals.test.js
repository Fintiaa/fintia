import { render, screen } from "@testing-library/react"
import GoalsCard from "../components/goals/GoalsCard"
import GoalProgress from "../components/goals/GoalProgress"

describe("HU12 - Objetivos de ahorro", () => {

  test("Debe mostrar el nombre del objetivo", () => {

    const goal = {
      id: 1,
      name: "Viaje",
      target_amount: 1000,
      current_amount: 200
    }

    render(<GoalsCard goal={goal} />)

    expect(screen.getByText("Viaje")).toBeInTheDocument()

  })

  test("Debe mostrar el progreso del objetivo", () => {

    render(<GoalProgress current={200} target={1000} />)

    expect(screen.getByText(/200/i)).toBeInTheDocument()

  })

  test("Debe mostrar el monto objetivo", () => {

    const goal = {
      id: 1,
      name: "Viaje",
      target_amount: 1000,
      current_amount: 200
    }

    render(<GoalsCard goal={goal} />)

    expect(screen.getByText(/1000/i)).toBeInTheDocument()

  })

})