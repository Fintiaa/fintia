import { calculatePercentage } from '../lib/reports'

describe("HU10 - Comparación entre períodos", () => {

  test("Calcula aumento porcentual entre períodos", () => {
    const result = calculatePercentage(1000, 1200)
    expect(result).toBeCloseTo(20)
  })

  test("Calcula reducción porcentual entre períodos", () => {
    const result = calculatePercentage(2000, 1500)
    expect(result).toBeCloseTo(-25)
  })

  test("Retorna 100 cuando el valor anterior es cero", () => {
    const result = calculatePercentage(0, 500)
    expect(result).toBe(100)
  })

  test("Retorna 0 cuando ambos valores son iguales", () => {
    const result = calculatePercentage(1000, 1000)
    expect(result).toBe(0)
  })

})