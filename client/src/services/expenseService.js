import api from './api.js'

export const expenseService = {
  getAll:     (params) => api.get('/expenses', { params }),
  getSummary: (period) => api.get('/expenses/summary', { params: { period } }),
  getById:    (id)     => api.get(`/expenses/${id}`),
  create:     (data)   => api.post('/expenses', data),
  update:     (id, d)  => api.put(`/expenses/${id}`, d),
  delete:     (id)     => api.delete(`/expenses/${id}`),
}
