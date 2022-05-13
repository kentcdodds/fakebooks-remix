import { Form, useFetcher } from "@remix-run/react";
import { LabelText, MinusIcon, PlusIcon } from "~/components";
import { useCombobox } from "downshift";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { requireUser } from "~/session.server";
import { searchCustomers } from "~/models/customer.server";
import invariant from "tiny-invariant";
import { useId, useState } from "react";
import clsx from "clsx";
import type { LineItemFields } from "~/models/invoice.server";
import { createInvoice } from "~/models/invoice.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return json({});
};

type CustomerSearchResult = {
  customers: Awaited<ReturnType<typeof searchCustomers>>;
};

export const action: ActionFunction = async ({ request }) => {
  await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "customer-search": {
      const query = formData.get("query");
      invariant(typeof query === "string", "query is required");
      return json<CustomerSearchResult>({
        customers: await searchCustomers(query),
      });
    }
    case "create": {
      const customerId = formData.get("customerId");
      const dueDateString = formData.get("dueDate");
      invariant(typeof customerId === "string", "customerId is required");
      invariant(typeof dueDateString === "string", "dueDate is required");
      const [dueDateYear, dueDateMonth, dueDateDay] = dueDateString
        .split("-")
        .map(Number);
      const dueDate = new Date(dueDateYear, dueDateMonth - 1, dueDateDay);

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
            className="text-lg w-full rounded border border-gray-500 px-2 py-1"
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
                  className="text-lg w-full rounded border border-gray-500 px-2 py-1"
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
                  className="text-lg w-full rounded border border-gray-500 px-2 py-1"
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
                className="text-lg w-full rounded border border-gray-500 px-2 py-1"
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

type Customer = CustomerSearchResult["customers"][number];

function CustomerCombobox() {
  const customerFetcher = useFetcher();
  const id = useId();
  const customers =
    (customerFetcher.data as CustomerSearchResult | null)?.customers ?? [];
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | null | undefined
  >(null);

  // sorry Ryan. I was going to use @reach/combobox, but ran into this issue:
  // https://github.com/reach/reach-ui/pull/628
  const cb = useCombobox<Customer>({
    id,
    onSelectedItemChange: ({ selectedItem }) => {
      setSelectedCustomer(selectedItem);
    },
    items: customers,
    itemToString: (item) => (item ? item.name : ""),
    onInputValueChange: (changes) => {
      if (!changes.inputValue) return;

      customerFetcher.submit(
        {
          intent: "customer-search",
          query: changes.inputValue,
        },
        { method: "post" }
      );
    },
  });

  const displayMenu = cb.isOpen && customers.length > 0;

  return (
    <div className="relative">
      <input
        name="customerId"
        type="hidden"
        value={selectedCustomer?.id ?? ""}
      />
      <label {...cb.getLabelProps()}>
        <LabelText>Customer</LabelText>
      </label>
      <div {...cb.getComboboxProps()}>
        <input
          {...cb.getInputProps({
            className: clsx("text-lg w-full border border-gray-500 px-2 py-1", {
              "rounded-t rounded-b-0": displayMenu,
              rounded: !displayMenu,
            }),
          })}
        />
      </div>
      <ul
        {...cb.getMenuProps({
          className: clsx(
            "absolute z-10 bg-white shadow-lg rounded-b w-full border border-t-0 border-gray-500 max-h-[180px] overflow-scroll",
            { hidden: !displayMenu }
          ),
        })}
      >
        {cb.isOpen
          ? customers.map((customer, index) => (
              <li
                className={clsx("cursor-pointer py-1 px-2", {
                  "bg-green-200": cb.highlightedIndex === index,
                })}
                key={customer.id}
                {...cb.getItemProps({ item: customer, index })}
              >
                {customer.name} ({customer.email})
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
