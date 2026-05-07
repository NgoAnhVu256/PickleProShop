import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/settings";
import OrdersClient from "./OrdersClient";

export const metadata = { title: "Đơn hàng của tôi - PicklePro" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/orders");

  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: true,
                attrValues: { include: { attribute: true } }
              }
            }
          }
        }
      }
    }),
    getSiteSettings(),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, role: true },
  });

  return (
    <OrdersClient
      orders={JSON.parse(JSON.stringify(orders))}
      user={JSON.parse(JSON.stringify(user))}
      settings={settings}
    />
  );
}
