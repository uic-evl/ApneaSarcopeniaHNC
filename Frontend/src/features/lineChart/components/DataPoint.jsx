import { useMemo, useState } from "react";
import tw from "tailwind-styled-components";

// constants
import { DEFAULT_CHART_COLOR } from "@features/lineChart/config/constants";

export default function DataPoint({
  y,
  x,
  index,
  bandWidth,
  sizes,
  onHover,
  focusedItem,
  item,
  xAxisProperty,
  yAxisProperty,
  color,
}) {
  const [isHovering, setIsHovering] = useState(false);

  const isFocused = useMemo(() => {
    if (!focusedItem) return false;

    if (
      item[xAxisProperty] === focusedItem[xAxisProperty] &&
      item[yAxisProperty] === focusedItem[yAxisProperty]
    )
      return true;

    return false;
  }, [focusedItem, item, xAxisProperty, yAxisProperty]);

  return (
    <g
      onMouseOver={() => {
        setIsHovering(true);
        onHover({ x: x + bandWidth / 2, y });
      }}
      onMouseOut={() => {
        setIsHovering(false);
      }}
      transform={`translate(${x},${y})`}
    >
      <rect
        x={bandWidth / 4}
        y={-bandWidth / 4}
        width={bandWidth / 2}
        height={bandWidth / 2}
        fill="red"
        fillOpacity={0}
      />
      <Circle
        style={{ "--color": color || DEFAULT_CHART_COLOR }}
        cx={bandWidth / 2}
        cy={0}
        r={4}
        $isHovering={isHovering}
        $isFocused={isFocused}
      />
    </g>
  );
}

const Circle = tw.circle`
  fill-white
  stroke-[var(--color)]
  stroke-2


  transition-all
  ease-in-out
  duration-150

  ${({ $isHovering }) =>
    $isHovering &&
    `
    fill-[var(--color)]
  `}

  ${({ $isFocused }) =>
    $isFocused &&
    `
    fill-[var(--color)]
  `}
`;
