import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { dayInMs } from "../utils";
import { filterDates } from "../utils";
import LineForSpO2HR from "./LineForSpO2HR";

const colorMap = {
  rem: "#b3cde3",
  light: "#8c96c6",
  deep: "#88419d",
  wake: "#ff4500",
};

const orderedSleepLevels = ["deep", "light", "rem", "wake"];
export default function SleepDetailsChartVis(props) {
  // console.log("sleep data", props.sleepData);
  // console.log("date range", props.dateRange);
  // console.log("hr data", props.hrData);
  // console.log("spo2 data", props.spo2Data);
  // console.log("details date", props.detailsDate);
  // console.log("hr minute data", props.hrMinuteData);
  // console.log("spo2 minute data", props.spo2MinuteData);
  // console.log("sleep data - data", props.sleepData[0].levels.data);
  // console.log("sleep data - short data", props.sleepData[0].levels.shortData);

  return (
    <LineForSpO2HR
      sleepData={props.sleepData}
      dateRange={props.dateRange}
      hrData={props.hrData}
      spo2Data={props.spo2Data}
      detailsDate={props.detailsDate}
      spo2MinuteData={props.spo2MinuteData?.minutes}
      hrMinuteData={
        props.hrMinuteData
          ? props.hrMinuteData["activities-heart-intraday"]?.dataset
          : undefined
      }
      timeDomain={
        props.spo2MinuteData !== null
          ? d3.extent(props.spo2MinuteData.minutes, (d) => d.time)
          : undefined
      }
    />
  );
}
