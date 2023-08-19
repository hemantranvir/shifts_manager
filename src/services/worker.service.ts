import { Worker } from '@prisma/client';
import prisma from '../client';

/**
 * Get worker by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Worker, Key> | null>}
 */
const getWorkerById = async <Key extends keyof Worker>(
  id: number,
  keys: Key[] = ['id', 'name', 'is_active', 'profession'] as Key[]
): Promise<Pick<Worker, Key> | null> => {
  return prisma.worker.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Worker, Key> | null>;
};

export default {
  getWorkerById
};
