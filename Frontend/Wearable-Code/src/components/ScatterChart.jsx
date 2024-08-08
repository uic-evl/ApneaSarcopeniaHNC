import { Result } from "antd";
import { useMemo } from "react";
import tw from "tailwind-styled-components";

// features
import ScatterplotChart from "@features/scatterplotChart";

// utils
import {
  calculateAverageProperty,
  convertPercentageToDecimal,
  groupDataByPeriod,
  summarizeDataDaily,
} from "@src/utils";

const yMin = 3.4;
const yMax = 15;
const xMin = 12.7;
const xMax = 20;

export default function ScatterChart({
  fatMassWeight,
  weight,
  fatRatio,
  height,
}) {
  const averageFatMassWeight = useMemo(() => {
    const averageData = calculateAverageProperty(
      fatMassWeight,
      "fatMassWeight"
    );

    const groupedByMonth = groupDataByPeriod(fatMassWeight, "date", 4, "month");
    const groupedByWeek = groupDataByPeriod(fatMassWeight, "date", 4, "week");

    const fatMassWeightDailySummarized = summarizeDataDaily(
      fatMassWeight,
      "weight"
    );

    const daysCount = fatMassWeightDailySummarized?.length;

    if (daysCount > 1 && daysCount <= 7) {
      return [averageData];
    } else if (daysCount > 7 && daysCount <= 30) {
      return groupedByWeek.map((weekData) => {
        return calculateAverageProperty(weekData, "fatMassWeight");
      });
    } else if (daysCount > 30) {
      return groupedByMonth.map((monthData) => {
        return calculateAverageProperty(monthData, "fatMassWeight");
      });
    }

    return [];
  }, [fatMassWeight]);

  const averageWeight = useMemo(() => {
    const averageData = calculateAverageProperty(weight, "weight");

    const groupedByMonth = groupDataByPeriod(weight, "date", 4, "month");
    const groupedByWeek = groupDataByPeriod(weight, "date", 4, "week");

    const weightDailySummarized = summarizeDataDaily(weight, "weight");

    const daysCount = weightDailySummarized?.length;

    if (daysCount > 1 && daysCount <= 7) {
      return [averageData];
    } else if (daysCount > 7 && daysCount <= 30) {
      return groupedByWeek.map((weekData) => {
        return calculateAverageProperty(weekData, "weight");
      });
    } else if (daysCount > 30) {
      return groupedByMonth.map((monthData) => {
        return calculateAverageProperty(monthData, "weight");
      });
    }

    return [];
  }, [weight]);

  const averageFatRatio = useMemo(() => {
    const averageData = calculateAverageProperty(fatRatio, "fatRatio");

    const groupedByMonth = groupDataByPeriod(fatRatio, "date", 4, "month");
    const groupedByWeek = groupDataByPeriod(fatRatio, "date", 4, "week");

    const fatRatioDailySummarized = summarizeDataDaily(fatRatio, "fatRatio");

    const daysCount = fatRatioDailySummarized?.length;

    if (daysCount > 1 && daysCount <= 7) {
      return [averageData];
    } else if (daysCount > 7 && daysCount <= 30) {
      return groupedByWeek.map((weekData) => {
        return calculateAverageProperty(weekData, "fatRatio");
      });
    } else if (daysCount > 30) {
      return groupedByMonth.map((monthData) => {
        return calculateAverageProperty(monthData, "fatRatio");
      });
    }

    return [];
  }, [fatRatio]);

  const LBM = useMemo(() => {
    return averageWeight.map((weight, index) => {
      const fatRatio = averageFatRatio[index];

      if (!weight || !fatRatio) return null;

      return weight - weight * convertPercentageToDecimal(fatRatio);
    });
  }, [averageWeight, averageFatRatio]);

  const LMI = useMemo(() => {
    return LBM.map((LBMValue, index) => {
      return LBMValue / Math.pow(height, 2);
    });
  }, [LBM]);

  const FMI = useMemo(() => {
    return averageFatMassWeight.map((fatMassWeightValue) => {
      return fatMassWeightValue / Math.pow(height, 2);
    });
  }, [averageFatMassWeight]);

  const positions = useMemo(() => {
    return FMI.filter((FMIValue, index) => {
      let y = FMIValue;
      let x = LMI[index];

      if (!y || !x) return false;

      return true;
    }).map((FMIValue, index) => {
      let y = FMIValue;
      let x = LMI[index];

      if (x < xMin) {
        x = xMin;
      }

      if (x > xMax) {
        x = xMax;
      }

      if (y < yMin) {
        y = yMin;
      }

      if (y > yMax) {
        y = yMax;
      }

      return {
        x,
        y,
      };
    });
  }, [LMI, FMI]);

  if (!positions.length)
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, No data exists for this Chart."
        extra={null}
      />
    );

  return (
    <Wrapper>
      {/* <Guide>
        FMI: {FMI.toFixed(2)} - LMI: {LMI.toFixed(2)}
      </Guide> */}
      <Label className="-top-5 left-0">Sarcopenic obese</Label>
      <Label className="-top-5 right-0">Obesity</Label>
      <Label className="-bottom-4 right-0">High Lean Mass</Label>
      <Label className="-bottom-4 left-0">Low Lean Mass</Label>
      <ThresholdNumber className="-translate-x-4 top-[13%]">13</ThresholdNumber>
      <ThresholdNumber className="-translate-x-10 top-[45%]">
        <ThresholdLabel>FMI</ThresholdLabel> 9
      </ThresholdNumber>
      <ThresholdNumber className="-translate-x-4 top-[73%]">5</ThresholdNumber>
      <ThresholdNumber className="-translate-y-2 bottom-0 left-[28%]">
        15
      </ThresholdNumber>
      <ThresholdNumber className="translate-y-3 bottom-0 left-[45.2%] text-center">
        16.5
        <br />
        <ThresholdLabel>LMI</ThresholdLabel>
      </ThresholdNumber>
      <ThresholdNumber className="-translate-y-2 bottom-0 left-[66%]">
        18
      </ThresholdNumber>
      <ScatterplotChart
        className=""
        dataset={positions}
        options={{
          width: 300,
          height: 300,
          labelsCount: 6,
          xAxisProperty: "x",
          yAxisProperty: "y",
          padding: 10,
          colors: ["#cf71d1", "#cb1dd1", "#e7b5e8", "#f1d4f1"],
          yMin,
          yMax,
          xMin,
          xMax,
        }}
      />
    </Wrapper>
  );
}

const Wrapper = tw.div`
  w-1/5
  ml-8
  relative
`;

const Label = tw.div`
  absolute
  text-base
  text-gray-500
`;

const ThresholdNumber = tw.span`
  absolute
  text-xs
  text-gray-400
  bg-white
`;

const Guide = tw.div`
  absolute
  left-1/2
  -translate-x-1/2
  -top-12
  text-gray-600
  text-base
`;

const ThresholdLabel = tw.span`
  text-base
  text-gray-700
`;
