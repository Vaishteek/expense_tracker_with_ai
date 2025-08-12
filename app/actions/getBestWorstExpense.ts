'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import type { Record as DbRecord } from '@prisma/client';

async function getBestWorstExpense(): Promise<{
  bestExpense?: number;
  worstExpense?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    // Fetch all records for the authenticated user
    const records: Pick<DbRecord, 'amount'>[] = await db.record.findMany({
      where: { userId },
      select: { amount: true }, // Fetch only the `amount` field for efficiency
    });

    if (records.length === 0) {
      return { bestExpense: 0, worstExpense: 0 }; // Return 0 if no records exist
    }

    const amounts = records.map((record) => record.amount);

    // Calculate best and worst expense amounts
    const bestExpense = Math.max(...amounts); // Highest amount
    const worstExpense = Math.min(...amounts); // Lowest amount

    return { bestExpense, worstExpense };
  } catch (error) {
    console.error('Error fetching expense amounts:', error);
    return { error: 'Database error' };
  }
}

export default getBestWorstExpense;
