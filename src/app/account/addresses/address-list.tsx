"use client";

import { useState, useTransition } from "react";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { AddressForm } from "./address-form";
import { deleteAddress, setDefaultAddress } from "./actions";

type Address = {
  id: number;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export function AddressList({ addresses: initial }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | undefined>();
  const [pending, startTransition] = useTransition();

  const handleSaved = () => {
    setShowForm(false);
    setEditing(undefined);
    window.location.reload();
  };

  const handleDelete = (id: number) => {
    if (!confirm("Remove this address?")) return;
    startTransition(async () => {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    });
  };

  const handleSetDefault = (id: number) => {
    startTransition(async () => {
      await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
    });
  };

  return (
    <>
      {addresses.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border bg-white py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
            <MapPin className="size-7" strokeWidth={1.25} />
          </span>
          <p className="mt-5 font-serif text-lg tracking-tight text-charcoal">
            No saved addresses
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-charcoal/55">
            Add a delivery address for faster checkout.
          </p>
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
          >
            <Plus className="size-4" strokeWidth={1.5} />
            Add Address
          </button>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-charcoal/60">
              {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
            </p>
            <button
              onClick={() => { setEditing(undefined); setShowForm(true); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-medium text-charcoal transition-colors hover:border-charcoal/40"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
              Add New
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative rounded-lg border bg-white p-5 transition-colors ${
                  addr.isDefault ? "border-charcoal/30" : "border-border"
                }`}
              >
                {addr.isDefault && (
                  <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted-gold">
                    <Star className="size-3" strokeWidth={1.5} />
                    Default
                  </span>
                )}
                {addr.label && (
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-charcoal/40">
                    {addr.label}
                  </p>
                )}
                <p className="text-sm font-medium text-charcoal">{addr.fullName}</p>
                <p className="mt-1 text-sm text-charcoal/70">{addr.line1}</p>
                {addr.line2 && (
                  <p className="text-sm text-charcoal/70">{addr.line2}</p>
                )}
                <p className="text-sm text-charcoal/70">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="mt-1 text-xs text-charcoal/50">+91 {addr.phone}</p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => { setEditing(addr); setShowForm(true); }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-charcoal/70 transition-colors hover:border-charcoal/40 hover:text-charcoal"
                  >
                    <Pencil className="size-3" strokeWidth={1.5} />
                    Edit
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={pending}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-charcoal/70 transition-colors hover:border-charcoal/40 hover:text-charcoal disabled:opacity-40"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={pending}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-red-500/70 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="size-3" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <AddressForm
          address={editing}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
