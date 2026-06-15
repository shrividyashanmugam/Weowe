import api from './api.js'

export const settlementService = {
  getAll:        (params) => api.get('/settlements', { params }),
  getSimplified: (params) => api.get('/settlements/simplified', { params }),
  create:        (data)   => api.post('/settlements', data),
  markAsPaid:    (id, d)  => api.put(`/settlements/${id}/pay`, d),
}
