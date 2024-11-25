import { useState } from "react";
import ActivityChartVis from "./ActivityChartVis";
import StepsChartVis from "./StepsChartVis";
import { Flex, Radio } from "antd";
import moment from "moment";

export default function ActivityContainer({
  activityData,
  dateRange,
  stepsData,
  goalsDaily,
  datePicker,
  detailsDate,
  setDetailsDate,
}) {
  const [activityPlotVar, setActivityPlotVar] = useState("totalActivity");

  const plotActivityOptions = [
    "activityCalories",
    "totalActivity",
    "minutesLightlyActive",
    "minutesFairlyActive",
    "minutesVeryActive",
    "steps",
  ];
  const handleActivityButtonChange = ({ target: { value } }) => {
    if (
      activityData !== null &&
      activityData[value] === undefined &&
      value !== "totalActivity" &&
      value !== "steps"
    ) {
      console.log("invalid plot value for activity data", value);
      return;
    }
    setActivityPlotVar(value);
  };

  return (
    <>
      <Flex
        align="center"
        justify="center"
        style={{ width: "100%", margin: "0px", height: "2em" }}
      >
        <Radio.Group
          options={plotActivityOptions.map((v) => {
            return { label: v.replace("minutes", ""), value: v };
          })}
          onChange={handleActivityButtonChange}
          value={activityPlotVar}
          optionType="button"
          buttonStyle="solid"
        />
      </Flex>
      <Flex
        align="center"
        justify="space-between"
        style={{ height: "calc(100% - 2.1em)", width: "100%", margin: "0px" }}
      >
        {activityPlotVar === "steps" ? (
          <StepsChartVis
            stepsData={stepsData}
            dateRange={dateRange}
            stepsGoal={
              goalsDaily !== null && goalsDaily.steps ? goalsDaily.steps : 10000
            }
            datePicker={datePicker}
            detailsDate={detailsDate}
            setDetailsDate={setDetailsDate}
          />
        ) : (
          <ActivityChartVis
            activityData={activityData}
            dateRange={dateRange}
            plotVar={activityPlotVar}
            datePicker={datePicker}
            detailsDate={detailsDate}
            setDetailsDate={setDetailsDate}
          />
        )}
      </Flex>
    </>
  );
}
