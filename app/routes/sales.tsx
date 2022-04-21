import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { getInvoiceListItems } from "~/models/invoice.server";

type LoaderData = { firstInvoiceId?: string };

export const loader: LoaderFunction = async () => {
  const [firstInvoice] = await getInvoiceListItems();
  if (!firstInvoice) {
    return json<LoaderData>({});
  }
  return json<LoaderData>({ firstInvoiceId: firstInvoice.id });
};

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "font-bold text-black" : "";

export default function SalesRoute() {
  const data = useLoaderData() as LoaderData;
  const matches = useMatches();
  const indexMatches = matches.some((m) => m.id === "routes/sales/index");
  const invoiceMatches = matches.some((m) => m.id === "routes/sales/invoices");
  return (
    <div className="relative h-full p-10">
      <div className="font-display text-d-h3 text-black">Sales</div>
      <div className="h-6" />
      <div className="flex gap-4 border-b border-gray-100 pb-4 text-[length:14px] font-medium text-gray-400">
        <NavLink to="." className={linkClassName({ isActive: indexMatches })}>
          Overview
        </NavLink>
        <NavLink to="subscriptions" className={linkClassName}>
          Subscriptions
        </NavLink>
        <NavLink
          to={
            data.firstInvoiceId ? `invoices/${data.firstInvoiceId}` : "invoices"
          }
          className={linkClassName({ isActive: invoiceMatches })}
        >
          Invoices
        </NavLink>
        <NavLink to="customers" className={linkClassName}>
          Customers
        </NavLink>
        <NavLink to="deposits" className={linkClassName}>
          Deposits
        </NavLink>
      </div>
      <div className="h-4" />
      <Outlet />
    </div>
  );
}
