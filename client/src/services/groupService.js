import api from './api.js'

export const groupService = {
  getAll:        ()        => api.get('/groups'),
  getById:       (id)      => api.get(`/groups/${id}`),
  create:        (data)    => api.post('/groups', data),
  update:        (id, d)   => api.put(`/groups/${id}`, d),
  delete:        (id)      => api.delete(`/groups/${id}`),
  addMember:     (id, uid) => api.post(`/groups/${id}/members`, { userId: uid }),
  removeMember:  (id, uid) => api.delete(`/groups/${id}/members/${uid}`),
  getBalances:   (id)      => api.get(`/groups/${id}/balances`),
  settle:        (id)      => api.post(`/groups/${id}/settle`),
}
