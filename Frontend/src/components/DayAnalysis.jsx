import { Progress } from "antd";

// fake data
import daySleep from "@src/assets/data/daySleep.json";
import tw from "tailwind-styled-components";

// features
import LineChart from "@src/features/lineChart";

// components
import ActivitySummary from "@src/components/ActivitySummary";

export default function DayAnalysis({ data, selectedItem }) {
  const sleepScore = ({ index }) => {
    return (
      <SleepScoreWrapper key={index}>
        <Progress
          type="circle"
          percent={selectedItem.sleepScore}
          format={(value) => value}
          strokeColor="#10b981"
          size={80}
        />
        <SleepScoreTitle>Sleep Score</SleepScoreTitle>
      </SleepScoreWrapper>
    );
  };

  return (
    <Wrapper className="">
      <ActivitySummary
        title={""}
        items={[
          sleepScore,
          { label: "Avg Hear Rate", value: selectedItem.averageHeartRate },
          { label: "Avg Spo2", value: selectedItem.averageSpo2 },
        ]}
      />
      <Labels>
        <Label className=" text-[#e73360]">Awake</Label>
        <Label className=" text-[#7ec4ff]">REM</Label>
        <Label className=" text-[#3f8dff]">Light</Label>
        <Label className=" text-[#154ba6]">Deep</Label>
      </Labels>
      <LineChart
        className="w-full"
        datasets={[
          {
            title: "DaySleep",
            color: "#3F51B5",
            curve: 0.97,
            strokeWidth: 7,
            hideDataPoints: true,
            showDataRectangle: true,
            bgGradient: [
              {
                offset: "0%",
                color: "rgb(247,56,110)",
                opacity: "1",
              },
              {
                offset: "30%",
                color: "rgb(124,196,255)",
                opacity: "1",
              },
              {
                offset: "60%",
                color: "rgb(58,135,255)",
                opacity: "1",
              },
              {
                offset: "90%",
                color: "rgb(15,72,169)",
                opacity: "1",
              },
            ],
            data,
          },
        ]}
        options={{
          width: 900,
          height: 250,
          margin: { top: 40, right: 10, bottom: 40, left: 30 },
          padding: 0,
          yLabelsCount: 0,
          xLabelsCount: 20,
          xAxisProperty: "time",
          yAxisProperty: "y",
          tooltipLabelKey: "time",
          tooltipValueKey: "y",
          yLabelsPosition: "right",
        }}
      />
    </Wrapper>
  );
}

const Wrapper = tw.div`
  w-full
  items-center
  flex
  mx-24
`;

const Labels = tw.div`
  flex
  flex-col
  gap-4
  mb-8
`;

const Label = tw.div`
  text-2xl
  font-extrabold
`;

const SleepScoreWrapper = tw.div`
  mt-4
  mb-4
  flex
  flex-col
  items-center
  w-28
`;
const SleepScoreTitle = tw.div`
  text-lg
  text-gray-600
  mt-2
`;
