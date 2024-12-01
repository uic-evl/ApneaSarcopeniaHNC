import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { filterDates } from "@src/utils";
import GaugeChart from "./GaugeChart";

export default function ActivityScoreVis({
  activityData,
  stepsData,
  goalsDaily,
  dateRange,
}) {
  const sideMargin = 4;
  const topMargin = 4;
  const bottomMargin = 14;

  const activityLevels = [
    "minutesFairlyActive",
    "minutesLightlyActive",
    "minutesVeryActive",
  ];

  const formattedData = useMemo(() => {
    if (activityData === null || stepsData === null) {
      return;
    }
    const timeDict = {};
    for (let key of Object.keys(activityData)) {
      let vals = activityData[key];
      if (vals === undefined) {
        console.log("missing", key, "from activity");
        continue;
      }
      for (const val of vals) {
        const date = val.date;
        const entry = timeDict[date] ? timeDict[date] : {};
        entry[key] = val;
        timeDict[date] = entry;
      }
    }
    for (const val of stepsData) {
      const date = val.date;
      const entry = timeDict[date] ? timeDict[date] : {};
      entry["steps"] = val;
      timeDict[date] = entry;
    }
    let data = [];
    for (const [key, val] of Object.entries(timeDict)) {
      const ref = val.minutesFairlyActive;
      const entry = {
        date: ref.date,
        dateTime: ref.dateTime,
        formattedDate: ref.formattedDate,
      };
      let totalActivity = 0;
      for (const [key2, val2] of Object.entries(val)) {
        entry[key2] = val2.number;
        if (activityLevels.indexOf(key2) >= 0) totalActivity += val2.number;
      }
      entry["totalActivity"] = totalActivity;
      data.push(entry);
    }
    return filterDates(data, dateRange.start, dateRange.stop);
  }, [activityData, stepsData, dateRange]);

  const avgScore = useMemo(() => {
    if (
      goalsDaily === null ||
      formattedData === null ||
      formattedData === undefined
    ) {
      return;
    }

    const stepG = goalsDaily.steps;
    const calG = goalsDaily.caloriesOut;
    const actG = goalsDaily.activeMinutes;
    // const totalGoals = (stepG? 1:0) + (calG? 1:0) + (actG? 1:0);
    function getScore(d) {
      let numerator = 0;
      let denominator = 0;
      if (d.totalActivity && actG) {
        numerator += Math.min(1, d.totalActivity / actG);
        denominator += 1;
      }
      if (d.calories && calG) {
        numerator += Math.min(1, d.calories / calG);
        denominator += 1;
      }
      if (d.steps && stepG) {
        numerator += Math.min(1, d.steps / stepG);
        denominator += 1;
      }
      if (denominator === 0) {
        return 0;
      }
      return numerator / denominator;
    }

    var totalScore = 0;
    var scoreCount = 0;
    formattedData.forEach((d) => {
      const s = getScore(d);
      if (s > 0) {
        totalScore += s;
        scoreCount += 1;
      }
    });

    const avgScore = scoreCount ? totalScore / scoreCount : 0;

    return avgScore;
  }, [goalsDaily, formattedData, stepsData]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <GaugeChart
        score={avgScore}
        colorScale={d3.scaleLinear().domain([0, 1]).range(["white", "green"])}
      />
    </div>
  );
}
