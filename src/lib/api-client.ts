// API Client for Client-Side Actions
// Only POST actions (voting, rating) - all data loading is server-side (SSR)

/**
 * Vote on a coupon
 */
export async function voteCoupon(couponId: string, type: string): Promise<Response> {
  return fetch(`/api/coupons/${couponId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
}

/**
 * Rate a store
 */
export async function rateStore(storeId: string, rating: number): Promise<Response> {
  return fetch(`/api/stores/${storeId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
}

