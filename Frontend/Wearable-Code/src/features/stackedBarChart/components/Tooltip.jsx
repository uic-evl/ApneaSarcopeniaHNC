import _ from "lodash";
import { useMemo } from "react";
import tw from "tailwind-styled-components";

// utils
import { drawRectangle } from "@src/utils";

const WIDTH = 60;
const HEIGHT = 75;

export default function Tooltip({
  xAxisProperty,
  bandwidth,
  value,
  sizes,
  xScale,
}) {
  const path = useMemo(() => {
    const radiuses = _.times(4, () => 6);

    return drawRectangle(WIDTH, HEIGHT, ...radiuses);
  }, []);

  if (!value) {
    return null;
  }

  return (
    <Wrapper
      transform={`translate(${
        xScale(value?.[xAxisProperty]) + bandwidth / 2 - WIDTH / 2
      },${25})`}
    >
      <path d={path} fill="#eaebec" />
      <Label fontSize={8} y={16} x={WIDTH / 2} textAnchor="middle">
        {value?.[xAxisProperty]}
      </Label>
      <g transform="translate(10,31)">
        {Object.keys(value)
          .filter((valueKey) => valueKey !== xAxisProperty)
          .map((valueKey, index) => (
            <Value key={valueKey} fontSize={8} y={index * 12}>
              {valueKey}: {value[valueKey]}
            </Value>
          ))}
      </g>
    </Wrapper>
  );
}

const Wrapper = tw.g`
  fill-gray-200
  pointer-events-none
`;

const Label = tw.text`
  fill-gray-600
`;

const Value = tw.text`
   fill-gray-400
`;
