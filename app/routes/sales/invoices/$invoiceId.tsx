import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LabelText } from "~/components";
import type { Invoice } from "~/models/invoice.server";
import { getInvoice } from "~/models/invoice.server";
import { getInvoiceDue } from "~/models/invoice.server";

type LoaderData = {
  invoice: Invoice;
  totalDue: number;
  dueDisplay: string;
  invoiceDateDisplay: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { invoiceId } = params;
  if (typeof invoiceId !== "string") {
    throw new Error("This should be unpossible.");
  }
  const invoice = await getInvoice(invoiceId);
  if (!invoice) {
    throw new Response("not found", { status: 404 });
  }
  return json<LoaderData>({
    invoice,
    totalDue: invoice.lineItems.reduce((total, item) => total + item.amount, 0),
    dueDisplay: getInvoiceDue(invoice),
    invoiceDateDisplay: invoice.invoiceDate.toLocaleDateString(),
  });
};

export default function InvoiceRoute() {
  const data = useLoaderData() as LoaderData;
  return (
    <div className="relative p-10">
      <div className="text-[length:14px] font-bold leading-6">
        {data.invoice.name}
      </div>
      <div className="text-[length:32px] font-bold leading-[40px]">
        ${data.totalDue.toLocaleString()}
      </div>
      <LabelText>
        {data.dueDisplay} • Invoiced {data.invoiceDateDisplay}
      </LabelText>
      <div className="h-4" />
      {data.invoice.lineItems.map((item) => (
        <LineItem key={item.id} label={item.label} amount={item.amount} />
      ))}
      <LineItem
        bold
        label="Net Total"
        amount={data.invoice.lineItems.reduce((sum, li) => sum + li.amount, 0)}
      />
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
  label,
  amount,
  bold,
}: {
  label: string;
  amount: number;
  bold?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between border-t border-gray-100 py-4 text-[14px] leading-[24px]" +
        " " +
        (bold ? "font-bold" : "")
      }
    >
      <div>{label}</div>
      <div>${amount.toLocaleString()}</div>
    </div>
  );
}
