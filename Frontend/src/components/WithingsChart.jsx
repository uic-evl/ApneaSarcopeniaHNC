import tw from "tailwind-styled-components";
import moment from "moment";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Flex,
  Radio,
  Spin,
  message,
} from "antd";

const { RangePicker } = DatePicker;

// components
import BMIChart from "@src/components/BMIChart";
import BoneFatMuscleChart from "@src/components/BoneFatMuscleChart";
import ScatterChart from "@src/components/ScatterChart";


// utils
import {
  capitalizeFirstLetter,
  summarizeDataDaily,
  summarizeDataMonthly,
} from "@src/utils";

// constants
import { DATE_PERIODS } from "@src/constants";
import { WithingsAPI } from "@src/service/API";


export default function WithingsCharts(props) {
  const todayTimestamp = moment().startOf("day").unix() * 1000;
  const nowTimestamp = moment().unix() * 1000;
  const weekAgoTimestamp = moment().subtract(7, "days").unix() * 1000;
  const monthAgoTimestamp = moment().subtract(1, "months").unix() * 1000;
  const yearAgoTimestamp = moment().subtract(1, "years").unix() * 1000;


  const [dateRange, setDateRange] = useState({
    date_from: null,
    date_to: null,
  });
  const [datePeriod, setDatePeriod] = useState(DATE_PERIODS.all);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const error = props.withingsError;
  const loading = props.withingsData === null;

  const filterDates = useCallback((key) => {
    if(props.withingsData === null || props.withingsData[key] === undefined){ return null };
    const data = props.withingsData[key];
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return data;
    }
    return data?.filter(d => d.date >= dateRange.date_from && d.date <= dateRange.date_to);

  },[props.withingsData,dateRange]);

  const weightsFilteredByTime = filterDates('weight');
  const boneMassFilteredByTime = filterDates('bone_mass');
  const fatRatioFilteredByTime = filterDates('fat_ratio');
  const muscleFilteredByTime = filterDates('muscle_mass');
  const fatMassWeightFilteredByTime = filterDates('fat_mass_weight');

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

  //todo: cleanup
  const summarizeWeightsByPeriod = useMemo(() => {
    const weightDailySummarized = summarizeDataDaily(
      weightsFilteredByTime,
      "weight"
    );

    const weightMonthlySummarized = summarizeDataMonthly(
      weightsFilteredByTime,
      "weight"
    );

    const daysCount = weightDailySummarized?.length;

    if (daysCount <= 1) {
      return weightsFilteredByTime;
    } else if (daysCount > 1 && daysCount <= 31) {
      return weightDailySummarized;
    } else if (daysCount > 31) {
      return weightMonthlySummarized;
    }

    return [];
  }, [weightsFilteredByTime, datePeriod]);

  const summarizeBoneByPeriod = useMemo(() => {
    const boneMassDailySummarized = summarizeDataDaily(
      boneMassFilteredByTime,
      "bone"
    );

    const boneMassMonthlySummarized = summarizeDataMonthly(
      boneMassFilteredByTime,
      "bone"
    );

    const daysCount = boneMassDailySummarized?.length;

    if (daysCount <= 1) {
      return boneMassFilteredByTime;
    } else if (daysCount > 1 && daysCount <= 31) {
      return boneMassDailySummarized;
    } else if (daysCount > 31) {
      return boneMassMonthlySummarized;
    }

    return [];
  }, [boneMassFilteredByTime, datePeriod]);

  const summarizeFatRatioByPeriod = useMemo(() => {
    const fatRatioDailySummarized = summarizeDataDaily(
      fatRatioFilteredByTime,
      "fatRatio"
    );

    const fatRatioMonthlySummarized = summarizeDataMonthly(
      fatRatioFilteredByTime,
      "fatRatio"
    );

    const daysCount = fatRatioDailySummarized?.length;

    if (daysCount <= 1) {
      return fatRatioFilteredByTime;
    } else if (daysCount > 1 && daysCount <= 31) {
      return fatRatioDailySummarized;
    } else if (daysCount > 31) {
      return fatRatioMonthlySummarized;
    }

    return [];
  }, [fatRatioFilteredByTime, datePeriod]);

  const summarizeMuscleByPeriod = useMemo(() => {
    const muscleDailySummarized = summarizeDataDaily(
      muscleFilteredByTime,
      "muscle"
    );

    const muscleMonthlySummarized = summarizeDataMonthly(
      muscleFilteredByTime,
      "muscle"
    );

    const daysCount = muscleDailySummarized?.length;

    if (daysCount <= 1) {
      return muscleFilteredByTime;
    } else if (daysCount > 1 && daysCount <= 31) {
      return muscleDailySummarized;
    } else if (daysCount > 31) {
      return muscleMonthlySummarized;
    }

    return [];
  }, [muscleFilteredByTime, datePeriod]);

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
        />
      </Card>
    );
  }

  return (
    <Card className="relative mx-6 mt-5">
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
      <Flex justify="space-between" className="gap-4">
        <BMIChart
          weights={summarizeWeightsByPeriod}
          height={loading? undefined: props.withingsData.height}
          daysCount={
            summarizeDataDaily(weightsFilteredByTime, "weight")?.length
          }
        />
        <BoneFatMuscleChart
          boneMass={summarizeBoneByPeriod}
          fatRatio={summarizeFatRatioByPeriod}
          muscle={summarizeMuscleByPeriod}
          daysCount={summarizeDataDaily(boneMassFilteredByTime, "bone")?.length}
        />
        <ScatterChart
          fatMassWeight={fatMassWeightFilteredByTime}
          weight={weightsFilteredByTime}
          fatRatio={fatRatioFilteredByTime}
          height={loading? undefined: props.withingsData.height}
          datePeriod={datePeriod}
        />
      </Flex>
    </Card>
  );
}
