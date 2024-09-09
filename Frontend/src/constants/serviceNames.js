export const withingsServiceNames = Object.freeze({
  weight: "withings_weight",
  height: "withings_fetch_height",
  bone: "withings_bone_mass",
  fat_ratio: "withings_fat_ratio",
  muscle: "withings_muscle_mass",
  fat_mass_weight: "withings_fat_mass_weight",
});

export const fitbitServiceNames = Object.freeze({
  sleep_log_by_date: "fitbit_fetch_sleep_log_by_date",
  sleep_log: "fitbit_fetch_sleep_log_by_date_range",
  steps: "fitbit_fetch_activity_time_series_by_date_range",
  heart_rate: "fitbit_fetch_heart_rate_time_series_by_date_range",
  spo2: "fitbit_fetch_spO2_summary_by_date_range",
});
