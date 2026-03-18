/**
 * HU-5: Configuración de Presupuestos por Categoría
 * Pruebas unitarias para la lógica de presupuestos
 */

const mockFrom = jest.fn()
const mockSupabaseClient = { from: mockFrom }

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

mockSupabaseClient.auth = {
  getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
}

function buildChain(returnValue) {
  const chain = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit', 'gte', 'lte', 'single']
  methods.forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain)
  })
  chain.single = jest.fn().mockResolvedValue(returnValue)
  chain.then = undefined
  return chain
}

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSpending,
  getAllBudgetsWithSpending,
} from '@/lib/supabase/budgets'

beforeEach(() => {
  jest.clearAllMocks()
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-123' } },
  })
})

// ─────────────────────────────────────────────
// getBudgets
// ─────────────────────────────────────────────
describe('HU-5: getBudgets', () => {
  test('retorna lista de presupuestos activos', async () => {
    const budgets = [
      { id: 'b-1', category_id: 'food', amount: 500000, period: 'monthly', is_active: true },
      { id: 'b-2', category_id: 'transport', amount: 200000, period: 'monthly', is_active: true },
    ]
    const chain = buildChain(null)
    chain.order = jest.fn().mockResolvedValue({ data: budgets, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await getBudgets()
    expect(mockFrom).toHaveBeenCalledWith('budgets')
    expect(result).toHaveLength(2)
  })

  test('retorna arreglo vacío si no hay presupuestos', async () => {
    const chain = buildChain(null)
    chain.order = jest.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = await getBudgets()
    expect(result).toEqual([])
  })

  test('lanza error si Supabase falla', async () => {
    const chain = buildChain(null)
    chain.order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    mockFrom.mockReturnValue(chain)

    await expect(getBudgets()).rejects.toMatchObject({ message: 'DB error' })
  })
})

// ─────────────────────────────────────────────
// createBudget
// ─────────────────────────────────────────────
describe('HU-5: createBudget', () => {
  test('crea un presupuesto mensual con los campos correctos', async () => {
    const newBudget = { category_id: 'food', amount: 500000, period: 'monthly' }
    const saved = { id: 'b-1', ...newBudget, user_id: 'user-123' }

    const chain = buildChain({ data: saved, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await createBudget(newBudget)
    expect(mockFrom).toHaveBeenCalledWith('budgets')
    expect(result.category_id).toBe('food')
    expect(result.amount).toBe(500000)
  })

  test('asigna el user_id del usuario autenticado', async () => {
    const saved = { id: 'b-2', category_id: 'transport', amount: 200000, user_id: 'user-123' }
    const chain = buildChain({ data: saved, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await createBudget({ category_id: 'transport', amount: 200000, period: 'monthly' })
    expect(result.user_id).toBe('user-123')
  })

  test('lanza error si Supabase falla al crear', async () => {
    const chain = buildChain({ data: null, error: { message: 'Insert failed' } })
    mockFrom.mockReturnValue(chain)

    await expect(createBudget({ category_id: 'food', amount: 100000 })).rejects.toMatchObject({
      message: 'Insert failed',
    })
  })
})

// ─────────────────────────────────────────────
// updateBudget
// ─────────────────────────────────────────────
describe('HU-5: updateBudget', () => {
  test('actualiza el monto de un presupuesto', async () => {
    const updated = { id: 'b-1', amount: 800000, category_id: 'food' }
    const chain = buildChain({ data: updated, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await updateBudget('b-1', { amount: 800000 })
    expect(result.amount).toBe(800000)
  })

  test('agrega el campo updated_at automáticamente', async () => {
    const chain = buildChain({ data: { id: 'b-1', updated_at: new Date().toISOString() }, error: null })
    mockFrom.mockReturnValue(chain)

    await updateBudget('b-1', { amount: 300000 })

    const updateCall = chain.update
    const callArg = updateCall.mock.calls[0][0]
    expect(callArg).toHaveProperty('updated_at')
  })

  test('lanza error si el presupuesto no existe', async () => {
    const chain = buildChain({ data: null, error: { message: 'Row not found' } })
    mockFrom.mockReturnValue(chain)

    await expect(updateBudget('b-inexistente', { amount: 100000 })).rejects.toMatchObject({
      message: 'Row not found',
    })
  })
})

// ─────────────────────────────────────────────
// deleteBudget
// ─────────────────────────────────────────────
describe('HU-5: deleteBudget', () => {
  test('elimina un presupuesto por id', async () => {
    const chain = buildChain(null)
    chain.eq = jest.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue(chain)

    await expect(deleteBudget('b-1')).resolves.not.toThrow()
    expect(mockFrom).toHaveBeenCalledWith('budgets')
  })

  test('lanza error si Supabase falla al eliminar', async () => {
    const chain = buildChain(null)
    chain.eq = jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    mockFrom.mockReturnValue(chain)

    await expect(deleteBudget('b-1')).rejects.toMatchObject({ message: 'Delete failed' })
  })
})

// ─────────────────────────────────────────────
// getBudgetSpending — cálculo de gasto acumulado
// ─────────────────────────────────────────────
describe('HU-5: getBudgetSpending', () => {
  test('suma correctamente las transacciones del período mensual', async () => {
    const transactions = [{ amount: '150000' }, { amount: '80000' }, { amount: '70000' }]
    const chain = buildChain(null)
    chain.lte = jest.fn().mockResolvedValue({ data: transactions, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await getBudgetSpending('food', 'monthly')
    expect(result).toBe(300000)
  })

  test('retorna 0 si no hay transacciones en el período', async () => {
    const chain = buildChain(null)
    chain.lte = jest.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = await getBudgetSpending('food', 'monthly')
    expect(result).toBe(0)
  })

  test('lanza error si Supabase falla', async () => {
    const chain = buildChain(null)
    chain.lte = jest.fn().mockResolvedValue({ data: null, error: { message: 'Query failed' } })
    mockFrom.mockReturnValue(chain)

    await expect(getBudgetSpending('food', 'monthly')).rejects.toMatchObject({ message: 'Query failed' })
  })
})

// ─────────────────────────────────────────────
// getAllBudgetsWithSpending — porcentaje de uso
// ─────────────────────────────────────────────
describe('HU-5: getAllBudgetsWithSpending — porcentaje', () => {
  test('calcula porcentaje correcto al 60%', async () => {
    // getBudgets mock
    const budgets = [{ id: 'b-1', category_id: 'food', amount: 500000, period: 'monthly', is_active: true }]
    const budgetsChain = buildChain(null)
    budgetsChain.order = jest.fn().mockResolvedValue({ data: budgets, error: null })

    // getBudgetSpending mock — transactions that sum to 300000
    const txChain = buildChain(null)
    txChain.lte = jest.fn().mockResolvedValue({ data: [{ amount: '300000' }], error: null })

    mockFrom.mockReturnValueOnce(budgetsChain).mockReturnValueOnce(txChain)

    const result = await getAllBudgetsWithSpending()
    expect(result[0].spent).toBe(300000)
    expect(result[0].percentage).toBe(60)
  })

  test('calcula porcentaje 0 si no hay gasto', async () => {
    const budgets = [{ id: 'b-2', category_id: 'transport', amount: 200000, period: 'monthly', is_active: true }]
    const budgetsChain = buildChain(null)
    budgetsChain.order = jest.fn().mockResolvedValue({ data: budgets, error: null })

    const txChain = buildChain(null)
    txChain.lte = jest.fn().mockResolvedValue({ data: [], error: null })

    mockFrom.mockReturnValueOnce(budgetsChain).mockReturnValueOnce(txChain)

    const result = await getAllBudgetsWithSpending()
    expect(result[0].percentage).toBe(0)
  })

  test('retorna arreglo vacío si no hay presupuestos', async () => {
    const chain = buildChain(null)
    chain.order = jest.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = await getAllBudgetsWithSpending()
    expect(result).toEqual([])
  })
})
