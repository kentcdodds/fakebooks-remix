import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getInvoice } from "~/models/invoice.server";

export const loader: LoaderFunction = async ({ params }) => {
  const { invoiceId } = params;
  if (typeof invoiceId !== "string") {
    throw new Error("This should be unpossible.");
  }
  const invoice = await getInvoice(invoiceId);
  return json({ invoice }, { headers: { "Access-Control-Allow-Origin": "*" } });
};
