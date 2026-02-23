import { api } from './http';

export const providersApi = {
  list(params: { page?: number; limit?: number }) {
    return api.get('/admin/providers', { params }).then((r) => r.data);
  },
  create(payload: Record<string, unknown>) {
    return api.post('/admin/providers', payload).then((r) => r.data);
  },
  update(id: number, payload: Record<string, unknown>) {
    return api.put(`/admin/providers/${id}`, payload).then((r) => r.data);
  },
  remove(id: number) {
    return api.delete(`/admin/providers/${id}`).then((r) => r.data);
  },
};
