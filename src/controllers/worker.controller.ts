import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { workerService, facilityService, shiftService } from "../services";
import * as _ from "lodash";
import moment from "moment";

const getAvailableShifts = catchAsync(async (req, res) => {
  const { workerId } = req.params;
  const worker = await workerService.getWorkerById(workerId);
  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Worker not found");
  }

  // Match the worker with available shfits/facilities
  // Check if worker is active
  const { is_active, profession } = worker;
  if (!is_active) {
    return res.send({
      message:
        "Worker is not active, please activate to see matching shifts across facilities",
    });
  }

  // Get all facilities which are active and worker has all documents required by facility
  const filter = {
    is_active: true,
  };
  const facilities = await facilityService.queryFacilities(filter);

  const filteredFacilities = facilities.filter((facility) => {
    const { requirements } = facility;

    const eligibleWorkersArray = requirements.map((requirement) => {
      return requirement.document.workers.map((worker) => worker.worker_id);
    });

    return eligibleWorkersArray.every((eligibleWorkers) => {
      if (eligibleWorkers.includes(workerId)) {
        return true;
      } else {
        return false;
      }
    });
  });

  if (filteredFacilities.length === 0) {
    return res.send({ message: "No available shifts found" });
  }

  // Get all shift for above facilities which are not deleted, not claimed and matches profession
  const facilitiesIds = filteredFacilities.map((facility) => facility.id);
  const shiftFilter = {
    is_deleted: false,
    profession: profession,
    worker_id: null,
    facility_id: { in: facilitiesIds },
  };
  const shifts = await shiftService.queryShifts(shiftFilter);

  if (shifts.length === 0) {
    return res.send({ message: "No available shifts found" });
  }

  // Get all shifts for the current worker
  const workerShiftFilter = {
    is_deleted: false,
    worker_id: workerId,
  };
  const shiftsForCurrentWorker = await shiftService.queryShifts(
    workerShiftFilter
  );

  // Filter out eligible shifts which overlap with shifts of current worker
  const availableShifts = shifts.filter((shift) => {
    const { start: startForEligibleShift, end: endForEligibleShift } = shift;

    const result = shiftsForCurrentWorker.every((shiftForCurrentWorker) => {
      const {
        start: startForShiftForCurrentWorker,
        end: endForShiftForCurrentWorker,
      } = shiftForCurrentWorker;

      if (
        startForEligibleShift < startForShiftForCurrentWorker &&
        endForEligibleShift < startForShiftForCurrentWorker
      ) {
        return true;
      } else if (
        startForEligibleShift > endForShiftForCurrentWorker &&
        endForEligibleShift > endForShiftForCurrentWorker
      ) {
        return true;
      }

      return false;
    });

    return result;
  });

  // Group shifts by date
  const dateFormatter = (item: any) =>
    moment(item.start).utc().format("YYYY-MM-DD");
  const groupedShiftsByDate = _.groupBy(availableShifts, dateFormatter);

  res.send(groupedShiftsByDate);
});

export default {
  getAvailableShifts,
};
