import tw from "tailwind-styled-components";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
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
  calculateAverageProperty,
  calculateValueByUnit,
  capitalizeFirstLetter,
  convertTimestampToDateString,
  filterDataSince,
  summarizeDataDaily,
  summarizeDataMonthly,
} from "@src/utils";

// constants
import { DATE_PERIODS } from "@src/constants";
import API from "@src/service/API";

const DATE_SINCE_TIMESTAMP = 1716409800000;

const todayTimestamp = moment().startOf("day").unix() * 1000;
const nowTimestamp = moment().unix() * 1000;
const weekAgoTimestamp = moment().subtract(7, "days").unix() * 1000;
const monthAgoTimestamp = moment().subtract(1, "months").unix() * 1000;
const yearAgoTimestamp = moment().subtract(1, "years").unix() * 1000;

export default function WithingsCharts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [height, setHeight] = useState(null);
  const [weights, setWeights] = useState(null);
  const [boneMass, setBoneMass] = useState(null);
  const [fatRatio, setFatRatio] = useState(null);
  const [muscle, setMuscle] = useState(null);
  const [fatMassWeight, setFatMassWeight] = useState(null);
  const [dateRange, setDateRange] = useState({
    date_from: null,
    date_to: null,
  });
  const [datePeriod, setDatePeriod] = useState(DATE_PERIODS.all);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const api = new API('fitbit-token','whithings-token');

  async function fetchWeight(){
    try {
      const measures = await api.fetchWithingsEntry('weight');
      const weights = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const weight = calculateValueByUnit(value, unit);

        return {
          weight,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });

      setWeights(
        filterDataSince(weights, DATE_SINCE_TIMESTAMP, "date")?.reverse()
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async function fetchHeight(){
    try {
      const measures = await api.fetchWithingsEntry('height');
      let height = null;

      if (measures?.length) {
        const measure = measures?.[0]?.measures?.[0];

        height = calculateValueByUnit(measure.value, measure.unit);
      }

      setHeight(height);
    } catch (error) {
      throw new Error("Failed to fetch height data");
    }
  }
  
  async function fetchBoneMass(){

    try {
      const measures = await api.fetchWithingsEntry('bone_mass');
      const bone = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const bone = calculateValueByUnit(value, unit);

        return {
          bone,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });

      setBoneMass(
        filterDataSince(bone, DATE_SINCE_TIMESTAMP, "date").reverse()
      );
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  async function fetchFatRatio(){
    try {
      const measures = await api.fetchWithingsEntry('fat_ratio');

      const fatRatio = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const fatRatio = calculateValueByUnit(value, unit);

        return {
          fatRatio,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });

      setFatRatio(
        filterDataSince(fatRatio, DATE_SINCE_TIMESTAMP, "date").reverse()
      );
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  async function fetchMuscle(){
    try {
      const measures = await api.fetchWithingsEntry('muscle_mass');

      const muscle = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        const muscle = calculateValueByUnit(value, unit);

        return {
          muscle,
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });

      setMuscle(
        filterDataSince(muscle, DATE_SINCE_TIMESTAMP, "date").reverse()
      );
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  async function fetchFatMassWeight(){
    try {
      const measures = await api.fetchWithingsEntry('fat_mass_weight');

      const fatMassWeights = measures.map((measure) => {
        const { value, unit } = measure.measures?.[0];

        return {
          fatMassWeight: calculateValueByUnit(value, unit),
          date: measure.date * 1000,
          formattedDate: convertTimestampToDateString(measure.date),
        };
      });
      const temp = filterDataSince(fatMassWeights, DATE_SINCE_TIMESTAMP, "date").reverse();
      setFatMassWeight(
        temp
      );
    } catch (error) {
      throw new Error("Failed to fetch bone mass data");
    }
  }

  useEffect(() => {
    getRequests();
  }, []);


  const getRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchWeight(),
        fetchHeight(),
        fetchBoneMass(),
        fetchFatRatio(),
        fetchMuscle(),
        fetchFatMassWeight(),
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const weightsFilteredByTime = useMemo(() => {
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return weights;
    }

    return weights?.filter((weight) => {
      const { date } = weight;

      return date >= dateRange.date_from && date <= dateRange.date_to;
    });
  }, [weights, dateRange]);

  const boneMassFilteredByTime = useMemo(() => {
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return boneMass;
    }
    return boneMass?.filter((bone) => {
      const { date } = bone;

      return date >= dateRange.date_from && date <= dateRange.date_to;
    });
  }, [boneMass, dateRange]);

  const fatRatioFilteredByTime = useMemo(() => {
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return fatRatio;
    }

    return fatRatio?.filter((fat) => {
      const { date } = fat;

      return date >= dateRange.date_from && date <= dateRange.date_to;
    });
  }, [fatRatio, dateRange]);

  const muscleFilteredByTime = useMemo(() => {
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return muscle;
    }

    return muscle?.filter((item) => {
      const { date } = item;

      return date >= dateRange.date_from && date <= dateRange.date_to;
    });
  }, [muscle, dateRange]);

  const fatMassWeightFilteredByTime = useMemo(() => {
    if (dateRange.date_from === null || dateRange.date_to === null) {
      return fatMassWeight;
    }

    return fatMassWeight?.filter((item) => {
      const { date } = item;

      return date >= dateRange.date_from && date <= dateRange.date_to;
    });
  }, [fatMassWeight, dateRange]);

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
          height={height}
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
          height={height}
          datePeriod={datePeriod}
        />
      </Flex>
    </Card>
  );
}
