import { Facility, FacilityRequirement, Prisma } from '@prisma/client';
import prisma from '../client';

export type FacilitiesWithDocuments = Prisma.PromiseReturnType<typeof queryFacilities>;
/**
 * Query for facilities
 * @param {Object} filter - filter
 * @returns {Promise<QueryResult>}
 */
const queryFacilities = async (filter: object) => {
  const facilities = await prisma.facility.findMany({
    where: filter,
    select: {
      id: true,
      name: true,
      is_active: true,
      requirements: {
        select: {
          document: {
            select: {
              workers: {
                select: {
                  worker_id: true
                }
              }
            }
          }
        }
      }
    }
  });
  return facilities;
};

/**
 * Get facility by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Facility, Key> | null>}
 */
const getFacilityById = async <Key extends keyof Facility>(
  id: number,
  keys: Key[] = ['id', 'name', 'is_active'] as Key[]
): Promise<Pick<Facility, Key> | null> => {
  return prisma.facility.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Facility, Key> | null>;
};

export default {
  queryFacilities,
  getFacilityById
};
