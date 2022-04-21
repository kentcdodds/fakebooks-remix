import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getExperiments } from "~/models/experiments.server";

export const loader: LoaderFunction = async ({ request }) => {
  const experiments = await getExperiments(request);
  return json(
    { experiments },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
};
