import { useEffect, useRef, useCallback } from "react";
import useSVGCanvas from "./useSVGCanvas";
import { filterDates } from "@src/utils";
import * as d3 from "d3";

const accessors = {
  fat_mass_weight: "fatMassWeight",
  bone_mass: "bone",
  fat_ratio: "fatRatio",
  muscle_mass: "muscle",
  weight: "weight",
};

const labelText = {
  fat_mass_weight: "Fat Mass Index",
  bone_mass: "Bone Mass Index",
  fat_ratio: "Fat Ratio",
  muscle_mass: "Muscle Mass Index",
  weight: "Body Mass Index",
};

const colorDict = {
  fat_mass_weight: "#e41a1c",
  weight: "#377eb8",
  bone_mass: "grey",
  muscle_mass: "#4daf4a",
};
export default function BodyCompVis(props) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const leftMargin = 25;
  const rightMargin = 4;
  const topMargin = 4;
  const bottomMargin = 25;

  useEffect(() => {
    if (
      props.withingsData === null ||
      svg === undefined ||
      props.dateRange === undefined
    ) {
      return;
    }
    const dotSize = Math.min(
      20,
      width / (4 * props.withingsData.weight.length),
      rightMargin,
      leftMargin
    );

    const hSquared = props.withingsData.height;
    const useFilter = props.useFilter ? props.useFilter : false;
    const xDomain = useFilter
      ? [props.dateRange.start, props.dateRange.stop]
      : d3.extent(props.withingsData.weight.map((d) => d.date));

    console.log(xDomain);
    const xScale = d3
      .scaleLinear()
      .domain(xDomain)
      .range([leftMargin, width - rightMargin]);

    const plotVars = props.plotVars
      ? props.plotVars
      : ["bone_mass", "fat_mass_weight", "muscle_mass", "weight"];

    const weightMax = d3.max(
      props.withingsData.weight.map((d) => d.weight / hSquared)
    );
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(25, weightMax)])
      .range([height - bottomMargin - dotSize, topMargin + dotSize]);

    function drawLine(key) {
      //   console.log(key);
      // draw the axes
      svg.select(".x-axis").remove();
      svg.select(".y-axis").remove();

      const axisBottom = d3
        .axisBottom(xScale)
        .tickFormat(d3.timeFormat("%m/%d"))
        .ticks(7);

      const axisLeft = d3.axisLeft(yScale);

      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - bottomMargin})`)
        .call(axisBottom);

      svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${leftMargin},0)`)
        .call(axisLeft);

      const accessor = accessors[key];
      const data = useFilter
        ? filterDates(
            props.withingsData[key],
            props.dateRange.start,
            props.dateRange.stop,
            "date"
          )
        : props.withingsData[key];
      const color = colorDict[key] ? colorDict[key] : "black";
      const linePoints = [];
      const items = [];
      data.forEach((d) => {
        const tempX = xScale(d.date);
        const tempY = yScale(d[accessor] / hSquared);
        const entry = {
          x: tempX,
          value: d[accessor] / hSquared,
          y: tempY,
          ...d,
        };
        items.push(entry);
        linePoints.push([tempX, tempY]);
      });

      svg.select("." + key + "path").remove();
      svg
        .append("path")
        .attr("class", key + "path")
        .attr("d", d3.line()(linePoints))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", dotSize / 2);

      const dots = svg.selectAll(".dots" + key).data(items, (d) => d.date);
      dots
        .enter()
        .append("circle")
        .attr("class", "dots" + key)
        .merge(dots)

        .attr("cy", (d) => d.y)
        .attr("cx", (d) => d.x)
        .attr("r", dotSize)
        .attr("fill", color)
        .attr("stroke", color)
        .attr("stroke-width", dotSize / 2)
        .append("title")
        .text((d) => {
          return `${d.formattedDate}: ${d[accessor].toFixed(2) / hSquared}`;
        })
        .transition(100);
      dots.exit().remove();

      // console.log(items);
      //adding the name of the variable to the plot near the lines
      svg.select("." + key + "text").remove();
      svg
        .append("text")
        .attr("class", key + "text")
        .attr("x", width - rightMargin)
        .attr("y", items[items.length - 1].y + 8)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("fill", color)
        .text(labelText[key]);
    }

    plotVars.map(drawLine);
  }, [svg, props.withingsData, props.dateRange, props.useFilter]);

  return (
    <div
      className={"d3-component"}
      style={{ height: "99%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
