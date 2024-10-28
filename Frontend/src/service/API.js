import moment from "moment";
import { useNavigate } from "react-router-dom";
import * as env from "../env.js";

function getTimeIntervalSinceToday(months) {
  const today = moment().format("YYYY-MM-DD");
  const startDate = moment().subtract(months, "months").format("YYYY-MM-DD");
  return [startDate, today];
}

function toTimestamp(a) {
  return moment(a.dateOfSleep).unix() * 1000;
}

import {
  calculateAverageProperty,
  calculateValueByUnit,
  convertTimestampToDateString,
} from "@src/utils";

//https://developer.withings.com/api-reference#tag/measure/operation/measure-getmeas
const withingsKeys = {
  weight: 1, //kg
  height: 4, //meter
  fat_free_mass: 5, //kg
  fat_ratio: 6, //%
  fat_mass_weight: 8, //kg
  spo2: 54, //%
  muscle_mass: 76, //kg
  bone_mass: 88, //kg
};

const validFitibtActivities = [
  "activityCalories",
  "calories",
  "caloriesBMR",
  "distance",
  "elevation",
  "floor",
  "minutesSedentary",
  "minutesLightlyActive",
  "minutesFairlyActive",
  "minutesVeryActive",
  "steps",
  "swimming-strokes",
];
const timeFormat = "YY MMM DD";
const minuteFormat = "HH:mm:ss";

class BaseAPI {
  constructor(cookieName, refreshName) {
    this.cookieName = cookieName;
    this.navigate = useNavigate();
    this.refreshName = refreshName;
    if (sessionStorage.getItem(refreshName) === null) {
      sessionStorage.setItem(refreshName, false);
    }
  }

  makeHeader(token) {
    const headers = token
      ? {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        }
      : {};
    return headers;
  }

  getToken() {
    return localStorage.getItem(this.cookieName);
  }

  getRefreshToken() {
    return localStorage.getItem(this.cookieName + "-refresh");
  }

  getExpireTime() {
    return localStorage.getItem(this.cookieName + "-expires");
  }

  isRefreshing() {
    return sessionStorage.getItem(this.refreshName);
  }

  isExpired() {
    const currTime = new Date().getTime() / 1000;
    const expireTime = this.getExpireTime();
    if (expireTime === null) {
      return true;
    }
    // return (Math.abs(currTime - Number(expireTime)) > 5)
    return currTime >= Number(expireTime) - 1;
  }

  //todo: figure out refresh tokens
  resetToken() {
    localStorage.removeItem(this.cookieName);
    localStorage.removeItem(this.cookieName + "-expires");
    localStorage.removeItem(this.cookieName + "-refresh");
    sessionStorage.removeItem(this.refreshName);
  }

  goToLogin() {
    this.navigate("/");
  }

  delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  setRefreshing(bool) {
    sessionStorage.setItem(this.refreshName, bool);
  }

  setToken(t) {
    localStorage.setItem(this.cookieName, t);
  }

  setRefreshToken(rt) {
    localStorage.setItem(this.cookieName + "refresh", rt);
  }

  setExpireTime(t) {
    localStorage.setItem(this.cookieName + "-expires", t);
  }

  setExpiresFrom(expiresIn) {
    //I thin this is ms?
    const currTime = new Date().getTime() / 1000;
    const expireTime = currTime + expiresIn;
    this.setExpireTime(expireTime);
  }

  async waitForRefresh() {
    console.log("here", this.isExpired());
    while (this.isRefreshing() === "true") {
      this.delay(100);
    }
    return true;
  }
}

export class WithingsAPI extends BaseAPI {
  async makeWithingsRequest(parameters, successCallback, errorCallback) {
    //todo: handle expired codes
    // await this.refreshWhithingsToken()
    console.log("making query for", parameters);
    const token = this.getToken();
    if (token === null) {
      console.log("withings token missing");
    }

    const url = "https://wbsapi.withings.net/measure";
    const pText = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters)) {
      pText.append(key, value);
    }
    var stuff = {
      method: "POST",
      headers: this.makeHeader(token),
      body: pText,
    };
    return fetch(url, stuff)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching withings: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (successCallback) {
          successCallback(data);
        }
        // if(data.status === 401){
        //     this.resetWithingsToken();
        // }
        return data.body.measuregrps;
      })
      .catch((error) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          console.error("Error fetching withings", url, error);
        }
        return null;
      });
  }

  async fetchWithingsEntry(item, startDate, endDate) {
    const entry = {
      action: "getmeas",
      category: "1", //  1 for real measures, 2 for user objectives.
    };

    const key = withingsKeys[item.toLowerCase()];
    if (key === undefined) {
      console.log("invalid key", item);
      return null;
    }
    entry["meastype"] = key;
    if (startDate && endDate) {
      entry["startdate"] = startDate;
      entry["endDate"] = endDate;
    }
    return this.makeWithingsRequest(entry);
  }

  async fetchWithingsBatchEntry(items, startDate, endDate) {
    //attempt at fixing the refresh problem
    await this.refreshWhithingsToken();
    let res = {};
    for (const item of items) {
      const result = await this.fetchWithingsEntry(item, startDate, endDate);
      res[item] = this.formatWithingData(result, item);
      // console.log("response", res);
    }
    return res;
  }

  formatWithingData(val, key) {
    if (key === "weight") {
      return this.formatWeight(val);
    } else if (key === "height") {
      return this.formatHeight(val);
    } else if (key === "bone_mass") {
      return this.formatBoneMass(val);
    } else if (key === "fat_ratio") {
      return this.formatFatRatio(val);
    } else if (key === "muscle_mass") {
      return this.formatMuscle(val);
    } else if (key === "fat_mass_weight") {
      return this.formatFatMassWeight(val);
    } else {
      console.log("unformatted withings data type", key);
      return val;
    }
  }

  formatWeight(measures) {
    try {
      const weights = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const weight = calculateValueByUnit(value, unit);

        return {
          weight,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });
      return weights;
    } catch (error) {
      throw new Error(error);
    }
  }

  formatHeight(measures) {
    try {
      let height = null;

      if (measures?.length) {
        const measure = measures?.[0]?.measures?.[0];

        height = calculateValueByUnit(measure.value, measure.unit);
      }

      return height;
    } catch (error) {
      throw new Error("Failed to fetch height data");
    }
  }

  formatBoneMass(measures) {
    try {
      const bone = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const bone = calculateValueByUnit(value, unit);

        return {
          bone,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });

      return bone;
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  formatFatRatio(measures) {
    try {
      const fatRatio = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const fatRatio = calculateValueByUnit(value, unit);

        return {
          fatRatio,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });
      return fatRatio;
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  formatMuscle(measures) {
    try {
      const muscle = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const muscle = calculateValueByUnit(value, unit);

        return {
          muscle,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });

      return muscle;
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  formatFatMassWeight(measures) {
    try {
      const fatMassWeights = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];
        return {
          fatMassWeight: calculateValueByUnit(value, unit),
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });
      return fatMassWeights;
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  async refreshWhithingsToken() {
    // Prepare the body for the POST request
    if (!this.isExpired()) {
      return;
    }
    if (this.isRefreshing() && this.isExpired()) {
      await this.waitForRefresh();
      return;
    }
    console.log("refreshing withings");
    const token = this.getToken();
    this.setRefreshing(true);

    const body = new URLSearchParams();
    body.append("client_id", env.WHITHINGS_CLIENT_ID);
    body.append("grant_type", "refresh_token");
    body.append("client_secret", env.WHITHINGS_SECRET);
    body.append("action", "requesttoken");
    body.append("refresh_token", token);
    const tokenUrl = "https://wbsapi.withings.net/v2/oauth2";
    console.log("whithing body", body.toString());
    fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(), // The body must be URL-encoded
    })
      .then((response) => {
        console.log("whithing refresh token response", response);
        return response.json();
      })
      .then((data) => {
        // console.log("whithing refrehsh body", data);
        if (data.body.access_token) {
          const atoken = data.body.access_token;
          console.log("Whiting Refrheshed Access Token:", atoken);

          this.setToken(atoken);
          this.setRefreshToken(data.body.refresh_token);
          this.setRefreshing(false);
          this.setExpiresFrom(data.body.expires_in);
        } else {
          console.error("Error refreshing withings access token:", data);
          this.setRefreshing(false);
          //   this.resetWithingsToken();
        }
      })
      .catch((error) => {
        console.error("Error during withing token refresh:", error);
        this.setRefreshing(false);
        // this.resetWithingsToken();
      });
  }
}

export class FitbitAPI extends BaseAPI {
  async makeFitbitQuery(url, parameters, errorCallback, successCallback) {
    //todo: figure out how to handle expired token codes
    await this.refreshFitbitToken();
    const token = this.getToken();

    const pText = new URLSearchParams();
    if (parameters) {
      for (const [key, value] of Object.entries(parameters)) {
        pText.append(key, value);
      }
      url = url + "?" + pText.toString();
    }
    var stuff = {
      method: "GET",
      headers: this.makeHeader(token),
    };

    return fetch(url, stuff)
      .then((response) => {
        if (response.status === 401) {
          this.resetToken();
        }
        if (!response.ok) {
          throw new Error(`Error fetching: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (successCallback) {
          successCallback(data);
        }
        return data;
      })
      .catch((error) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          console.error("Error fetching", url, error);
        }
        return null;
      });
  }

  async fetchFitbitProfile() {
    return this.makeFitbitQuery("https://api.fitbit.com/1/user/-/profile.json");
  }

  async fetchStepsGoal(period = "daily") {
    if (period !== "daily" && period !== "weekly") {
      throw TypeError(
        "Invalid argument to fetchStepsGoal. Must be either daily or weekly: https://dev.fitbit.com/build/reference/web-api/activity/get-activity-goals/"
      );
    }
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1/user/-/activities/goals/${period}.json`
    );
  }

  async fetchFitbitSleepLog(startDate) {
    const args = {
      afterDate: startDate,
      sort: "desc",
      limit: 100,
      offset: 0,
    };
    return this.makeFitbitQuery(
      "https://api.fitbit.com/1.2/user/-/sleep/list.json",
      args
    );
  }

  async fetchFitbitHeartRate(start, end) {
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${start}/${end}.json`
    );
  }

  async fetchFitbitSpO2(start, end) {
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1/user/-/spo2/date/${start}/${end}.json`
    );
  }

  async fetchFitbitSpO2Minute(date) {
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1/user/-/spo2/date/${date}/all.json`
      // `https://api.fitbit.com/1/user/-/spo2/date/2024-10-23/all.json`
    );
  }

  async fetchFitbitHRMinute(date) {
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d/1min.json`
      // `https://api.fitbit.com/1/user/-/activities/heart/date/2019-01-01/1d/1min.json`
    );
  }

  async fetchFitbitSleepLogRange(start, end) {
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1.2/user/-/sleep/date/${start}/${end}.json`
    );
  }

  async fetchFitbitStepsRange(start, end) {
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1/user/-/activities/steps/date/${start}/${end}.json`
    );
  }

  async fetchFitbitSleepLogByDate(date) {
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`
    );
  }

  async fetchFitbitActivityRange(activity, start, end) {
    if (validFitibtActivities.indexOf(activity) < 0)
      throw new Error(
        "Invalid Activity " + activity + " passed to fetchFitbitActivityRange"
      );
    return this.makeFitbitQuery(
      `https://api.fitbit.com/1/user/-/activities/${activity}/date/${start}/${end}.json`
    );
  }

  async getSPO2Since(months) {
    const [start, stop] = getTimeIntervalSinceToday(months);
    const tempData = await this.fetchFitbitSpO2(start, stop);
    // console.log("spo2since", tempData);
    if (tempData !== null) {
      const result = tempData
        .map((item) => ({
          ...item,
          date: toTimestamp(item.dateTime),
          time: moment(item.dateTime).format(timeFormat),
          number: item.value.avg,
          timestamp: item.dateTime,
          time: moment(item.dateTime).format(minuteFormat),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      return result;
    }
    return null;
  }

  async getSPO2MinuteSince(date) {
    // console.log("getting start and end spo2 minute");

    const tempData = await this.fetchFitbitSpO2Minute(date);
    // console.log("spo minute tempdata", tempData, date);

    if (tempData !== null && Array.isArray(tempData.minutes)) {
      const result = tempData.minutes
        .map((each) => ({
          ...each,
          value: each.value,
          time: moment(each.minute).format(minuteFormat), // Format each.minute
        }))
        .sort((a, b) => new Date(a.time) - new Date(b.time));

      return {
        date: moment(tempData.dateTime).format(timeFormat),
        minutes: result,
      };
    }

    return null;
  }

  async getHRMinuteSince(date) {
    // console.log("getting start and end hr minute");
    const tempData = await this.fetchFitbitHRMinute(date);
    // console.log("HR temp data", tempData);

    if (
      tempData !== null &&
      Array.isArray(tempData["activities-heart-intraday"].dataset)
    ) {
      // const result = tempData["activities-heart-intraday"].dataset
      //   .map((each) => ({
      //     ...each,
      //     value: each.value,
      //     timestamp: moment(each.time).format(minuteFormat),
      //   }))
      //   .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return {
        ...tempData,
        date: moment(tempData.dateTime).format(timeFormat),
        // minutes: result,
      };
    }

    return null;
  }

  async getHRSince(months) {
    const [start, stop] = getTimeIntervalSinceToday(months);
    const tempHRData = await this.fetchFitbitHeartRate(start, stop);
    // console.log("get HR Since", tempHRData);
    if (tempHRData !== null) {
      const rates = tempHRData["activities-heart"]
        .filter((rate) => rate.value.restingHeartRate !== undefined)
        .map((rate) => ({
          ...rate,
          date: toTimestamp(rate.dateTime),
          time: moment(rate.dateTime).format(timeFormat),
          number: rate.value.restingHeartRate,
          timestamp: rate.dateTime,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      // console.log("hr rates", rates);
      return rates;
    }
    return null;
  }

  async getActivitySince(activity, months) {
    const [start, stop] = getTimeIntervalSinceToday(months);
    const tempData = await this.fetchFitbitActivityRange(activity, start, stop);
    if (tempData !== null) {
      // console.log("raw activity " + activity, tempData);
      const temp = tempData[`activities-${activity}`];
      if (temp.length < 1) {
        return null;
      }
      const tempRes = temp.map((log) => {
        const timestamp = moment(log.dateTime, "").unix() * 1000;
        return {
          ...log,
          number: Number(log.value),
          date: timestamp,
          formattedDate: convertTimestampToDateString(timestamp / 1000),
        };
      });
      return tempRes;
    }
    return null;
  }

  async getStepsSince(months) {
    const [start, stop] = getTimeIntervalSinceToday(months);
    const tempData = await this.fetchFitbitStepsRange(start, stop);
    if (tempData !== null) {
      const temp = tempData["activities-steps"];
      if (temp.length < 1) {
        return null;
      }
      const tempSteps = temp.map((log) => {
        const date = moment(log.dateTime, "").unix() * 1000;
        return {
          ...log,
          number: Number(log.value),
          date,
          formattedDate: convertTimestampToDateString(date / 1000),
        };
      });
      return tempSteps;
    }
    return null;
  }

  async getSleepSince(months) {
    const [start, stop] = getTimeIntervalSinceToday(months);
    const tempSleepData = await this.fetchFitbitSleepLogRange(start, stop);
    if (tempSleepData !== null) {
      const temp = tempSleepData.sleep
        .map((log) => ({
          ...log,
          date: moment(log.dateOfSleep).unix() * 1000,
          number: Number(log.efficiency),
          formattedDate: log.dateOfSleep,
          levels: {
            ...log.levels,
            data: log.levels.data.map((level) => ({
              ...level,
              value: level.seconds,
              time: moment(level.dateTime).format(minuteFormat),
            })),
          },
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      return temp;
    }
    return null;
  }

  async refreshFitbitToken() {
    if (!this.isExpired()) {
      return;
    }
    if (this.isRefreshing()) {
      await this.waitForRefresh();
      return;
    }
    const token = localStorage.getItem(this.cookieName + "-refresh");
    sessionStorage.setItem(this.refreshName, true);
    const body = new URLSearchParams();
    body.append("client_id", env.FITBIT_CLIENT_ID);
    body.append("grant_type", "refresh_token");
    body.append("code_verifier", env.VERIFIER);
    body.append("refresh_token", token);
    const tokenUrl = "https://api.fitbit.com/oauth2/token";
    console.log("refreshing");
    // console.log('body',body.toString())
    fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(), // The body must be URL-encoded
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          console.log("Fitbit refresh Access Token:", data);
          // TODO: Store the access token in the local storage as well

          this.setToken(data.access_token);
          this.setRefreshToken(data.refresh_token);

          this.setExpiresFrom(data.expires_in);
          this.setRefreshing(false);
        } else {
          console.error("Error fetching refresh access token:", data);
          this.setRefreshing(false);
          //   this.resetFitbitToken();
        }
      })
      .catch((error) => {
        console.error("Error during fitibt token refresh:", error);
        this.setRefreshing(false);
        // this.resetFitbitToken();
      });
  }
}
