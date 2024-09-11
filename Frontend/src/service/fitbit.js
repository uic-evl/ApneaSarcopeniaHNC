// constants
import { PATIENT_ID } from "@src/constants";
import { fitbitServiceNames } from "@src/constants/serviceNames";

// services
import { baseApi } from "@src/service";

export const getDailySleepLog = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: fitbitServiceNames.sleep_log_by_date,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  if (response.data.sleep.length === 0) {
    return 404;
  }

  return response.data.sleep?.[0].levels.data;
};

export const getSleepLog = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: fitbitServiceNames.sleep_log,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  console.log(response)
  return response.data.sleep;
};

export const getSteps = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: fitbitServiceNames.steps,
    patient_id: PATIENT_ID,
    resource: "steps",
    ...additionalAttributes,
  });

  return response.data["activities-steps"];
};

export const getHeartRate = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: fitbitServiceNames.heart_rate,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data["activities-heart"];
};

export const getSpo2 = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: fitbitServiceNames.spo2,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data;
};
