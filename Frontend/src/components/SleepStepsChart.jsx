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
import monthlySleepScoreAndSteps from "@src/assets/data/monthlySleepScoreAndSteps.json";

// services
import { getSleepLog, getSteps } from "@src/service/fitbit";

// components
import ActivitySummary from "@src/components/ActivitySummary";

// constants
import { DATE_PERIODS } from "@src/constants";

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
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    getRequests();
  }, []);

  const getRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([getSleepLogRequest(), getStepsRequest()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const getSleepLogRequest = async () => {
    try {
      const logs = await getAllSleepLogs();

      const scores = logs.map((log) => {
        const date = moment(log.dateOfSleep).unix() * 1000;

        return {
          number: log.efficiency,
          date,
          formattedDate: convertTimestampToDateString(date / 1000),
        };
      });

      setSleepScores(scores);
    } catch (error) {
      throw new Error(error);
    }
  };

  const getAllSleepLogs = async () => {
    const threeYearsAgo = moment().subtract(3, "years");
    const today = moment();

    let currentStartDate = threeYearsAgo;
    let logs = [];

    while (currentStartDate.isBefore(today)) {
      const currentEndDate = moment.min(
        currentStartDate.clone().add(3, "months"),
        today
      );

      const response = await getSleepLog({
        date_from: currentStartDate.format("YYYY-MM-DD"),
        date_to: currentEndDate.format("YYYY-MM-DD"),
      });

      logs = logs.concat(response);

      currentStartDate = currentEndDate.add(1, "day");
    }

    return logs.reverse();
  };

  const getStepsRequest = async () => {
    try {
      const logs = await getSteps({
        date_from: moment().subtract(3, "month").format("YYYY-MM-DD"),
        date_to: moment().format("YYYY-MM-DD"),
      });

      const steps = logs.map((log) => {
        const date = moment(log.dateTime, "").unix() * 1000;

        return {
          number: Number(log.value),
          date,
          formattedDate: convertTimestampToDateString(date / 1000),
        };
      });

      setSteps(steps);
    } catch (error) {
      throw new Error(error);
    }
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

  if (loading) {
    return (
      <Spin spinning={loading} tip="Loading...">
        <Card className="relative mx-6 mt-5 h-96"></Card>
      </Spin>
    );
  }

  if (error) {
    return (
      <Card className="relative mx-6 mt-5">
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
          {Object.keys(DATE_PERIODS).map((period) => (
            <Radio.Button key={period} value={period}>
              {capitalizeFirstLetter(period)}
            </Radio.Button>
          ))}
        </Radio.Group>
        <RangePicker key={datePickerKey} onChange={handleRangePicker} />
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
