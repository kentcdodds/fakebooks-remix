import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getCustomerDetails } from "~/models/customer.server";
import { requireUser } from "~/session.server";
import { currencyFormatter } from "~/utils";

type LoaderData = {
  customer: NonNullable<Awaited<ReturnType<typeof getCustomerDetails>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request);
  const { customerId } = params;
  if (typeof customerId !== "string") {
    throw new Error("This should be unpossible.");
  }
  const customerDetails = await getCustomerDetails(customerId);
  if (!customerDetails) {
    throw new Response("not found", { status: 404 });
  }
  return json<LoaderData>({
    customer: customerDetails,
  });
};

const lineItemClassName =
  "flex justify-between border-t border-gray-100 py-4 text-[14px] leading-[24px]";

export default function CustomerRoute() {
  const data = useLoaderData() as LoaderData;

  return (
    <div className="relative p-10">
      <div className="text-[length:14px] font-bold leading-6">
        {data.customer.email}
      </div>
      <div className="text-[length:32px] font-bold leading-[40px]">
        {data.customer.name}
      </div>
      <div className="h-4" />
      <div className="text-m-h3 font-bold leading-8">Invoices</div>
      {data.customer.invoiceDetails.map((invoiceDetails) => (
        <div key={invoiceDetails.id} className={lineItemClassName}>
          <Link
            className="text-blue-600 underline"
            to={`../../invoices/${invoiceDetails.id}`}
          >
            {invoiceDetails.number}
          </Link>
          <div
            className={
              "uppercase" +
              " " +
              (invoiceDetails.dueStatus === "paid"
                ? "text-green-brand"
                : invoiceDetails.dueStatus === "overdue"
                ? "text-red-brand"
                : "")
            }
          >
            {invoiceDetails.dueStatusDisplay}
          </div>
          <div>{currencyFormatter.format(invoiceDetails.totalAmount)}</div>
        </div>
      ))}
    </div>
  );
}
