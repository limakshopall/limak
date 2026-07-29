"use server";

import { prisma } from "../../lib/prisma";
import { sendOrderStatusSms } from "../../lib/sms";

export async function updateOrderStatus(orderId: string, status: string) {
  const allowed = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!orderId || !allowed.includes(status)) return;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    },
  });

  if (status !== "PENDING") {
    const orderRef = order.id.slice(-6).toUpperCase();
    await sendOrderStatusSms({
      phone: order.customerPhone,
      orderId: orderRef,
      status: status as "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    });
  }
}