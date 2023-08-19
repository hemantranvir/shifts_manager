import Joi from 'joi';

const getWorker = {
  params: Joi.object().keys({
    workerId: Joi.number().integer()
  })
};

export default {
  getWorker
};
