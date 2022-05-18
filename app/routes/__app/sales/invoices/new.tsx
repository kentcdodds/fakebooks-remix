import { Form } from "@remix-run/react";
import { inputClasses, LabelText, MinusIcon, PlusIcon } from "~/components";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { requireUser } from "~/session.server";
import invariant from "tiny-invariant";
import { useId, useState } from "react";
import type { LineItemFields } from "~/models/invoice.server";
import { createInvoice } from "~/models/invoice.server";
import { parseDate } from "~/utils";
import { CustomerCombobox } from "~/routes/resources/customers";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "create": {
      const customerId = formData.get("customerId");
      const dueDateString = formData.get("dueDate");
      invariant(typeof customerId === "string", "customerId is required");
      invariant(typeof dueDateString === "string", "dueDate is required");
      const dueDate = parseDate(dueDateString);

      const lineItemQuantities = formData.getAll("quantity");
      const lineItemUnitPrices = formData.getAll("unitPrice");
      const lineItemDescriptions = formData.getAll("description");
      const lineItems: Array<LineItemFields> = [];
      for (let i = 0; i < lineItemQuantities.length; i++) {
        const quantity = +lineItemQuantities[i];
        const unitPrice = +lineItemUnitPrices[i];
        const description = lineItemDescriptions[i];
        invariant(typeof quantity === "number", "quantity is required");
        invariant(typeof unitPrice === "number", "unitPrice is required");
        invariant(typeof description === "string", "description is required");

        lineItems.push({ quantity, unitPrice, description });
      }

      const invoice = await createInvoice({ dueDate, customerId, lineItems });

      return redirect(`/sales/invoices/${invoice.id}`);
    }
  }
  return new Response(`Unsupported intent: ${intent}`, { status: 400 });
};

export default function NewInvoice() {
  return (
    <div className="relative p-10">
      <h2 className="mb-4 font-display">New Invoice</h2>
      <Form method="post" className="flex flex-col gap-4">
        <CustomerCombobox />
        <div>
          <label htmlFor="dueDate">
            <LabelText>Due Date</LabelText>
          </label>
          <input
            id="dueDate"
            name="dueDate"
            className={inputClasses}
            type="date"
          />
        </div>
        <LineItems />
        <div>
          <button
            type="submit"
            name="intent"
            value="create"
            className="w-full rounded bg-green-500 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
          >
            Create Invoice
          </button>
        </div>
      </Form>
    </div>
  );
}

const generateRandomId = () => Math.random().toString(32).slice(2);

function LineItems() {
  const firstId = useId();
  const [lineItems, setLineItems] = useState(() => [firstId]);
  return (
    <div className="flex flex-col gap-2">
      {lineItems.map((lineItemClientId, index) => (
        <fieldset key={lineItemClientId} className="border-b-2 py-2">
          <div className="flex gap-2">
            <button
              type="button"
              title="Remove Line Item"
              onClick={() => {
                setLineItems((lis) =>
                  lis.filter((id, i) => id !== lineItemClientId)
                );
              }}
            >
              <MinusIcon />
            </button>
            <legend>Line Item {index + 1}</legend>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex w-full gap-2">
              <div className="flex-1">
                <LabelText>
                  <label htmlFor={`quantity-${lineItemClientId}`}>
                    Quantity:
                  </label>
                </LabelText>
                <input
                  id={`quantity-${lineItemClientId}`}
                  name="quantity"
                  type="number"
                  className={inputClasses}
                />
              </div>
              <div className="flex-1">
                <LabelText>
                  <label htmlFor={`unitPrice-${lineItemClientId}`}>
                    Unit Price:
                  </label>
                </LabelText>
                <input
                  id={`unitPrice-${lineItemClientId}`}
                  name="unitPrice"
                  type="number"
                  min="1"
                  step="any"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <LabelText>
                <label htmlFor={`description-${lineItemClientId}`}>
                  Description:
                </label>
              </LabelText>
              <input
                id={`description-${lineItemClientId}`}
                name="description"
                className={inputClasses}
              />
            </div>
          </div>
        </fieldset>
      ))}
      <div className="mt-3 text-right">
        <button
          title="Add Line Item"
          type="button"
          onClick={() => setLineItems((lis) => [...lis, generateRandomId()])}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
