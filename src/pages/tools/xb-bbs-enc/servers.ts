export interface XbServer {
  id: string;
  host: string;
  ip?: string;
  urlLabel?: string;
  disabled?: boolean;
}

/** 原页面下拉列表 + 书签中常用端口 */
export const XB_SERVERS: XbServer[] = [
  { id: 'j1', host: '1.singbon.com:81', ip: '122.114.33.8', urlLabel: '1.singbon.81' },
  { id: 'a2', host: 'a2.4000063966.com:81', ip: '39.108.61.11', urlLabel: 'a2.4000063966.com:81' },
  { id: 'a3', host: 'a3c.4000063966.com', ip: '39.108.227.18', urlLabel: 'a3c.4000063966.com' },
  { id: 'a3-8081', host: 'a3c.4000063966.com:8081' },
  { id: 'a4', host: 'a4c.4000063966.com', ip: '47.107.100.127', urlLabel: 'a4c.4000063966.com' },
  { id: 'a4-8081', host: 'a4c.4000063966.com:8081' },
  { id: 'cdz', host: 'cdz.4000063966.com:81', disabled: true },
  { id: 'cdz-8081', host: 'cdz.4000063966.com:8081' },
  { id: 'local81', host: 'localhost:81' },
  { id: 'local8081', host: 'localhost:8081' },
];

export const XB_SERVERS_WITH_IP = XB_SERVERS.filter((item) => item.ip);

export function normalizeHost(host: string): string {
  return host
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

export function buildHttpUrl(host: string, path: string): string {
  return `http://${normalizeHost(host)}${path}`;
}

export function decimalToPaddedHex(decimal: string, length = 32): string {
  const trimmed = decimal.trim();
  if (!trimmed) {
    return '';
  }
  if (!/^\d+$/.test(trimmed)) {
    throw new Error('invalid decimal');
  }
  return BigInt(trimmed).toString(16).toUpperCase().padStart(length, '0');
}

export function paddedHexToDecimal(hex: string): string {
  const cleaned = hex.trim().replace(/\s+/g, '');
  if (!cleaned) {
    return '';
  }
  if (!/^[0-9a-f]+$/i.test(cleaned)) {
    throw new Error('invalid hex');
  }
  return BigInt(`0x${cleaned}`).toString(10);
}
