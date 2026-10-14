"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { saveAddress, type AddressFormData } from "./actions";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

type Props = {
  address?: {
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
  onClose: () => void;
  onSaved: () => void;
};

export function AddressForm({ address, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [label, setLabel] = useState(address?.label ?? "");
  const [fullName, setFullName] = useState(address?.fullName ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [line1, setLine1] = useState(address?.line1 ?? "");
  const [line2, setLine2] = useState(address?.line2 ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [state, setState] = useState(address?.state ?? "");
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? "");
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !phone.trim() || !line1.trim() || !city.trim() || !state || !postalCode.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(postalCode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setSaving(true);
    try {
      const data: AddressFormData = {
        id: address?.id,
        label: label.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        line1: line1.trim(),
        line2: line2.trim(),
        city: city.trim(),
        state,
        postalCode: postalCode.trim(),
        isDefault,
      };
      await saveAddress(data);
      onSaved();
    } catch {
      setError("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-ivory p-6 shadow-lg sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>

        <h2 className="font-serif text-xl tracking-tight text-charcoal">
          {address ? "Edit Address" : "Add New Address"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Label <span className="normal-case tracking-normal text-charcoal/30">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Home, Office"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Recipient's full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
                Mobile Number *
              </label>
              <div className="flex">
                <span className="flex h-11 items-center rounded-l-lg border border-r-0 border-border bg-cream px-3 text-sm text-charcoal/60">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit number"
                  className="h-11 flex-1 rounded-r-lg border border-border bg-white px-4 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="House / Flat No., Building, Street"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Address Line 2 <span className="normal-case tracking-normal text-charcoal/30">(optional)</span>
            </label>
            <input
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="Landmark, Area"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
                State *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
                PIN Code *
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit PIN"
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="size-4 rounded border-border accent-charcoal"
            />
            <span className="text-sm text-charcoal/70">Set as default address</span>
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium text-charcoal transition-colors hover:border-charcoal/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                address ? "Save Changes" : "Add Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
