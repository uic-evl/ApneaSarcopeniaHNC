import moment from "moment";

export const drawRectangle = (
  width,
  height,
  radiusTopLeft = 0,
  radiusTopRight = 0,
  radiusBottomRight = 0,
  radiusBottomLeft = 0
) => {
  radiusTopLeft = Math.min(radiusTopLeft, width / 2, height / 2);
  radiusTopRight = Math.min(radiusTopRight, width / 2, height / 2);
  radiusBottomLeft = Math.min(radiusBottomLeft, width / 2, height / 2);
  radiusBottomRight = Math.min(radiusBottomRight, width / 2, height / 2);

  const path = `
    M ${radiusTopLeft} 0
    L ${width - radiusTopRight} 0
    Q ${width} 0 ${width} ${radiusTopRight}
    L ${width} ${height - radiusBottomRight}
    Q ${width} ${height} ${width - radiusBottomRight} ${height}
    L ${radiusBottomLeft} ${height}
    Q 0 ${height} 0 ${height - radiusBottomLeft}
    L 0 ${radiusTopLeft}
    Q 0 0 ${radiusTopLeft} 0
    Z
  `;

  return path;
};

export const calculateValueByUnit = (value, unit) => {
  return value * Math.pow(10, unit);
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const isFloat = (num) => num % 1 !== 0;

export const filterByCount = (dataArray, count) => {
  const step = dataArray.length / count;

  if (step < 0) return dataArray;

  return dataArray.filter((_, index) => (index + 1) % Math.ceil(step) === 0);
};

export const convertTimestampToDateString = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const calculateAverageProperty = (array, property) => {
  if (!array?.length || !property) {
    return 0;
  }

  const validItems = array.filter((item) => typeof item[property] === "number");

  const total = validItems.reduce((sum, item) => sum + item[property], 0);

  return total / validItems.length;
};

export const summarizeDataDaily = (data, key) => {
  if (!data) return [];

  const dateMap = data.reduce((acc, curr) => {
    const dateKey = curr.formattedDate.split(" ")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { total: 0, count: 0, originalRecord: curr };
    }
    acc[dateKey].total += curr[key];
    acc[dateKey].count += 1;
    return acc;
  }, {});

  return Object.entries(dateMap).map(
    ([date, { total, count, originalRecord }]) => ({
      [key]: total / count,
      date: originalRecord.date,
      formattedDate: date + " 00:00:00",
    })
  );
};

export const summarizeDataMonthly = (data, key) => {
  if (!data) return [];

  const dateMap = data.reduce((acc, curr) => {
    const monthKey = moment(curr.formattedDate).format("YYYY-MM");
    if (!acc[monthKey]) {
      acc[monthKey] = { total: 0, count: 0, originalRecord: curr };
    }
    acc[monthKey].total += curr[key];
    acc[monthKey].count += 1;
    return acc;
  }, {});

  return Object.entries(dateMap).map(
    ([month, { total, count, originalRecord }]) => ({
      [key]: total / count,
      date: originalRecord.date,
      formattedDate: month + "-01 00:00:00",
    })
  );
};

export const convertPercentageToDecimal = (percentage) => {
  if (typeof percentage !== "number") {
    throw new TypeError("Input must be a number");
  }
  return percentage / 100;
};

export const filterDataSince = (data, sinceTimestamp, dateKey) => {
  return data.filter((item) => {
    if (item[dateKey] > sinceTimestamp) {
      return true;
    }

    return false;
  });
};

export const groupDataByPeriod = (
  data = [],
  dateKey = "date",
  period = 4,
  periodType = "week"
) => {
  if (!data || !data?.length || period < 1) return [];

  const groupedData = [];

  const sortedData = data.sort(
    (a, b) => moment(b[dateKey]) - moment(a[dateKey])
  );
  const nearestDate = moment(sortedData[0][dateKey]);

  let startDate;
  if (periodType === "week") {
    startDate = nearestDate
      .clone()
      .subtract(period - 1, "weeks")
      .startOf("week");
  } else if (periodType === "month") {
    startDate = nearestDate
      .clone()
      .subtract(period - 1, "months")
      .startOf("month");
  } else {
    throw new Error('Invalid periodType. Use "week" or "month".');
  }

  const filteredData = data.filter((item) => {
    const date = moment(item[dateKey]);
    return date.isBetween(startDate, nearestDate, null, "[]");
  });

  const tempGroupedData = {};
  filteredData.forEach((item) => {
    const date = moment(item[dateKey]);
    let periodIdentifier;

    if (periodType === "week") {
      periodIdentifier = date.startOf("week").format("YYYY-[W]WW");
    } else if (periodType === "month") {
      periodIdentifier = date.startOf("month").format("YYYY-MM");
    }

    if (!tempGroupedData[periodIdentifier]) {
      tempGroupedData[periodIdentifier] = [];
    }

    tempGroupedData[periodIdentifier].push(item);
  });

  for (const [period, items] of Object.entries(tempGroupedData)) {
    groupedData.push(items);
  }

  return groupedData;
};
