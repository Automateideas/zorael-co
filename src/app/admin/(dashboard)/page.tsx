import Link from "next/link";
import {
  Package,
  ArrowRight,
  ShoppingBag,
  BarChart3,
  AlertTriangle,
  CircleDot,
  Eye,
  EyeOff,
} from "lucide-react";
import { hasDatabase } from "@/db/client";
import { getAdminStats } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const dbConnected = hasDatabase();
  const stats = dbConnected ? await getAdminStats() : null;

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-charcoal">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-charcoal/50">
        Manage your store inventory and products.
      </p>

      {/* Stats grid */}
      {stats && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.total}
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Stock"
            value={stats.totalStock.toLocaleString()}
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock"
            value={stats.lowStock}
            accent={stats.lowStock > 0 ? "amber" : undefined}
          />
          <StatCard
            icon={CircleDot}
            label="Out of Stock"
            value={stats.outOfStock}
            accent={stats.outOfStock > 0 ? "red" : undefined}
          />
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/products"
          className="group flex items-center gap-4 rounded-lg border border-border bg-white p-5 transition-all hover:border-charcoal/20 hover:shadow-sm"
        >
          <span className="flex size-11 items-center justify-center rounded-lg bg-cream text-charcoal/60">
            <Package className="size-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-charcoal">Products</p>
            <p className="mt-0.5 text-xs text-charcoal/50">
              Add, edit or remove products
            </p>
          </div>
          <ArrowRight
            className="size-4 text-charcoal/20 transition-colors group-hover:text-charcoal/50"
            strokeWidth={1.5}
          />
        </Link>

        <Link
          href="/admin/products/new"
          className="group flex items-center gap-4 rounded-lg border border-border bg-white p-5 transition-all hover:border-charcoal/20 hover:shadow-sm"
        >
          <span className="flex size-11 items-center justify-center rounded-lg bg-cream text-charcoal/60">
            <BarChart3 className="size-5" strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-charcoal">Add Product</p>
            <p className="mt-0.5 text-xs text-charcoal/50">
              Create a new product listing
            </p>
          </div>
          <ArrowRight
            className="size-4 text-charcoal/20 transition-colors group-hover:text-charcoal/50"
            strokeWidth={1.5}
          />
        </Link>
      </div>

      {/* Status cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {stats && (
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Catalog Status
            </h2>
            <div className="mt-4 space-y-3">
              <StatusRow
                icon={Eye}
                label="Published"
                value={stats.published}
                color="emerald"
              />
              <StatusRow
                icon={EyeOff}
                label="Drafts"
                value={stats.drafts}
                color="charcoal"
              />
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
            System
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal/70">Database</span>
              <span
                className={dbConnected ? "text-emerald-600" : "text-amber-600"}
              >
                {dbConnected ? "Connected" : "Not configured"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal/70">Storage</span>
              <span
                className={
                  process.env.SUPABASE_SECRET_KEY
                    ? "text-emerald-600"
                    : "text-amber-600"
                }
              >
                {process.env.SUPABASE_SECRET_KEY
                  ? "Configured"
                  : "Secret key missing"}
              </span>
            </div>
          </div>
        </div>
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

function StatusRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-charcoal/70">
        <Icon className="size-4" strokeWidth={1.5} />
        {label}
      </div>
      <span className={`font-medium text-${color}-600`}>{value}</span>
    </div>
  );
}
