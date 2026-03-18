/**
 * HU-6: Alertas Inteligentes por Sobre-gasto
 * Pruebas unitarias para el sistema de alertas de presupuesto
 */

const mockFrom = jest.fn()
const mockFetch = jest.fn(() => Promise.resolve({ ok: true }))
global.fetch = mockFetch

const mockSupabaseClient = { from: mockFrom }

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

jest.mock('@/lib/data/categories', () => ({
  getCategoryById: (id) => {
    const map = {
      food: { id: 'food', name: 'Alimentación' },
      transport: { id: 'transport', name: 'Transporte' },
      health: { id: 'health', name: 'Salud' },
    }
    return map[id]
  },
}))

mockSupabaseClient.auth = {
  getUser: jest.fn().mockResolvedValue({
    data: { user: { id: 'user-123', email: 'test@example.com' } },
  }),
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
  getAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
  markAllAlertsAsRead,
  checkBudgetsAndCreateAlerts,
} from '@/lib/supabase/alerts'

beforeEach(() => {
  jest.clearAllMocks()
  mockFetch.mockResolvedValue({ ok: true })
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-123', email: 'test@example.com' } },
  })
})

// ─────────────────────────────────────────────
// getAlerts
// ─────────────────────────────────────────────
describe('HU-6: getAlerts', () => {
  test('retorna todas las alertas ordenadas por fecha', async () => {
    const alerts = [
      { id: 'a-1', type: 'warning', is_read: false, message: 'Cerca del límite en Alimentación' },
      { id: 'a-2', type: 'exceeded', is_read: true, message: 'Excediste Transporte' },
    ]
    const chain = buildChain(null)
    chain.limit = jest.fn().mockResolvedValue({ data: alerts, error: null })
    mockFrom.mockReturnValue(chain)

    const result = await getAlerts()
    expect(mockFrom).toHaveBeenCalledWith('alerts')
    expect(result).toHaveLength(2)
  })

  test('filtra solo alertas no leídas con unreadOnly: true', async () => {
    const chain = buildChain(null)
    // limit returns the chain so .eq() can be chained after it
    const afterLimit = {}
    afterLimit.eq = jest.fn().mockResolvedValue({ data: [{ id: 'a-1', is_read: false }], error: null })
    chain.limit = jest.fn().mockReturnValue(afterLimit)
    mockFrom.mockReturnValue(chain)

    const result = await getAlerts({ unreadOnly: true })
    expect(afterLimit.eq).toHaveBeenCalledWith('is_read', false)
    expect(result).toHaveLength(1)
  })

  test('retorna arreglo vacío si no hay alertas', async () => {
    const chain = buildChain(null)
    chain.limit = jest.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = await getAlerts()
    expect(result).toEqual([])
  })

  test('lanza error si Supabase falla', async () => {
    const chain = buildChain(null)
    chain.limit = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    mockFrom.mockReturnValue(chain)

    await expect(getAlerts()).rejects.toMatchObject({ message: 'DB error' })
  })
})

// ─────────────────────────────────────────────
// getUnreadAlertCount
// ─────────────────────────────────────────────
describe('HU-6: getUnreadAlertCount', () => {
  test('retorna el número de alertas no leídas', async () => {
    const chain = buildChain(null)
    chain.eq = jest.fn().mockResolvedValue({ data: [{ id: 'a-1' }, { id: 'a-2' }], error: null })
    mockFrom.mockReturnValue(chain)

    const count = await getUnreadAlertCount()
    expect(count).toBe(2)
  })

  test('retorna 0 si no hay alertas sin leer', async () => {
    const chain = buildChain(null)
    chain.eq = jest.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const count = await getUnreadAlertCount()
    expect(count).toBe(0)
  })
})

// ─────────────────────────────────────────────
// markAlertAsRead
// ─────────────────────────────────────────────
describe('HU-6: markAlertAsRead', () => {
  test('marca una alerta como leída', async () => {
    const chain = buildChain(null)
    chain.eq = jest.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue(chain)

    await expect(markAlertAsRead('a-1')).resolves.not.toThrow()
    expect(chain.update).toHaveBeenCalledWith({ is_read: true })
  })

  test('lanza error si Supabase falla', async () => {
    const chain = buildChain(null)
    chain.eq = jest.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    mockFrom.mockReturnValue(chain)

    await expect(markAlertAsRead('a-1')).rejects.toMatchObject({ message: 'Update failed' })
  })
})

// ─────────────────────────────────────────────
// markAllAlertsAsRead
// ─────────────────────────────────────────────
describe('HU-6: markAllAlertsAsRead', () => {
  test('marca todas las alertas como leídas', async () => {
    const chain = buildChain(null)
    chain.eq = jest.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue(chain)

    await expect(markAllAlertsAsRead()).resolves.not.toThrow()
    expect(chain.update).toHaveBeenCalledWith({ is_read: true })
  })
})

// ─────────────────────────────────────────────
// checkBudgetsAndCreateAlerts — lógica core HU-6
// ─────────────────────────────────────────────
describe('HU-6: checkBudgetsAndCreateAlerts — umbral de advertencia (80%)', () => {
  test('crea alerta de warning cuando gasto es 85% del presupuesto', async () => {
    const budget = { id: 'b-1', category_id: 'food', amount: '500000', period: 'monthly' }
    const createdAlert = { id: 'a-new', type: 'warning', message: 'Cerca del límite' }

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      const chain = buildChain(null)

      if (callCount === 1) {
        // getBudgets
        chain.eq = jest.fn().mockReturnValue(chain)
        chain.select = jest.fn().mockReturnValue(chain)
        chain.eq = jest.fn().mockResolvedValue({ data: [budget], error: null })
        return chain
      }
      if (callCount === 2) {
        // getSpending — 425000 (85%)
        chain.lte = jest.fn().mockResolvedValue({ data: [{ amount: '425000' }], error: null })
        return chain
      }
      if (callCount === 3) {
        // existingAlerts — none found
        chain.gte = jest.fn().mockResolvedValue({ data: [], error: null })
        return chain
      }
      if (callCount === 4) {
        // insert alert
        chain.single = jest.fn().mockResolvedValue({ data: createdAlert, error: null })
        return chain
      }
      return chain
    })

    const result = await checkBudgetsAndCreateAlerts()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('warning')
  })

  test('no crea alerta si el gasto es menor al 80%', async () => {
    const budget = { id: 'b-2', category_id: 'transport', amount: '200000', period: 'monthly' }

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      const chain = buildChain(null)

      if (callCount === 1) {
        chain.eq = jest.fn().mockResolvedValue({ data: [budget], error: null })
        return chain
      }
      if (callCount === 2) {
        // spending = 100000 (50%)
        chain.lte = jest.fn().mockResolvedValue({ data: [{ amount: '100000' }], error: null })
        return chain
      }
      return chain
    })

    const result = await checkBudgetsAndCreateAlerts()
    expect(result).toHaveLength(0)
  })
})

describe('HU-6: checkBudgetsAndCreateAlerts — umbral excedido (100%)', () => {
  test('crea alerta de tipo exceeded cuando gasto supera el presupuesto', async () => {
    const budget = { id: 'b-3', category_id: 'health', amount: '300000', period: 'monthly' }
    const createdAlert = { id: 'a-exceed', type: 'exceeded', message: 'Excediste tu presupuesto' }

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      const chain = buildChain(null)

      if (callCount === 1) {
        chain.eq = jest.fn().mockResolvedValue({ data: [budget], error: null })
        return chain
      }
      if (callCount === 2) {
        // spending = 350000 (116%)
        chain.lte = jest.fn().mockResolvedValue({ data: [{ amount: '350000' }], error: null })
        return chain
      }
      if (callCount === 3) {
        chain.gte = jest.fn().mockResolvedValue({ data: [], error: null })
        return chain
      }
      if (callCount === 4) {
        chain.single = jest.fn().mockResolvedValue({ data: createdAlert, error: null })
        return chain
      }
      return chain
    })

    const result = await checkBudgetsAndCreateAlerts()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('exceeded')
  })

  test('no duplica alertas si ya existe una alerta del mismo tipo en el período', async () => {
    const budget = { id: 'b-4', category_id: 'food', amount: '500000', period: 'monthly' }

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      const chain = buildChain(null)

      if (callCount === 1) {
        chain.eq = jest.fn().mockResolvedValue({ data: [budget], error: null })
        return chain
      }
      if (callCount === 2) {
        // 90% del presupuesto
        chain.lte = jest.fn().mockResolvedValue({ data: [{ amount: '450000' }], error: null })
        return chain
      }
      if (callCount === 3) {
        // Ya existe alerta de tipo warning para este período
        chain.gte = jest.fn().mockResolvedValue({ data: [{ id: 'a-existing' }], error: null })
        return chain
      }
      return chain
    })

    const result = await checkBudgetsAndCreateAlerts()
    expect(result).toHaveLength(0)
  })

  test('retorna arreglo vacío si el usuario no está autenticado', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
    const result = await checkBudgetsAndCreateAlerts()
    expect(result).toEqual([])
  })
})
