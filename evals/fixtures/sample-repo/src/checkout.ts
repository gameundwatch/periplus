import { db } from "./db";
import { chargeCard } from "./payments";

export type Cart = {
  accountId: string;
  items: { sku: string; qty: number }[];
  totalCents: number;
};

export async function checkout(cart: Cart): Promise<string> {
  const charge = await chargeCard(cart.accountId, cart.totalCents);
  if (!charge.ok) {
    throw new Error(`charge failed: ${charge.reason}`);
  }

  const orderId = await db.orders.insert({
    accountId: cart.accountId,
    items: cart.items,
    totalCents: cart.totalCents,
    chargeId: charge.id,
  });

  await db.inventory.decrement(cart.items);
  return orderId;
}
