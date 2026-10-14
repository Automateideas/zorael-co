import { notFound } from "next/navigation";
import { getOrderDetail } from "../actions";
import { OrderDetailClient } from "./order-detail-client";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrderDetail(id);

  if (!data) notFound();

  return (
    <OrderDetailClient
      order={data.order}
      items={data.items}
      events={data.events}
    />
  );
}
