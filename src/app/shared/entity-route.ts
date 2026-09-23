/** Where tapping a notification should take the user, based on what it's about. */
export function routeForEntity(type?: string | null, id?: number | null, role?: string | null): any[] | null {
  const t = (type || '').toLowerCase();
  if (t.includes('booking') || t.includes('delivery') || t.includes('return')) return id ? ['/tabs/bookings', id] : ['/tabs/bookings'];
  if (t.includes('invoice') || t.includes('payment')) return id ? ['/tabs/invoices', id] : ['/tabs/invoices'];
  if (t.includes('quot')) return id ? ['/tabs/quotations', id] : ['/tabs/quotations'];
  if (t.includes('lease')) return id ? ['/tabs/lease-agreements', id] : ['/tabs/lease-agreements'];
  if (t.includes('dispute')) return id ? ['/tabs/disputes', id] : ['/tabs/disputes'];
  if (t.includes('payout')) return ['/tabs/payouts'];
  if (t.includes('inspection')) return ['/tabs/inspections'];
  if (t.includes('message') || t.includes('thread')) return id ? ['/tabs/messages', id] : ['/tabs/messages'];
  if (t.includes('listing')) return role === 'supplier' ? (id ? ['/tabs/listings', id, 'edit'] : ['/tabs/listings']) : (id ? ['/tabs/browse', id] : ['/tabs/browse']);
  return null;
}
