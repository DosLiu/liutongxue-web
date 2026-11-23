import type { FigureChatQuota } from './figure-chat.js';
export type GuestIdentity = { id: string; expiresAt: number };
export type GuestReservation = { identity: GuestIdentity; ticket: string; key: string; resetAt: string };
export function readOrCreateGuestIdentity(req: any, res: any): { identity: GuestIdentity | null; created: boolean };
export function getUnavailableGuestQuota(): FigureChatQuota;
export function getGuestQuotaSnapshot(identity: GuestIdentity | null): Promise<FigureChatQuota>;
export function reserveGuestQuotaSlot(identity: GuestIdentity | null): Promise<{ allowed: boolean; quota: FigureChatQuota; reservation?: GuestReservation }>;
export function rollbackGuestQuotaSlot(reservation: GuestReservation): Promise<FigureChatQuota>;
