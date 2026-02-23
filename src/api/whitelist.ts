import { api } from './http';

export const whitelistApi = {
  list(clientId: number, params: { page?: number; limit?: number }) {
    return api.get(`/admin/clients/${clientId}/whitelist`, { params }).then((r) => r.data);
  },
  create(clientId: number, payload: { phone: string; comment?: string }) {
    return api.post(`/admin/clients/${clientId}/whitelist`, payload).then((r) => r.data);
  },
  remove(clientId: number, id: number) {
    return api.delete(`/admin/clients/${clientId}/whitelist/${id}`).then((r) => r.data);
  },
};
