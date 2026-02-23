import { api } from './http';

export const clientsApi = {
  list(params: { page?: number; limit?: number; search?: string }) {
    return api.get('/admin/clients', { params }).then((r) => r.data);
  },
  get(id: number) {
    return api.get(`/admin/clients/${id}`).then((r) => r.data);
  },
  create(payload: Record<string, unknown>) {
    return api.post('/admin/clients', payload).then((r) => r.data);
  },
  update(id: number, payload: Record<string, unknown>) {
    return api.put(`/admin/clients/${id}`, payload).then((r) => r.data);
  },
  remove(id: number) {
    return api.delete(`/admin/clients/${id}`).then((r) => r.data);
  },
  regenerateKey(id: number) {
    return api.post(`/admin/clients/${id}/regenerate-key`).then((r) => r.data);
  },
};
