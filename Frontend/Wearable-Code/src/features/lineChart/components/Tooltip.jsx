import { drawRectangle } from "@src/utils";
import _ from "lodash";
import { useMemo } from "react";
import tw from "tailwind-styled-components";

const WIDTH = 80;
const HEIGHT = 40;

export default function Tooltip({ data }) {
  const path = useMemo(() => {
    const radiuses = _.times(4, () => 6);

    return drawRectangle(WIDTH, HEIGHT, ...radiuses);
  }, []);

  if (!data) {
    return null;
  }

  return (
    <Wrapper transform={`translate(${data.x},${data.y + 6})`}>
      <path d={path} fill="#eaebec" transform={`translate(${-WIDTH / 2}, 5)`} />
      <Label y={20} textAnchor="middle">
        {data.label}
      </Label>
      <Value y={38} textAnchor="middle">
        {data.value}
      </Value>
    </Wrapper>
  );
}

const Wrapper = tw.g`
  fill-gray-200
  pointer-events-none
`;

const Label = tw.text`
  fill-gray-600
  text-xs
`;

const Value = tw.text`
   fill-gray-400
  text-xs
`;
