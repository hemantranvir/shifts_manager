import { Shift } from '@prisma/client';
import prisma from '../client';

/**
 * Query for shifts
 * @param {Object} filter - filter
 * @returns {Promise<QueryResult>}
 */
const queryShifts = async (filter: object) => {
  const shifts = await prisma.shift.findMany({
    where: filter,
    orderBy: [
      {
        start: 'desc'
      }
    ]
  });
  return shifts;
};

/**
 * Get Shift by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Shift, Key> | null>}
 */
const getShiftById = async <Key extends keyof Shift>(
  id: number,
  keys: Key[] = ['id', 'is_deleted'] as Key[]
): Promise<Pick<Shift, Key> | null> => {
  return prisma.shift.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Shift, Key> | null>;
};

export default {
  queryShifts,
  getShiftById
};
