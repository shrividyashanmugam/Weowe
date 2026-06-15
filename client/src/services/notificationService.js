import api from './api.js'

export const notificationService = {
  getAll:      ()    => api.get('/notifications'),
  markAsRead:  (id)  => api.put(`/notifications/${id}/read`),
  markAllRead: ()    => api.put('/notifications/read-all'),
  delete:      (id)  => api.delete(`/notifications/${id}`),
  clearAll:    ()    => api.delete('/notifications'),
}
