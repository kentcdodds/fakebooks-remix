import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import { LabelText } from "~/components";
import { getInvoiceDetails } from "~/models/invoice.server";
import { requireUser } from "~/session.server";

type LoaderData = {
  customerName: string;
  totalAmountFormatted: string;
  dueDisplay: string;
  invoiceDateDisplay: string;
  lineItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    description: string;
  }>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request);
  const { invoiceId } = params;
  if (typeof invoiceId !== "string") {
    throw new Error("This should be unpossible.");
  }
  const invoiceDetails = await getInvoiceDetails(invoiceId);
  if (!invoiceDetails) {
    throw new Response("not found", { status: 404 });
  }
  return json<LoaderData>({
    customerName: invoiceDetails.invoice.customer.name,
    totalAmountFormatted: invoiceDetails.totalAmountFormatted,
    dueDisplay: invoiceDetails.dueStatusDisplay,
    invoiceDateDisplay: invoiceDetails.invoice.invoiceDate.toLocaleDateString(),
    lineItems: invoiceDetails.invoice.lineItems.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
    })),
  });
};

const lineItemClassName =
  "flex justify-between border-t border-gray-100 py-4 text-[14px] leading-[24px]";
export default function InvoiceRoute() {
  const data = useLoaderData() as LoaderData;
  return (
    <div className="relative p-10">
      <div className="text-[length:14px] font-bold leading-6">
        {data.customerName}
      </div>
      <div className="text-[length:32px] font-bold leading-[40px]">
        {data.totalAmountFormatted}
      </div>
      <LabelText>
        {data.dueDisplay} • Invoiced {data.invoiceDateDisplay}
      </LabelText>
      <div className="h-4" />
      {data.lineItems.map((item) => (
        <LineItem
          key={item.id}
          description={item.description}
          unitPrice={item.unitPrice}
          quantity={item.quantity}
        />
      ))}
      <div className={`${lineItemClassName} font-bold`}>
        <div>Net Total</div>
        <div>{data.totalAmountFormatted.toLocaleString()}</div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="absolute inset-0 flex justify-center bg-red-100 pt-4">
      <div className="text-center text-red-brand">
        <div className="text-[14px] font-bold">Oh snap!</div>
        <div className="px-2 text-[12px]">
          There was a problem loading this invoice
        </div>
      </div>
    </div>
  );
}

function LineItem({
  description,
  quantity,
  unitPrice,
}: {
  description: string;
  quantity: number;
  unitPrice: number;
}) {
  return (
    <div className={lineItemClassName}>
      <div>{description}</div>
      {quantity === 1 ? null : <div className="text-[10px]">({quantity}x)</div>}
      <div>${unitPrice.toLocaleString()}</div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  if (caught.status === 404) {
    return (
      <div className="p-12 text-red-500">
        No invoice found with the ID of "{params.invoiceId}"
      </div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
