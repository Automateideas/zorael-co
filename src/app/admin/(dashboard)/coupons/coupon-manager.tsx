"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteCoupon,
  saveCoupon,
  toggleCoupon,
  type CouponFormData,
} from "./actions";

type CouponRow = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  maxRedemptions: number | null;
  redeemed: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  newCustomersOnly: boolean;
  isActive: boolean;
};

const EMPTY: CouponFormData = {
  code: "",
  type: "percent",
  value: 5,
  minSubtotal: 0,
  maxDiscount: null,
  maxRedemptions: null,
  startsAt: null,
  expiresAt: null,
  newCustomersOnly: true,
  isActive: true,
};

function toDateInput(d: Date | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CouponFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setError(null);
    setEditing({ ...EMPTY });
  };

  const openEdit = (c: CouponRow) => {
    setError(null);
    setEditing({
      code: c.code,
      type: c.type,
      value: c.value,
      minSubtotal: c.minSubtotal,
      maxDiscount: c.maxDiscount,
      maxRedemptions: c.maxRedemptions,
      startsAt: toDateInput(c.startsAt) || null,
      expiresAt: toDateInput(c.expiresAt) || null,
      newCustomersOnly: c.newCustomersOnly,
      isActive: c.isActive,
    });
  };

  const save = () => {
    if (!editing) return;
    startTransition(async () => {
      try {
        await saveCoupon(editing);
        setEditing(null);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save coupon.");
      }
    });
  };

  const flip = (code: string, next: boolean) => {
    startTransition(async () => {
      await toggleCoupon(code, next);
      router.refresh();
    });
  };

  const remove = (code: string) => {
    startTransition(async () => {
      await deleteCoupon(code);
      router.refresh();
    });
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          New Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-white py-16 text-center">
          <p className="text-sm text-charcoal/55">No coupons yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-charcoal/45">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Rules</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                    {c.maxDiscount != null && (
                      <span className="text-charcoal/45">
                        {" "}
                        (max ₹{c.maxDiscount})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal/55">
                    {c.newCustomersOnly && <div>New customers only</div>}
                    {c.minSubtotal > 0 && <div>Min ₹{c.minSubtotal}</div>}
                    {c.expiresAt && (
                      <div>Until {toDateInput(c.expiresAt)}</div>
                    )}
                    {!c.newCustomersOnly &&
                      c.minSubtotal === 0 &&
                      !c.expiresAt && <span className="text-charcoal/30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {c.redeemed}
                    {c.maxRedemptions != null && ` / ${c.maxRedemptions}`}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => flip(c.code, !c.isActive)}
                      disabled={pending}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        c.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                      )}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-full border border-border px-3 py-1 text-xs text-charcoal/70 transition-colors hover:border-charcoal/40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(c.code)}
                        disabled={pending}
                        aria-label={`Delete ${c.code}`}
                        className="flex size-7 items-center justify-center rounded-full border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-lg border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="font-serif text-lg tracking-tight text-charcoal">
                {coupons.some((c) => c.code === editing.code)
                  ? "Edit Coupon"
                  : "New Coupon"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full text-charcoal/50 hover:bg-cream"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <Field label="Code">
                <input
                  value={editing.code}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="WELCOME5"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type">
                  <select
                    value={editing.type}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        type: e.target.value as "percent" | "fixed",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </Field>
                <Field
                  label={editing.type === "percent" ? "Percent (%)" : "Amount (₹)"}
                >
                  <input
                    type="number"
                    value={editing.value}
                    onChange={(e) =>
                      setEditing({ ...editing, value: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Minimum order (₹)">
                  <input
                    type="number"
                    value={editing.minSubtotal}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        minSubtotal: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Max discount (₹, optional)">
                  <input
                    type="number"
                    value={editing.maxDiscount ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        maxDiscount: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Starts (optional)">
                  <input
                    type="date"
                    value={editing.startsAt ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, startsAt: e.target.value || null })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Expires (optional)">
                  <input
                    type="date"
                    value={editing.expiresAt ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        expiresAt: e.target.value || null,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Max total redemptions (optional)">
                <input
                  type="number"
                  value={editing.maxRedemptions ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      maxRedemptions: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className={inputClass}
                />
              </Field>

              <label className="flex items-center gap-2.5 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={editing.newCustomersOnly}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      newCustomersOnly: e.target.checked,
                    })
                  }
                  className="size-4 accent-charcoal"
                />
                First-time customers only
              </label>

              <label className="flex items-center gap-2.5 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) =>
                    setEditing({ ...editing, isActive: e.target.checked })
                  }
                  className="size-4 accent-charcoal"
                />
                Active
              </label>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-5 py-3.5">
              <button
                onClick={() => setEditing(null)}
                className="h-10 rounded-full border border-border px-5 text-sm text-charcoal transition-colors hover:border-charcoal/40"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={pending}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-ivory px-3 text-sm text-charcoal focus:border-charcoal focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-charcoal/50">{label}</span>
      {children}
    </label>
  );
}
