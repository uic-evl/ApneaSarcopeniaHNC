import { baseApi } from "@src/service";

// constants
import { withingsServiceNames } from "@src/constants/serviceNames";
import { PATIENT_ID } from "@src/constants";

export const getWeight = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: withingsServiceNames.weight,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data.body.measuregrps;
};

export const getHeight = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: withingsServiceNames.height,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data.body.measuregrps;
};

export const getBoneMass = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: withingsServiceNames.bone,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data.body.measuregrps;
};

export const getFatRatio = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: withingsServiceNames.fat_ratio,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data.body.measuregrps;
};

export const getMuscle = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: withingsServiceNames.muscle,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data.body.measuregrps;
};

export const getFatMassWeight = async (additionalAttributes = {}) => {
  const response = await baseApi.post("", {
    request_data: withingsServiceNames.fat_mass_weight,
    patient_id: PATIENT_ID,
    ...additionalAttributes,
  });

  return response.data.body.measuregrps;
};
