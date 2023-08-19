import express from 'express';
import validate from '../../middlewares/validate';
import { workerValidation } from '../../validations';
import { workerController } from '../../controllers';

const router = express.Router();

router
  .route('/:workerId')
  .get(validate(workerValidation.getWorker), workerController.getAvailableShifts);

export default router;

/**
 * @swagger
 * tags:
 *   name: Workers
 *   description: Worker related endpoints
 */

/**
 * @swagger
 * /worker/{id}:
 *   get:
 *     summary: Get available shifts for a worker
 *     description: Get available shifts for a worker by matching worker <--> facilities
 *     tags: [Worker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Worker'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */
