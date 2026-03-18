import { checkInactivity } from "../lib/reminders"

describe("HU11 - Recordatorios de registro", () => {

  test("Detecta inactividad mayor a 3 días", () => {

    const date = new Date()
    date.setDate(date.getDate() - 4)

    const result = checkInactivity(date)

    expect(result).toBe(true)

  })

  test("No detecta inactividad si la transacción fue hoy", () => {

    const today = new Date()

    const result = checkInactivity(today)

    expect(result).toBe(false)

  })

  test("Detecta inactividad si no hay transacciones", () => {

    const result = checkInactivity(null)

    expect(result).toBe(true)

  })

})