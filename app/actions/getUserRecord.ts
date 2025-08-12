'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import type { Record as DbRecord } from '@prisma/client';

async function getUserRecord(): Promise<{
  record?: number;
  daysWithRecords?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    const records: DbRecord[] = await db.record.findMany({
      where: { userId },
    });

    // Sum all amounts
    const record = records.reduce((sum, rec) => sum + rec.amount, 0);

    // Count the number of days with valid records (amount > 0)
    const daysWithRecords = records.filter((rec) => rec.amount > 0).length;

    return { record, daysWithRecords };
  } catch (error) {
    console.error('Error fetching user record:', error);
    return { error: 'Database error' };
  }
}

export default getUserRecord;
