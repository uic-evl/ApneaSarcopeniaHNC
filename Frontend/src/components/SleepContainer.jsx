import { useState } from "react";
import SleepScoreChartVis from "./SleepScoreChartVis";
import SleepDetailsChartVis from "./SleepDetailsChartVis";
import SleepLevelChartVis from "./SleepLevelChartVis";
import { Button, Flex, Radio } from "antd";
import moment from "moment";
import { convertTimestampToDateString, dayToTimestamp } from "@src/utils";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

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

  const [plotVar, setPlotVar] = useState("Details");
  const [hrSpo2Var, setHRSpo2Var] = useState("SpO2");

  const plotActivityOptions = ["Details", "Efficiency", "Levels"];
  const handleButtonChange = ({ target: { value } }) => {
    setPlotVar(value);
  };
  const handleHRSpo2ButtonChange = ({ target: { value } }) => {
    setHRSpo2Var(value);
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
            return { label: v, value: v };
          })}
          onChange={handleButtonChange}
          value={plotVar}
          optionType="button"
        />
      </Flex>
      {plotVar === "Details" ? (
        <div style={{ position: "absolute", top: "40%", right: "5%" }}>
          <Flex
            align="center"
            justify="center"
            style={{ width: "100%", margin: "0px", height: "2em" }}
          >
            <Radio.Group
              options={["SpO2", "HR"].map((v) => {
                return { label: v, value: v };
              })}
              onChange={handleHRSpo2ButtonChange}
              value={hrSpo2Var}
              optionType="button"
            />
          </Flex>
          <Flex
            align="center"
            justify="center"
            style={{ width: "100%", margin: "0px", height: "2em" }}
          >
            <div style={{ fontSize: "0.8em", color: "gray" }}>
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
          </Flex>
        </div>
      ) : null}

      <Flex
        align="center"
        justify="space-between"
        style={{ height: "calc(100% - 2.1em)", width: "100%", margin: "0px" }}
      >
        {plotVar === "Efficiency" ? (
          <SleepScoreChartVis dateRange={dateRange} sleepData={sleepData} />
        ) : plotVar === "Levels" ? (
          <SleepLevelChartVis
            sleepData={sleepData}
            dateRange={dateRange}
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
            hrSpo2Var={hrSpo2Var}
          />
        )}
      </Flex>
    </>
  );
}
