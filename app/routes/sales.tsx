import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { getExperiments } from "~/models/experiments.server";
import { getInvoiceListItems } from "~/models/invoice.server";

type LoaderData = { firstInvoiceId?: string; showCustomers: boolean };

export const loader: LoaderFunction = async ({ request }) => {
  const [[firstInvoice], experiments] = await Promise.all([
    getInvoiceListItems(),
    getExperiments(request),
  ]);
  if (!firstInvoice) {
    return json<LoaderData>({ showCustomers: experiments.customers });
  }
  return json<LoaderData>({
    firstInvoiceId: firstInvoice.id,
    showCustomers: experiments.customers,
  });
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
        <NavLink prefetch="intent" to="subscriptions" className={linkClassName}>
          Subscriptions
        </NavLink>
        <NavLink
          prefetch="intent"
          to={
            data.firstInvoiceId ? `invoices/${data.firstInvoiceId}` : "invoices"
          }
          className={linkClassName({ isActive: invoiceMatches })}
        >
          Invoices
        </NavLink>
        {data.showCustomers ? (
          <NavLink prefetch="intent" to="customers" className={linkClassName}>
            Customers
          </NavLink>
        ) : null}
        <NavLink prefetch="intent" to="deposits" className={linkClassName}>
          Deposits
        </NavLink>
      </div>
      <div className="h-4" />
      <Outlet />
    </div>
  );
}
