import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getDepositDetails } from "~/models/deposit.server";
import { requireUser } from "~/session.server";

type LoaderData = {
  depositNote: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request);
  const { depositId } = params;
  if (typeof depositId !== "string") {
    throw new Error("This should be unpossible.");
  }
  const depositDetails = await getDepositDetails(depositId);
  if (!depositDetails) {
    throw new Response("not found", { status: 404 });
  }

  return json<LoaderData>({
    depositNote: depositDetails.note,
  });
};

export default function DepositRoute() {
  const data = useLoaderData() as LoaderData;
  return (
    <div className="p-8">
      {data.depositNote ? (
        <span>
          Note:
          <br />
          <span className="pl-1">{data.depositNote}</span>
        </span>
      ) : (
        <span className="text-m-p-sm uppercase text-gray-500 md:text-d-p-sm">
          No note
        </span>
      )}
    </div>
  );
}
