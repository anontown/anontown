import * as P from "@prisma/client";

export const prisma = new P.PrismaClient();

export type PrismaTransactionClient = Omit<
  P.PrismaClient<
    P.Prisma.PrismaClientOptions,
    never,
    P.Prisma.RejectOnNotFound | P.Prisma.RejectPerOperation | undefined
  >,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
>;

class RollbackError extends Error {}

export async function $transactionAfterRollback(
  callback: (prisma: PrismaTransactionClient) => Promise<void>,
): Promise<void> {
  try {
    await prisma.$transaction(async prisma => {
      await callback(prisma);
      throw new RollbackError();
    });
  } catch (e) {
    if (e instanceof RollbackError) {
      return;
    }
    throw e;
  }
}
