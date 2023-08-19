import request from 'supertest';
import { faker } from '@faker-js/faker';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDb';
import { describe, test, beforeAll } from '@jest/globals';
import {
  insertDocumentWorkers,
  insertDocuments,
  insertFacilities,
  insertFacilityRequirements,
  insertShifts,
  insertWorkers
} from '../fixtures/fixture';
import { Profession } from '@prisma/client';

setupTestDB();

interface StartEnd {
  start: Date;
  end: Date;
}

function returnRandomNumberBetweenOneAndLimit(limit: number): number {
  return Math.floor(Math.random() * limit) + 1;
}

const maxFacilities = 2;
const maxDocuments = 2;
const maxDocumentWorkers = 2;
const maxWorkers = 4;
const maxShifts = 4;
const maxFacilityRequirements = 2;
const startHours = [5, 13, 20];
const shiftHours = 5;

function returnRandomStartAndEnd(): StartEnd {
  const day = returnRandomNumberBetweenOneAndLimit(31);
  const startHourIndex = returnRandomNumberBetweenOneAndLimit(3) - 1;
  const startHour = startHours[startHourIndex];
  const start = new Date();
  start.setFullYear(2023, 1, day);
  start.setHours(startHour, 0, 0);
  const end = new Date(start.getTime());
  end.setTime(end.getTime() + shiftHours * 60 * 60 * 1000);
  return {
    start,
    end
  };
}

describe('Worker routes', () => {
  describe('GET /v1/worker', () => {
    beforeAll(async () => {
      const workers = [];
      for (let i = 0; i < maxWorkers / 2; i++) {
        workers.push({
          name: faker.name.fullName(),
          is_active: true,
          profession: Profession.CNA
        });
      }
      for (let i = 0; i < maxWorkers / 2; i++) {
        workers.push({
          name: faker.name.fullName(),
          is_active: false,
          profession: Profession.CNA
        });
      }
      await insertWorkers(workers);
    });

    test('should return worker not found error', async () => {
      await request(app).get('/v1/worker/10').expect(httpStatus.NOT_FOUND);
    });

    test('should return worker is not active message', async () => {
      await request(app).get('/v1/worker/3').expect({
        message: 'Worker is not active, please activate to see matching shifts across facilities'
      });
    });
  });

  test('should return shifts for the worker 1 and no shifts for worker 2', async () => {
    const documents = [];
    for (let i = 0; i < maxDocuments; i++) {
      documents.push({
        name: faker.name.fullName(),
        is_active: true
      });
    }
    await insertDocuments(documents);

    const facilities = [];
    for (let i = 0; i < maxFacilities; i++) {
      facilities.push({
        name: faker.name.fullName(),
        is_active: true
      });
    }
    await insertFacilities(facilities);

    const facilityRequirements = [];
    let facilityNo = 1;
    let documentNo = 1;
    for (let i = 0; i < maxFacilityRequirements; i++) {
      facilityRequirements.push({
        facility_id: facilityNo,
        document_id: documentNo
      });
      facilityNo = facilityNo + 1;
      documentNo = documentNo + 1;
    }
    await insertFacilityRequirements(facilityRequirements);

    const documentWorkers = [];
    let workerNo = 1;
    documentNo = 1;
    for (let i = 0; i < maxDocumentWorkers; i++) {
      documentWorkers.push({
        worker_id: workerNo,
        document_id: documentNo
      });
      workerNo = workerNo + 1;
      documentNo = documentNo + 1;
    }
    insertDocumentWorkers(documentWorkers);

    const maxShiftsPerArray = 2;
    const maxRounds = maxShifts / maxShiftsPerArray;
    for (let i = 0; i < maxRounds; i++) {
      const shifts = [];
      for (let j = 0; j < maxShiftsPerArray; j++) {
        const { start, end } = returnRandomStartAndEnd();
        shifts.push({
          start,
          end,
          profession: Profession.CNA,
          is_deleted: false,
          facility_id: 1,
          worker_id: null
        });
      }
      insertShifts(shifts);
    }

    await request(app).get('/v1/worker/1').expect(httpStatus.OK);
    await request(app).get('/v1/worker/2').expect({
      message: 'No available shifts found'
    });
  });
});
