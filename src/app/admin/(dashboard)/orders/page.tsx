import { Package, ShoppingBag, AlertTriangle, Truck } from "lucide-react";
import { getAllOrdersAdmin, getOrderStats } from "./actions";
import { OrderTable } from "./order-table";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, stats] = await Promise.all([
    getAllOrdersAdmin(),
    getOrderStats(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-charcoal">
        Orders
      </h1>
      <p className="mt-1 text-sm text-charcoal/50">
        Manage customer orders and update their status.
      </p>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total Orders"
          value={stats.totalOrders}
        />
        <StatCard
          icon={ShoppingBag}
          label="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Action Required"
          value={stats.actionRequired}
          accent={stats.actionRequired > 0 ? "amber" : undefined}
        />
        <StatCard
          icon={Truck}
          label="In Transit"
          value={stats.shipped}
        />
      </div>

      <div className="mt-8">
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number | string;
  accent?: "amber" | "red";
}) {
  const accentClass =
    accent === "red"
      ? "text-red-600"
      : accent === "amber"
        ? "text-amber-600"
        : "text-charcoal";

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-charcoal/40" strokeWidth={1.5} />
        <span className="text-xs text-charcoal/50">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-medium tracking-tight ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}
