import { Profession } from '@prisma/client';
import prisma from '../../src/client';

interface Document {
  name: string;
  is_active: boolean;
}

interface Facility {
  name: string;
  is_active: boolean;
}

interface Worker {
  name: string;
  is_active: boolean;
  profession: Profession;
}

interface FacilityRequirement {
  facility_id: number;
  document_id: number;
}

interface DocumentWorker {
  worker_id: number;
  document_id: number;
}

interface Shift {
  start: Date;
  end: Date;
  profession: Profession;
  is_deleted: boolean;
  facility_id: number;
  worker_id: number | null;
}

export async function insertDocuments(documents: Document[]) {
  await prisma.document.createMany({ data: documents });
}

export async function insertFacilities(facilities: Facility[]) {
  await prisma.facility.createMany({ data: facilities });
}

export async function insertWorkers(workers: Worker[]) {
  return await prisma.worker.createMany({ data: workers });
}

export async function insertFacilityRequirements(facilityRequirements: FacilityRequirement[]) {
  await prisma.facilityRequirement.createMany({ data: facilityRequirements });
}

export async function insertDocumentWorkers(documentWorkers: DocumentWorker[]) {
  await prisma.documentWorker.createMany({ data: documentWorkers });
}

export async function insertShifts(shifts: Shift[]) {
  await prisma.shift.createMany({ data: shifts });
}
