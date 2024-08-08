import { Result } from "antd";
import moment from "moment";
import { useMemo, useState } from "react";
import tw from "tailwind-styled-components";

// features
import LineChart from "@src/features/lineChart";

// constants
import { DATE_PERIODS } from "@src/constants";

// utils
import { isFloat } from "@src/utils";

const CHART_TYPES = Object.freeze({
  bone: "bone",
  fat: "fat",
  muscle: "muscle",
});

export default function BoneFatMuscleChart({
  boneMass,
  fatRatio,
  muscle: muscles,
  daysCount,
}) {
  const [selectedItems, setSelectedItems] = useState({
    [CHART_TYPES.bone]: CHART_TYPES.bone,
    [CHART_TYPES.fat]: CHART_TYPES.fat,
    [CHART_TYPES.muscle]: CHART_TYPES.muscle,
  });
  const [normalZone, setNormalZone] = useState(null);

  const getTime = (date) => {
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

  const BoneData = useMemo(() => {
    return boneMass?.map(({ bone, date }) => {
      return {
        time: getTime(date),
        percentage: isFloat(bone) ? bone.toFixed(1) : bone,
      };
    });
  }, [boneMass]);

  const FatRatioData = useMemo(() => {
    return fatRatio?.map(({ fatRatio, date }) => {
      return {
        time: getTime(date),
        percentage: isFloat(fatRatio) ? fatRatio.toFixed(1) : fatRatio,
      };
    });
  }, [fatRatio]);

  const MuscleData = useMemo(() => {
    return muscles?.map(({ muscle, date }) => {
      return {
        time: getTime(date),
        percentage: isFloat(muscle) ? muscle.toFixed(1) : muscle,
      };
    });
  }, [muscles]);

  const datasets = useMemo(() => {
    let result = [];

    if (selectedItems[CHART_TYPES.bone] !== undefined) {
      result.push({
        title: "Bone",
        color: "#374151",
        data: BoneData || [],
      });
    }

    if (selectedItems[CHART_TYPES.fat] !== undefined) {
      result.push({
        title: "Fat",
        color: "#b91c1c",
        data: FatRatioData || [],
      });
    }

    if (selectedItems[CHART_TYPES.muscle] !== undefined) {
      result.push({
        title: "Muscle",
        color: "#00BCD4",
        data: MuscleData || [],
      });
    }

    return result;
  }, [selectedItems, MuscleData, FatRatioData, BoneData]);

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

  const checkIfNoData = useMemo(() => {
    if (
      !Object.keys(selectedItems).length ||
      !BoneData?.length ||
      !FatRatioData?.length ||
      !MuscleData?.length
    )
      return true;

    return false;
  }, [selectedItems, BoneData, FatRatioData, MuscleData]);

  const guideLine = useMemo(() => {
    if (Object.keys(selectedItems).length !== 1) {
      return null;
    }

    if (selectedItems[CHART_TYPES.fat]) {
      return {
        max: 33,
        min: 22,
        color: "#4CAF50",
      };
    }

    if (selectedItems[CHART_TYPES.muscle]) {
      return {
        max: 75.5,
        min: 63,
        color: "#4CAF50",
      };
    }

    if (selectedItems[CHART_TYPES.bone]) {
      return {
        max: 4,
        min: 2.5,
        color: "#4CAF50",
      };
    }

    return null;
  }, [selectedItems]);

  return (
    <Wrapper>
      <YAxisLabel>Percentage</YAxisLabel>
      <Labels>
        <Label
          className="text-gray-700"
          onClick={() => toggleChart(CHART_TYPES.bone)}
          $selected={selectedItems[CHART_TYPES.bone] !== undefined}
        >
          <Circle className="bg-gray-700" />
          Bone
        </Label>
        <Label
          className="text-red-700"
          onClick={() => toggleChart(CHART_TYPES.fat)}
          $selected={selectedItems[CHART_TYPES.fat] !== undefined}
        >
          <Circle className="bg-red-700" />
          Fat
        </Label>
        <Label
          className="text-[#00BCD4]"
          onClick={() => toggleChart(CHART_TYPES.muscle)}
          $selected={selectedItems[CHART_TYPES.muscle] !== undefined}
        >
          <Circle className="bg-[#00BCD4]" />
          Muscle
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
          className=""
          datasets={datasets}
          guideLine={guideLine}
          options={{
            width: 500,
            height: 300,
            margin: { top: 40, right: 10, bottom: 40, left: 0 },
            padding: 0,
            yLabelsCount: 10,
            xLabelsCount: 7,
            xAxisProperty: "time",
            yAxisProperty: "percentage",
            tooltipLabelKey: "time",
            tooltipValueKey: "percentage",
            customYMin: 0,
            customYMax: 100,
          }}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = tw.div`
  relative
  w-1/3
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

const YAxisLabel = tw.span`
  absolute
  top-2
  left-2
  text-xs
  text-gray-500
`;
