import { prisma } from "~/db.server";

export async function searchCustomers(query: string) {
  return await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    where: {
      OR: [
        {
          email: {
            equals: query,
          },
        },
        {
          fullName: {
            equals: query,
          },
        },
      ],
    },
  });
}
