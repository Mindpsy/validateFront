import { api } from './http';

export async function adminLogin(payload: { email: string; password: string }) {
  const { data } = await api.post('/admin/login', payload);
  return data as { access_token: string; token_type: string };
}
