export type QuotaRuntime = {
  dailyLimit: number;
  kv: {
    enabled: boolean;
    configured: boolean;
    enforced: boolean;
    kvRestApiToken: string;
    kvRestApiUrl: string;
    mode: 'enforced' | 'degraded' | 'disabled';
  };
};

export type AccountQuotaSnapshot = {
  scope: 'account';
  mode: 'daily' | 'unavailable';
  limit: number;
  remaining: number | null;
  used: number | null;
  resetAt: string | null;
  exhausted: boolean;
  enforced: boolean;
  reason: string;
};

export type AccountQuotaReservation = {
  allowed: boolean;
  reserved: boolean;
  quota: AccountQuotaSnapshot;
};

export function getQuotaRuntime(): QuotaRuntime;
export function getAccountQuotaSnapshot(subject: string): Promise<AccountQuotaSnapshot>;
export function reserveAccountQuotaSlot(subject: string): Promise<AccountQuotaReservation>;
export function rollbackAccountQuotaSlot(subject: string): Promise<AccountQuotaSnapshot>;
