

const HOSTNAME = window.location.hostname;

const IS_LOOPBACK =
  HOSTNAME === 'localhost' ||
  HOSTNAME === '127.0.0.1';

const IS_PRIVATE_NETWORK =
  HOSTNAME.startsWith('192.168.') ||
  HOSTNAME.startsWith('10.') ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(HOSTNAME);

const API_HOST = IS_LOOPBACK
  ? 'http://localhost:8081'
  : IS_PRIVATE_NETWORK
    ? `http://${HOSTNAME}:8081`
    : 'https://SEU-BACKEND-PRODUCAO';

export const API_BASE = `${API_HOST}/api`;

export const API_ENDPOINTS = {

  AUTH: `${API_BASE}/auth`,
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_REGISTER: `${API_BASE}/auth/register`,

  BOARDS: `${API_BASE}/boards`,

  COLUMNS: (boardId: string) =>
    `${API_BASE}/boards/${boardId}/columns`,

  COLUMN: (boardId: string, columnId: string) =>
    `${API_BASE}/boards/${boardId}/columns/${columnId}`,

  CARDS: (boardId: string, columnId: string) =>
    `${API_BASE}/boards/${boardId}/columns/${columnId}/cards`,

  CARD: (
    boardId: string,
    columnId: string,
    cardId: string
  ) =>
    `${API_BASE}/boards/${boardId}/columns/${columnId}/cards/${cardId}`
};
