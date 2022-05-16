import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getCustomerListItems } from "~/models/customer.server";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  const [firstCustomer] = await getCustomerListItems();
  if (!firstCustomer) {
    return json({});
  }
  return redirect(`/sales/customers/${firstCustomer.id}`);
};

export default function InvoiceIndex() {
  return <div>You don't have any customers 😭</div>;
}
