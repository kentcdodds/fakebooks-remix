import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getInvoiceListItems } from "~/models/invoice.server";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  const [firstInvoice] = await getInvoiceListItems();
  if (!firstInvoice) {
    return json({});
  }
  return redirect(`/sales/invoices/${firstInvoice.id}`);
};

export default function InvoiceIndex() {
  return <div>You don't have any invoices 😭</div>;
}
