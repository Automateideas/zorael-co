import { getCoupons } from "./actions";
import { CouponManager } from "./coupon-manager";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-charcoal">
        Coupons
      </h1>
      <p className="mt-1 text-sm text-charcoal/50">
        Turn discount codes on or off without a redeploy.
      </p>
      <CouponManager coupons={coupons} />
    </div>
  );
}
