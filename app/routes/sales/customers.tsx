import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch } from "@remix-run/react";
import { getExperiments } from "~/models/experiments.server";

export const loader: LoaderFunction = async ({ request }) => {
  // pretend we determine this based on some value in the DB or an A/B test
  const experiments = await getExperiments(request);
  if (!experiments.customers) {
    throw new Response("Not found", { status: 404 });
  }
  return json({});
};

export default function Customers() {
  return <div>We love our customers. Because money.</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
