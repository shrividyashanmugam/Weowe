import api from './api.js'

export const userService = {
  getProfile:      ()      => api.get('/users/me'),
  updateProfile:   (data)  => api.put('/users/me', data),
  uploadAvatar:    (file)  => {
    const form = new FormData()
    form.append('avatar', file)
    return api.put('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  changePassword:  (data)  => api.put('/users/me/password', data),
  deleteAccount:   ()      => api.delete('/users/me'),
  searchUsers:     (q)     => api.get('/users/search', { params: { q } }),
  getStats:        ()      => api.get('/users/me/stats'),
}
