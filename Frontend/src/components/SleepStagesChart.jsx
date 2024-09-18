import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import tw from "tailwind-styled-components";
import { Alert, Button, Calendar, Card, Flex, Result, Spin } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

// features
import StackedBarChart from "@features/stackedBarChart";

// fake data
// import weeklySleep from "@src/assets/data/weeklySleep.json";
// import multiFakeData from "@src/assets/data/multi.json";

// components
import ActivitySummary from "./ActivitySummary";
import LineChart from "@src/features/lineChart";

// constants
import { DATE_ORDERS } from "@src/features/lineChart/config/constants";
import API from "../service/API.js";

const CHART_TYPES = Object.freeze({
  logs: "logs",
  heartRate: "heartRate",
  spo2: "spo2",
});
//this isn't three years ago
const threeYearsAgo = moment().subtract(3, "months");

const timeFormat = "YY MMM DD";

function toTimestamp(a){
  return moment(a.dateOfSleep).unix() * 1000;
}

function getTimeIntervalSinceToday(months){
  const today = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(months,'months').format('YYYY-MM-DD');
  return [startDate,today];
}
export default function SleepStagesChart({ onItemSelect }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // const [loading, setLoading] = useState(false);
  var sleepLoading = false;
  var hrLoading = false;
  var spo2Loading = false;

  const [error, setError] = useState(null);
  const [sleepLog, setSleepLog] = useState([]);
  const [heartRate, setHeartRate] = useState([]);
  const [spo2, setSpo2] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    [CHART_TYPES.logs]: CHART_TYPES.logs,
    [CHART_TYPES.heartRate]: CHART_TYPES.heartRate,
    [CHART_TYPES.spo2]: CHART_TYPES.spo2,
  });

  const api = new API('fitbit-token','whithings-token');

  async function getSleep(){
    if (sleepLoading){ return }
    try{
      sleepLoading = true;
      const tempSleep = await api.getSleepSince(7);
      setSleepLog(tempSleep);
    } catch(error){
      setError(error.message);
    }
    sleepLoading=false;
  }

  async function getHeartRate(){
    if (hrLoading){ return }
    try{
      hrLoading= true;
      const [start,stop] = getTimeIntervalSinceToday(3);
      const tempHRData = await api.fetchFitbitHeartRate(start,stop);
      if(tempHRData !== null){
        const rates = tempHRData['activities-heart'].filter((rate) => rate.value.restingHeartRate !== undefined)
        .map((rate) => ({
          ...rate,
          timestamp: toTimestamp(rate.dateTime),
          time: moment(rate.dateTime).format(timeFormat),
          number: rate.value.restingHeartRate,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
        setHeartRate(rates)
      }
    } catch(error){
      setError(error.message);
    }
    
    hrLoading=false;
  }

  async function getSPO2(){
    if(spo2Loading){ return }
    try{
      spo2Loading = true;
      const [start,stop] = getTimeIntervalSinceToday(3);
      const tempSPO2 = await api.fetchFitbitSpO2(start,stop);
      if(tempSPO2 !== null){
        const result = tempSPO2.map((item) => ({
            ...item,
            timestamp: toTimestamp(item.dateTime),
            time: moment(item.dateTime).format(timeFormat),
            number: item.value.avg,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setSpo2(result);
      }
    } catch(error){
      setError(error.message);
    }
    spo2Loading=false;
  }

  async function getRequests(){
    getSleep();
    getHeartRate();
    getSPO2();
  }

  useEffect(() => {
    getRequests();
  }, []);

  const toggleCalendarOpen = () => {
    setIsCalendarOpen((prevState) => !prevState);
  };

  const convertMinutesToHour = (minutes = null) => {
    if (!minutes) return null;

    const converted = minutes / 60;

    return Number(converted.toFixed(2));
  };

  const convertedLogs = useMemo(() => {
    if (!sleepLog) return [];

    return sleepLog
      .filter(({ levels: { summary } }) => {
        if (
          !summary?.deep ||
          !summary?.rem ||
          !summary?.wake ||
          !summary?.light
        ) {
          return false;
        }

        return true;
      })
      .map((log) => {
        const { summary, data } = log.levels;
        const { deep, rem, wake, light } = summary;

        const time = moment(log.dateOfSleep).format(timeFormat);

        return {
          time,
          deep: convertMinutesToHour(deep.minutes),
          light: convertMinutesToHour(light.minutes),
          rem: convertMinutesToHour(rem.minutes),
          wake: convertMinutesToHour(wake.minutes),
        };
      });
  }, [sleepLog]);

  const toggleChart = (chartType) => {
    setSelectedItems((previousSelected) => {
      const newItems = { ...previousSelected };
      if (previousSelected[chartType]) {
        delete newItems[chartType];
      } else {
        newItems[chartType] = chartType;
      }

      return newItems;
    });
  };

  const datasets = useMemo(() => {
    let result = [];

    let availableDates = [];
    if (convertedLogs.length) {
      availableDates = convertedLogs.map((log) => log.time);
    }

    if (selectedItems[CHART_TYPES.logs] !== undefined) {
      result.push({
        title: "Logs",
        type: "stacked",
        data: convertedLogs || [],
      });
    }

    if (selectedItems[CHART_TYPES.heartRate] !== undefined) {
      result.push({
        title: "HearRate",
        color: "#607D8B",
        data:
          heartRate.filter((rate) => availableDates.includes(rate.time)) || [],
      });
    }

    if (selectedItems[CHART_TYPES.spo2] !== undefined) {
      result.push({
        title: "Spo2",
        color: "#3f51b5",
        data: spo2.filter((item) => availableDates.includes(item.time)) || [],
      });
    }

    return result;
  }, [selectedItems, convertedLogs, heartRate]);

  const handleItemSelect = (item) => {
    const clonedItem = { ...item };

    const selectedHeartRateByTime = heartRate.find(
      (rate) => rate.time === item.time
    );
    const selectedSleepLogByTime = sleepLog.find(
      (log) =>
        log.dateOfSleep === moment(item.time, timeFormat).format("YYYY-MM-DD")
    );
    const selectedSpo2ByTime = spo2.find(
      (spo2Item) => spo2Item.time === item.time
    );

    clonedItem.averageHeartRate =
      selectedHeartRateByTime.value.restingHeartRate;
    clonedItem.sleepScore = selectedSleepLogByTime.efficiency;
    clonedItem.averageSpo2 = selectedSpo2ByTime.value.avg;

    onItemSelect(clonedItem);
  };

  const checkIfNoData = useMemo(() => {
    if (!Object.keys(selectedItems).length || !convertedLogs?.length)
      return true;

    return false;
  }, [selectedItems, convertedLogs]);

  if (sleepLoading) {
    return (
      <Spin spinning={true} tip="Loading...">
        <Card className="relative mx-6 mt-5 h-96"></Card>
      </Spin>
    );
  }

  if (error) {
    return (
      <Alert
        className="w-full"
        message="Fetch error"
        showIcon
        description={error}
        type="error"
        action={
          <Button onClick={getRequests} size="middle" danger>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <Wrapper>
      <Labels>
        <Label
          className="text-[#3F51B5]"
          onClick={() => toggleChart(CHART_TYPES.spo2)}
          $selected={selectedItems[CHART_TYPES.spo2] !== undefined}
        >
          <Circle className="bg-[#3F51B5]" />
          Spo2
        </Label>
        <Label
          className="text-[#607D8B]"
          onClick={() => toggleChart(CHART_TYPES.heartRate)}
          $selected={selectedItems[CHART_TYPES.heartRate] !== undefined}
        >
          <Circle className="bg-[#607D8B]" />
          Heart Rate
        </Label>
      </Labels>
      {checkIfNoData ? (
        <Result
          status="404"
          title="404"
          subTitle="Sorry, No data exists for this Chart."
          extra={null}
        />
      ) : (
        <LineChart
          className="flex-1"
          datasets={datasets}
          onItemSelect={handleItemSelect}
          options={{
            width: 1000,
            height: 200,
            margin: { top: 5, right: 10, bottom: 15, left: 0 },
            padding: 0,
            yLabelsCount: 10,
            xLabelsCount: 7,
            xAxisProperty: "time",
            yAxisProperty: "number",
            tooltipLabelKey: "time",
            tooltipValueKey: "number",
            groups: ["deep", "light", "rem", "wake"],
            colors: ["#154ba6", "#3f8dff", "#7ec4ff", "#e73360"],
            customYMin: 0,
            dateFormat: timeFormat,
            dateOrder: DATE_ORDERS.ascending,
          }}
        />
      )}
      <StageLabels>
        <StageLabel className=" text-[#e73360]">Wake</StageLabel>
        <StageLabel className=" text-[#7ec4ff]">REM</StageLabel>
        <StageLabel className=" text-[#3f8dff]">Light</StageLabel>
        <StageLabel className=" text-[#154ba6]">Deep</StageLabel>
      </StageLabels>
      <CalendarButton onClick={toggleCalendarOpen}>
        <CalendarOutlined className="text-[30px]" />
      </CalendarButton>
      <CalendarWrapper $open={isCalendarOpen}>
        <Calendar
          fullscreen={false}
          onSelect={(selectedDate) => {
            handleItemSelect({
              time: moment(selectedDate.unix() * 1000).format(timeFormat),
            });
          }}
        />
      </CalendarWrapper>
    </Wrapper>
  );
}

const Wrapper = tw.div`
  flex
  relative
  items-center
  gap-2
  w-full
  mx-24
  pt-12
`;

const StageLabels = tw.div`
  flex
  flex-col
  gap-4
  mb-8
  h-full
  justify-end
`;

const StageLabel = tw.div`
  text-2xl
  font-extrabold
`;

const YAxisLabel = tw.div`
  absolute
  -top-2
  left-2
  text-xs
  text-gray-500
`;

const CalendarWrapper = tw.div`
  w-[300px]
  border
  border-gray-200
  rounded-md
  p-2
  pt-0
  ml-auto
  absolute
  top-16
  right-0
  bg-white
  shadow-lg
  opacity-0
  pointer-events-none
  scale-50
  z-10
  
  transition-all
  duration-150
  ease-in-out

  ${({ $open }) =>
    $open &&
    `
    opacity-100
    pointer-events-auto
    scale-100
  `}
`;

const CalendarButton = tw.div`
  absolute
  top-0
  right-0
  bg-white
  shadow-lg
  rounded-full
  w-16
  h-16
  flex
  justify-center
  items-center
  text-gray-600
  cursor-pointer

  transition-all
  duration-150
  ease-in

  hover:bg-gray-700
  hover:text-white
`;

const Labels = tw.div`
  flex
  justify-center
  gap-5
  absolute
  top-0
  left-1/2
  -translate-x-1/2  
`;

const Label = tw.div`
  flex
  font-bold
  items-center
  select-none	
  cursor-pointer
  opacity-50

  ${({ $selected }) =>
    $selected &&
    `
    opacity-100 
  `}
`;

const Circle = tw.span`
  w-3
  h-3
  inline-block
  rounded-full
  mx-1
`;
