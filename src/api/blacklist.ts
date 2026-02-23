import { api } from './http';

export const blacklistApi = {
  list(params: { page?: number; limit?: number; phone?: string }) {
    return api.get('/admin/blacklist', { params }).then((r) => r.data);
  },
  create(payload: { phone: string; reason: string; comment?: string }) {
    return api.post('/admin/blacklist', payload).then((r) => r.data);
  },
  remove(id: number) {
    return api.delete(`/admin/blacklist/${id}`).then((r) => r.data);
  },
};
