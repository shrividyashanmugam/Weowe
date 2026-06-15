import api from './api.js'

export const friendService = {
  getAll:           ()      => api.get('/friends'),
  getRequests:      ()      => api.get('/friends/requests'),
  sendRequest:      (data)  => api.post('/friends/request', data),
  acceptRequest:    (id)    => api.put(`/friends/${id}/accept`),
  rejectRequest:    (id)    => api.put(`/friends/${id}/reject`),
  remove:           (id)    => api.delete(`/friends/${id}`),
  getBalance:       (id)    => api.get(`/friends/${id}/balance`),
}
