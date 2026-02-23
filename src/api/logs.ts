import { api } from './http';

export const logsApi = {
  list(params: Record<string, string | number | undefined>) {
    return api.get('/admin/logs', { params }).then((r) => r.data);
  },
};
