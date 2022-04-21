export type Invoice = {
  id: string;
  name: string;
  number: number;
  invoiceDate: Date;
  dueDate: Date;
  paid: boolean;
  lineItems: Array<{
    id: string;
    label: string;
    amount: number;
  }>;
};

type DueStatus = "overdue" | "due" | "paid";

const getDueStatus = (invoice: Invoice): DueStatus => {
  const days = Math.ceil(
    (invoice.dueDate.getTime() - asUTC(new Date()).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return invoice.paid ? "paid" : days < 0 ? "overdue" : "due";
};

export function getInvoiceDue(invoice: Invoice) {
  const days = Math.ceil(
    (invoice.dueDate.getTime() - asUTC(new Date()).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return invoice.paid
    ? "Paid"
    : days < 0
    ? "Overdue"
    : days === 0
    ? "Due Today"
    : `Due in ${days} Days`;
}

function asUTC(date: Date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

const fromNow = (days: number) =>
  asUTC(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * days));

async function getInvoices(): Promise<Array<Invoice>> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 40 + 60));
  return [
    {
      id: "ci3ftpj10f8",
      name: "Santa Monica",
      number: 1995,
      invoiceDate: fromNow(-13),
      dueDate: fromNow(-1),
      paid: false,
      lineItems: [{ id: "jhi2a7r67p8", label: "Cat Drawing", amount: 10_800 }],
    },
    {
      id: "b56pp9qeojg",
      name: "Stankonia",
      number: 2000,
      invoiceDate: fromNow(-5),
      dueDate: fromNow(0),
      paid: false,
      lineItems: [
        { id: "ou36onk8a6", label: "Pro Plan", amount: 6_000 },
        { id: "4110dnk4i78", label: "Custom", amount: 2_000 },
      ],
    },
    {
      id: "accrusjdu6o",
      name: "Ocean Avenue",
      number: 2003,
      invoiceDate: fromNow(-16),
      dueDate: fromNow(12),
      paid: true,
      lineItems: [{ id: "3nvun1ibeto", label: "Cat Drawing", amount: 9_500 }],
    },
    {
      id: "8hdbvg5vseo",
      name: "Tubthumper",
      number: 1997,
      invoiceDate: fromNow(-2),
      dueDate: fromNow(10),
      paid: false,
      lineItems: [{ id: "1oi4qcv7u8", label: "Cat Drawing", amount: 14_000 }],
    },
    {
      id: "vd897ll2h7",
      name: "Wide Open Spaces",
      number: 1998,
      invoiceDate: fromNow(-4),
      dueDate: fromNow(8),
      paid: false,
      lineItems: [{ id: "669b6npbun8", label: "Cat Drawing", amount: 4_600 }],
    },
  ];
}

export async function getInvoiceListItems() {
  const invoices = await getInvoices();
  return invoices.map((i) => ({
    id: i.id,
    total: i.lineItems.reduce((sum, item) => sum + item.amount, 0),
    number: i.number,
    dueDisplay: getInvoiceDue(i),
    dueStatus: getDueStatus(i),
    name: i.name,
  }));
}

export async function getInvoice(id: string) {
  const invoices = await getInvoices();
  return invoices.find((i) => i.id === id);
}
