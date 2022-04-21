import { json } from "@remix-run/node";
import { getInvoiceListItems } from "~/models/invoice.server";

export const loader = async () => {
  const invoiceListItems = await getInvoiceListItems();
  return json(
    { invoiceListItems },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
};
