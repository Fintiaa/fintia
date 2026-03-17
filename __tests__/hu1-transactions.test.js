/**
 * HU-1: CRUD de Transacciones
 * Pruebas unitarias para la lógica de transacciones
 */

// Mock del cliente de Supabase
const mockFrom = jest.fn()
const mockSupabaseClient = { from: mockFrom }

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

// Mock de supabase.auth.getUser
mockSupabaseClient.auth = {
  getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
}

function buildChain(returnValue) {
  const chain = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit', 'gte', 'lte', 'single']
  methods.forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain)
  })
  // El último método en la cadena resuelve con returnValue
  chain.single = jest.fn().mockResolvedValue(returnValue)
  chain.then = undefined
  return chain
}

import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/supabase/transactions'

beforeEach(() => {
  jest.clearAllMocks()
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-123' } },
  })
})

describe('HU-1: createTransaction', () => {
  test('crea una transacción de gasto con los campos correctos', async () => {
    const newTransaction = {
      type: 'expense',
      amount: 50000,
      category_id: 'food',
      description: 'Mercado',
      date: '2026-03-17',
    }
    const savedTransaction = { id: 'tx-1', ...newTransaction, user_id: 'user-123' }

    const chain = buildChain({ data: savedTransaction, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await createTransaction(newTransaction)

    expect(mockFrom).toHaveBeenCalledWith('transactions')
    expect(result).toMatchObject({ type: 'expense', amount: 50000 })
  })

  test('lanza error si Supabase falla al crear', async () => {
    const chain = buildChain({ data: null, error: { message: 'DB error' } })
    mockFrom.mockReturnValue(chain)

    await expect(createTransaction({ type: 'expense', amount: 10000 })).rejects.toMatchObject({
      message: 'DB error',
    })
  })

  test('asigna el user_id del usuario autenticado', async () => {
    const savedTransaction = { id: 'tx-2', type: 'income', amount: 200000, user_id: 'user-123' }
    const chain = buildChain({ data: savedTransaction, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await createTransaction({ type: 'income', amount: 200000 })
    expect(result.user_id).toBe('user-123')
  })
})

describe('HU-1: updateTransaction', () => {
  test('actualiza una transacción existente', async () => {
    const updated = { id: 'tx-1', description: 'Almuerzo editado', amount: 25000, type: 'expense' }
    const chain = buildChain({ data: updated, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await updateTransaction('tx-1', { description: 'Almuerzo editado', amount: 25000 })
    expect(result.description).toBe('Almuerzo editado')
  })

  test('agrega el campo updated_at automáticamente', async () => {
    const chain = buildChain({ data: { id: 'tx-1', updated_at: new Date().toISOString() }, error: null })
    mockFrom.mockReturnValue(chain)

    await updateTransaction('tx-1', { amount: 15000 })

    const updateCall = chain.update
    const callArg = updateCall.mock.calls[0][0]
    expect(callArg).toHaveProperty('updated_at')
  })

  test('lanza error si la transacción no existe', async () => {
    const chain = buildChain({ data: null, error: { message: 'Row not found' } })
    mockFrom.mockReturnValue(chain)

    await expect(updateTransaction('tx-inexistente', { amount: 100 })).rejects.toMatchObject({
      message: 'Row not found',
    })
  })
})

describe('HU-1: deleteTransaction', () => {
  test('elimina una transacción por id', async () => {
    const chain = buildChain({ error: null })
    chain.eq = jest.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue(chain)

    await expect(deleteTransaction('tx-1')).resolves.not.toThrow()
    expect(mockFrom).toHaveBeenCalledWith('transactions')
  })

  test('lanza error si Supabase falla al eliminar', async () => {
    const chain = buildChain({ error: null })
    chain.eq = jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    mockFrom.mockReturnValue(chain)

    await expect(deleteTransaction('tx-1')).rejects.toMatchObject({ message: 'Delete failed' })
  })
})
