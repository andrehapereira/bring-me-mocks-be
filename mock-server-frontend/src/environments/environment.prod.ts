import { ENV } from "src/app/app.component";


const env: ENV = (window as any).bmm?.config;

const API_PROTOCOL = env.apiProtocol || 'http';
const API_DOMAIN = env.apiDomain || 'localhost';
const API_PORT = env.apiPort || '8085'

export const environment = {
  production: true,
  apiRoot: `${API_PROTOCOL}://${API_DOMAIN}:${API_PORT}/api`
};
