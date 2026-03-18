import { render, screen } from "@testing-library/react"
import ReportsPage from '../app/[locale]/dashboard/reports/page'

describe("HU10 - Comparación entre períodos", () => {

  test("Debe mostrar selector de periodos", () => {

    render(<ReportsPage/>)

    const selectors = screen.getAllByRole("combobox")

    expect(selectors.length).toBeGreaterThanOrEqual(2)

  })

  test("Debe mostrar gráfica comparativa", () => {

    render(<ReportsPage/>)

    const chart = screen.getByText(/gastos/i)

    expect(chart).toBeInTheDocument()

  })

  test("Debe mostrar variación porcentual", () => {

    render(<ReportsPage/>)

    const percentage = screen.getByText(/%/)

    expect(percentage).toBeInTheDocument()

  })

})