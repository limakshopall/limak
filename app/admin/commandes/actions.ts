"use server";

import { prisma } from "../../lib/prisma";

export async function updateOrderStatus(orderId: string, status: string) {
  const allowed = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!orderId || !allowed.includes(status)) return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    },
  });
}