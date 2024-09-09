import { Result } from "antd";
import moment from "moment";
import { useMemo } from "react";
import tw from "tailwind-styled-components";

// features
import LineChart from "@features/lineChart";

// constants
import { DATE_PERIODS } from "@src/constants";

// utils
import { isFloat } from "@src/utils";

export default function BMIChart({ weights, height, daysCount }) {
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

  const BMIData = useMemo(() => {
    return weights?.map(({ weight, date }) => {
      const bmi = Math.floor(weight) / Math.pow(height, 2);

      return {
        time: getTime(date),
        bmi: isFloat(bmi) ? bmi.toFixed(1) : bmi,
      };
    });
  }, [weights, height]);

  if (!BMIData?.length)
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, No data exists for BMI Chart."
        extra={null}
      />
    );

  return (
    <Wrapper>
      <Label>BMI</Label>
      <LineChart
        datasets={[
          {
            title: "BMIChart",
            color: "#3F51B5",
            data: BMIData,
          },
        ]}
        guideLine={{
          max: 24.9,
          min: 18.5,
          color: "#4CAF50",
        }}
        options={{
          width: 500,
          height: 300,
          margin: { top: 40, right: 10, bottom: 40, left: 0 },
          padding: 0,
          yLabelsCount: 6,
          xLabelsCount: 10,
          xAxisProperty: "time",
          yAxisProperty: "bmi",
          tooltipLabelKey: "time",
          tooltipValueKey: "bmi",
          customYMax: 40,
          customYMin: 15,
        }}
      />
    </Wrapper>
  );
}

const Wrapper = tw.div`
  relative
  w-1/3
  pt-7
`;

const Label = tw.div`
  absolute
  top-0
  left-2
  text-xs
  text-gray-500
`;
