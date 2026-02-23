import { api } from './http';

export const clientBlacklistApi = {
  list(clientId: number, params: { page?: number; limit?: number; phone?: string }) {
    return api.get(`/admin/clients/${clientId}/blacklist`, { params }).then((r) => r.data);
  },
  create(
    clientId: number,
    payload: { phone: string; reason: string; comment?: string },
  ) {
    return api.post(`/admin/clients/${clientId}/blacklist`, payload).then((r) => r.data);
  },
  remove(clientId: number, id: number) {
    return api.delete(`/admin/clients/${clientId}/blacklist/${id}`).then((r) => r.data);
  },
};
