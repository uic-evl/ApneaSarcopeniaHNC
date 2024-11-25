import { useState } from "react";
import SleepScoreChartVis from "./SleepScoreChartVis";
import SleepDetailsChartVis from "./SleepDetailsChartVis";
import SleepLevelChartVis from "./SleepLevelChartVis";
import { Button, Flex, Radio } from "antd";
import moment from "moment";
import { convertTimestampToDateString, dayToTimestamp } from "@src/utils";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { SleepLegend } from "./SleepLegend";

export default function SleepContainer({
  sleepData,
  dateRange,
  goalsDaily,
  hrData,
  spo2Data,
  detailsDate,
  setDetailsDate,
  spo2MinuteData,
  hrMinuteData,
  datePicker,
}) {
  function incerementSingleDay() {
    const currday = moment(detailsDate, "YYYY-MM-DD");
    const newDay = currday.clone().add(1, "day");
    setDetailsDate(newDay.format("YYYY-MM-DD"));
  }

  function decrementSingleDay() {
    const currday = moment(detailsDate, "YYYY-MM-DD");
    // console.log("currday", currday);
    const newDay = currday.clone().subtract(1, "day");
    // console.log("newDay", newDay);
    setDetailsDate(newDay.format("YYYY-MM-DD"));
  }

  const [plotVar, setPlotVar] = useState("Efficiency");

  const plotActivityOptions = ["Efficiency", "Levels", "Details"];
  const plotAcitivityTitles = ["Efficiency", "Levels", "SpO2/HR"];
  const handleButtonChange = ({ target: { value } }) => {
    setPlotVar(value);
  };

  return (
    <>
      <Flex
        align="center"
        justify="center"
        style={{ width: "100%", margin: "0px", height: "2em" }}
      >
        <Radio.Group
          options={plotActivityOptions.map((v, i) => {
            return { label: plotAcitivityTitles[i], value: v };
          })}
          onChange={handleButtonChange}
          value={plotVar}
          optionType="button"
          buttonStyle="solid"
        />

        {plotVar === "Details" ? (
          <div style={{ fontSize: "0.8em", color: "gray" }}>
            Current Date:
            <Button onClick={decrementSingleDay}>
              <LeftOutlined />
            </Button>
            {detailsDate}
            <Button
              onClick={incerementSingleDay}
              disabled={moment(detailsDate, "YYYY-MM-DD").isSame(
                moment(),
                "day"
              )}
            >
              <RightOutlined />
            </Button>
          </div>
        ) : null}
      </Flex>
      <SleepLegend plotVar={plotVar} />
      <Flex
        align="center"
        justify="space-between"
        style={{ height: "calc(100% - 2.1em)", width: "100%", margin: "0px" }}
      >
        {plotVar === "Efficiency" ? (
          <SleepScoreChartVis
            dateRange={dateRange}
            sleepData={sleepData}
            datePicker={datePicker}
            detailsDate={detailsDate}
            setDetailsDate={setDetailsDate}
          />
        ) : plotVar === "Levels" ? (
          <SleepLevelChartVis
            sleepData={sleepData}
            dateRange={dateRange}
            datePicker={datePicker}
            setDetailsDate={setDetailsDate}
            // hrData={hrData}
            // spo2Data={spo2Data}
          />
        ) : (
          <SleepDetailsChartVis
            sleepData={sleepData?.filter(
              (item) => item.dateOfSleep === detailsDate
            )}
            dateRange={dateRange}
            hrData={hrData?.filter((item) => item.dateTime === detailsDate)}
            spo2Data={spo2Data?.filter((item) => item.dateTime === detailsDate)}
            detailsDate={detailsDate}
            hrMinuteData={hrMinuteData}
            spo2MinuteData={spo2MinuteData}
          />
        )}
      </Flex>
    </>
  );
}
