import { prisma } from "~/db.server";
import type { Invoice } from "@prisma/client";
import { currencyFormatter } from "~/utils";

export type { Invoice };

const getDaysToDueDate = (date: Date) =>
  Math.ceil(
    (date.getTime() - asUTC(new Date()).getTime()) / (1000 * 60 * 60 * 24)
  );

export async function getInvoiceDueInfo(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      dueDate: true,
      lineItems: {
        select: { quantity: true, unitPrice: true },
      },
      deposits: {
        select: { amount: true },
      },
    },
  });

  if (!invoice) return null;

  return getInvoiceDerivedData(invoice);
}

function getInvoiceDerivedData(invoice: {
  dueDate: Date;
  lineItems: Array<{ quantity: number; unitPrice: number }>;
  deposits: Array<{ amount: number }>;
}) {
  const daysToDueDate = getDaysToDueDate(invoice.dueDate);

  const totalAmount = invoice.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const totalDeposits = invoice.deposits.reduce(
    (acc, deposit) => acc + deposit.amount,
    0
  );
  const dueStatus =
    totalAmount === totalDeposits
      ? "paid"
      : totalDeposits > totalAmount
      ? "overpaid"
      : daysToDueDate < 0
      ? "overdue"
      : "due";

  const dueStatusDisplay =
    dueStatus === "paid"
      ? "Paid"
      : dueStatus === "overpaid"
      ? "Overpaid"
      : dueStatus === "overdue"
      ? "Overdue"
      : daysToDueDate === 0
      ? "Due today"
      : `Due in ${daysToDueDate} Days`;

  return {
    totalAmount,
    totalAmountFormatted: currencyFormatter.format(totalAmount),
    totalDeposits,
    daysToDueDate,
    dueStatus,
    dueStatusDisplay,
  };
}

function asUTC(date: Date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export async function getInvoiceListItems() {
  const invoices = await prisma.invoice.findMany({
    select: {
      id: true,
      dueDate: true,
      number: true,
      customer: {
        select: { name: true },
      },
      lineItems: {
        select: { quantity: true, unitPrice: true },
      },
      deposits: {
        select: { amount: true },
      },
    },
  });
  return invoices.map((invoice) => {
    return {
      id: invoice.id,
      name: invoice.customer.name,
      number: invoice.number,
      ...getInvoiceDerivedData(invoice),
    };
  });
}

export async function getInvoiceDetails(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      number: true,
      invoiceDate: true,
      dueDate: true,
      customer: {
        select: { name: true },
      },
      lineItems: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          description: true,
        },
      },
      deposits: {
        select: { amount: true },
      },
    },
  });
  if (!invoice) return null;
  return { invoice, ...getInvoiceDerivedData(invoice) };
}
