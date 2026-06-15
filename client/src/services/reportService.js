import api from './api.js'

export const reportService = {
  getSummary:      (period) => api.get('/reports/summary', { params: { period } }),
  getByCategory:   (period) => api.get('/reports/by-category', { params: { period } }),
  getMonthlyTrend: (months) => api.get('/reports/monthly-trend', { params: { months } }),
  getTopSpenders:  (params) => api.get('/reports/top-spenders', { params }),
}
