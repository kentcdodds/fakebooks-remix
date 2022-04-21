// just accepting the request here just to make it more realistic...
// normally you'd determine who the user is and whether they get access to certain experiments.
export async function getExperiments(request: Request) {
  return { customers: true };
}
