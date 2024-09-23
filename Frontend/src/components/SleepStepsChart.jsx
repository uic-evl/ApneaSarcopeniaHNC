import {
  Alert,
  Button,
  Card,
  DatePicker,
  Flex,
  Radio,
  Result,
  Spin,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import tw from "tailwind-styled-components";

// features
import LineChart from "@src/features/lineChart";

// fake data
// import monthlySleepScoreAndSteps from "@src/assets/data/monthlySleepScoreAndSteps.json";

// components
import ActivitySummary from "@src/components/ActivitySummary";

// constants
import { DATE_PERIODS } from "@src/constants";
import { FitbitAPI } from "../service/API.js";

// utils
import {
  capitalizeFirstLetter,
  convertTimestampToDateString,
  summarizeDataDaily,
  summarizeDataMonthly,
} from "@src/utils";

const { RangePicker } = DatePicker;

const CHART_TYPES = Object.freeze({
  steps: "steps",
  sleepScores: "sleepScores",
});


const todayTimestamp = moment().startOf("day").unix() * 1000;
const nowTimestamp = moment().unix() * 1000;
const weekAgoTimestamp = moment().subtract(7, "days").unix() * 1000;
const monthAgoTimestamp = moment().subtract(1, "months").unix() * 1000;
const yearAgoTimestamp = moment().subtract(1, "years").unix() * 1000;

export default function SleepStepsChart() {
  var sleepLoading = false;
  var stepsLoading = false;
  const [error, setError] = useState(null);
  const [sleepScores, setSleepScores] = useState(null);
  const [steps, setSteps] = useState(null);
  const [dateRange, setDateRange] = useState({
    date_from: null,
    date_to: null,
  });
  const [datePeriod, setDatePeriod] = useState(DATE_PERIODS.all);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [selectedItems, setSelectedItems] = useState({
    [CHART_TYPES.steps]: CHART_TYPES.steps,
    [CHART_TYPES.sleepScores]: CHART_TYPES.sleepScores,
  });

  const api = new FitbitAPI('fitbit-token');

  async function getSleep(){
    if(sleepLoading){return}
    try{
      sleepLoading = true;
      const tempSleep = await api.getSleepSince(3);
      if(tempSleep!==null){
        const scores = tempSleep.map((log) => {
          const date = moment(log.dateOfSleep).unix() * 1000;

          return {
            number: log.efficiency,
            date,
            formattedDate: convertTimestampToDateString(date / 1000),
          };
        });
        setSleepScores(scores);
      } else{
        setSleepScores(null);
      }
      sleepLoading=false;
    }
    catch(error){
      setError(error.message);
    }
  }

  async function getSteps(){
    if(stepsLoading){return}
    try{
      stepsLoading = true;
      const temp = await api.getStepsSince(3);
      if(temp !== null){
        const tempSteps = temp.map((log) => {
          const date = moment(log.dateTime, "").unix() * 1000;
          return {
            number: Number(log.value),
            date,
            formattedDate: convertTimestampToDateString(date / 1000),
          };
        });
        setSteps(tempSteps)
      } else{
        setSteps(null)
      }
      stepsLoading = false;
    } catch(error){
      setError(error.message);
    }
    
  }

  async function fetchData(){
    getSleep();
    getSteps();
  }

  useEffect(() => {
    fetchData();
    // getRequests();
  }, []);


  const getTime = (date, daysCount) => {
    if (daysCount <= 1) {
      return moment(date).format("h:i");
    } else if (daysCount > 1 && daysCount <= 7) {
      return moment(date).format("ddd DD");
    } else if (daysCount > 7 && daysCount <= 31) {
      return moment(date).format("MMM DD");
    } else if (daysCount > 31) {
      return moment(date).format("YY MMM");
    }

    return moment(date).format("ddd");
  };

  const sleepScoresFilteredByTime = useMemo(() => {
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return sleepScores;
    }

    return sleepScores?.filter((score) => {
      const { date } = score;

      return date >= dateRange.date_from && date <= dateRange.date_to;
    });
  }, [sleepScores, dateRange]);

  const stepsFilteredByTime = useMemo(() => {
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return steps;
    }

    return steps?.filter((score) => {
      const { date } = score;

      return date >= dateRange.date_from && date <= dateRange.date_to;
    });
  }, [steps, dateRange]);

  const summarizeSleepScoreByPeriod = useMemo(() => {
    const dailySummarized = summarizeDataDaily(
      sleepScoresFilteredByTime,
      "number"
    );

    const monthlySummarized = summarizeDataMonthly(
      sleepScoresFilteredByTime,
      "number"
    );

    const daysCount = dailySummarized?.length;

    if (daysCount <= 1) {
      return sleepScoresFilteredByTime;
    } else if (daysCount > 1 && daysCount <= 31) {
      return dailySummarized;
    } else if (daysCount > 31) {
      return monthlySummarized;
    }

    return [];
  }, [sleepScoresFilteredByTime, datePeriod]);

  const summarizeStepsByPeriod = useMemo(() => {
    const dailySummarized = summarizeDataDaily(stepsFilteredByTime, "number");

    const monthlySummarized = summarizeDataMonthly(
      stepsFilteredByTime,
      "number"
    );

    const daysCount = dailySummarized?.length;

    if (daysCount <= 1) {
      return stepsFilteredByTime;
    } else if (daysCount > 1 && daysCount <= 31) {
      return dailySummarized;
    } else if (daysCount > 31) {
      return monthlySummarized;
    }

    return [];
  }, [steps, datePeriod]);

  const sleepScoresConverted = useMemo(() => {
    if (!summarizeSleepScoreByPeriod) return [];

    const daysCount = summarizeDataDaily(
      sleepScoresFilteredByTime,
      "number"
    )?.length;

    return summarizeSleepScoreByPeriod.map((score) => {
      const date = getTime(score.date, daysCount);

      return {
        ...score,
        number: Math.round(score.number),
        date,
      };
    });
  }, [sleepScoresFilteredByTime, dateRange]);

  const stepsConverted = useMemo(() => {
    if (!summarizeStepsByPeriod) return [];

    const daysCount = summarizeDataDaily(stepsFilteredByTime, "number")?.length;

    return summarizeStepsByPeriod.map((score) => {
      const date = getTime(score.date, daysCount);

      return {
        ...score,
        number: Math.round(score.number),
        date,
      };
    });
  }, [stepsFilteredByTime, dateRange]);

  const handlePeriodSelection = ({ target: { value } }) => {
    setDatePeriod(value);

    let range = null;
    switch (value) {
      case DATE_PERIODS.today:
        range = {
          date_from: todayTimestamp,
          date_to: nowTimestamp,
        };
        break;
      case DATE_PERIODS.week:
        range = {
          date_from: weekAgoTimestamp,
          date_to: todayTimestamp,
        };
        break;
      case DATE_PERIODS.month:
        range = {
          date_from: monthAgoTimestamp,
          date_to: todayTimestamp,
        };
        break;
      case DATE_PERIODS.year:
        range = {
          date_from: yearAgoTimestamp,
          date_to: todayTimestamp,
        };
        break;
      case DATE_PERIODS.all:
        range = {
          date_from: null,
          date_to: null,
        };
        break;
    }

    if (range !== null) {
      setDateRange(range);
      setDatePickerKey((previousKey) => previousKey + 1);
    }
  };

  const handleRangePicker = (_, datePicker) => {
    const pickedFromDate = moment(datePicker[0]).unix() * 1000;
    const pickedToDate = moment(datePicker[1]).unix() * 1000;

    if (!pickedFromDate || !pickedToDate) {
      return;
    }

    setDatePeriod(DATE_PERIODS.none);
    setDateRange({
      date_from: pickedFromDate,
      date_to: pickedToDate,
    });
  };

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

    if (selectedItems[CHART_TYPES.steps] !== undefined) {
      result.push({
        title: "Steps",
        color: "#607D8B",
        type: "bar",
        hideDataPoints: true,
        data: stepsConverted || [],
      });
    }

    if (selectedItems[CHART_TYPES.sleepScores] !== undefined) {
      result.push({
        title: "SleepScore",
        color: "#0e97f5",
        data: sleepScoresConverted || [],
      });
    }

    return result;
  }, [selectedItems, stepsConverted, sleepScoresConverted]);

  const checkIfNoData = useMemo(() => {
    if (
      !Object.keys(selectedItems).length ||
      !sleepScores?.length ||
      !steps?.length
    )
      return true;

    return false;
  }, [selectedItems, steps, sleepScores]);

  if (sleepLoading || stepsLoading){
    return (
      <Spin spinning={true} tip="Loading...">
        <Card className="relative mx-6 mt-5 h-96"></Card>
      </Spin>
    );
  }

  if (!sleepLoading && !stepsLoading && (sleepScores === null || steps === null)) {
    
    return (
      <Card className="relative mx-6 mt-5">
        <Alert
          className="w-full"
          message="Fetch error"
          showIcon
          description={error}
          type="error"
          action={
            <Button onClick={fetchData} size="middle" danger>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="mx-6 mt-5">
      <Flex justify="center" className="gap-3 mb-4">
        <Radio.Group
          size="large"
          value={datePeriod}
          onChange={handlePeriodSelection}
        >
          {Object.keys(DATE_PERIODS).map((period,i) => (
            <Radio.Button key={period+i+'something'} value={period}>
              {capitalizeFirstLetter(period)}
            </Radio.Button>
          ))}
        </Radio.Group>
        <RangePicker key={datePickerKey+'no'} onChange={handleRangePicker} />
      </Flex>
      <Flex align="center" justify="space-between" className="gap-8 mx-24">
        <ActivitySummary
          title={"title"}
          items={[{ label: "label", value: "value" }]}
        />
        <Wrapper>
          <YAxisLabel>Steps</YAxisLabel>
          <Labels>
            <Label
              className="text-[#607D8B]"
              onClick={() => toggleChart(CHART_TYPES.steps)}
              $selected={selectedItems[CHART_TYPES.steps] !== undefined}
            >
              <Circle className="bg-[#607D8B]" />
              Number of steps
            </Label>
            <Label
              className="text-[#0e97f5]"
              onClick={() => toggleChart(CHART_TYPES.sleepScores)}
              $selected={selectedItems[CHART_TYPES.sleepScores] !== undefined}
            >
              <Circle className="bg-[#0e97f5]" />
              Sleep score
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
              className="w-[94%]"
              datasets={datasets}
              options={{
                width: 1200,
                height: 200,
                margin: { top: 40, right: 0, bottom: 40, left: 0 },
                padding: 0,
                yLabelsCount: 7,
                xLabelsCount: 10,
                xAxisProperty: "date",
                yAxisProperty: "number",
                tooltipLabelKey: "date",
                tooltipValueKey: "number",
              }}
            />
          )}
        </Wrapper>
      </Flex>
    </Card>
  );
}

const Wrapper = tw.div`
  relative
  w-full
  mt-8
`;

const YAxisLabel = tw.div`
  absolute
  top-0
  left-2
  text-xs
  text-gray-500
`;

const Labels = tw.div`
  flex
  justify-center
  gap-5
`;

const Label = tw.div`
  flex
  font-bold
  items-center
  cursor-pointer
  select-none	
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
