import { useEffect, useRef } from "react";
import useSVGCanvas from "./useSVGCanvas";
import { sleepScoreColorScale } from "@src/utils";
import * as d3 from "d3";

const sleepDetailsColorMap = {
  rem: "#b3cde3",
  light: "#8c96c6",
  deep: "#88419d",
  wake: "#ff4500",
};

const sleepStageColorMap = {
  rem: "#b3cde3",
  light: "#8c96c6",
  deep: "#88419d",
  wake: "#fdbe85",
};

export const SleepLegend = ({ plotVar }) => {
  const d3Container = useRef(null);
  //   const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const leftMargin = 4;
  const rightMargin = 4;
  const topMargin = 4;
  const bottomMargin = 4;

  useEffect(() => {
    if (plotVar === undefined) {
      return;
    }
    // console.log(plotVar);

    d3.select(d3Container.current).selectAll("*").remove();

    const svg = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", 205)
      .attr("height", 35);

    svg.selectAll(".sleepLegends").remove();

    if (plotVar === "Efficiency") {
      //   console.log("removing sleep legend");
      svg.selectAll(".sleepLegendBar").remove();

      const colorDomains = sleepScoreColorScale.domain();

      const gradient = svg
        .append("defs")
        .attr("class", "sleepLegendBar")
        .append("linearGradient")
        .attr("id", "sleepGradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

      // Set gradient stops
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", sleepScoreColorScale(colorDomains[0])); // White

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", sleepScoreColorScale(colorDomains[1])); // Green

      // Draw the rectangle using the gradient
      svg
        .append("rect")
        .attr("class", "sleepLegends")
        .attr("x", 10)
        .attr("y", 20)
        .attr("width", 100)
        .attr("height", 10)
        .style("fill", "url(#sleepGradient)");

      // Add labels for the legend
      svg
        .append("text")
        .attr("class", "sleepLegends")
        .attr("x", 10)
        .attr("y", 18)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text("0");

      svg
        .append("text")
        .attr("class", "sleepLegends")
        .attr("x", 50)
        .attr("y", 18)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text(colorDomains[1]);
    } else {
      svg.selectAll(".sleepLegendBar").remove();

      // svg
      //   .selectAll("sleepLegendBar")
      //   .data(Object.keys(sleepStageColorMap))
      //   .enter()
      //   .append("rect")
      //   .attr("class", "sleepLegendBar")
      //   .attr("x", 0)
      //   .attr("y", (d, i) => i * 15)
      //   .attr("width", 15)
      //   .attr("height", 15)
      //   .attr("fill", (d) => sleepStageColorMap[d])
      //   .attr("opacity", plotVar === "Details" ? 0.5 : 1);

      // svg
      //   .selectAll("sleepLegendBar")
      //   .data(Object.keys(sleepStageColorMap))
      //   .enter()
      //   .append("text")
      //   .attr("class", "sleepLegendBar")
      //   .attr("x", 17)
      //   .attr("y", (d, i) => i * 15 + 10)
      //   .text((d) => d);

      svg
        .selectAll("sleepLegendBar")
        .data(Object.keys(sleepStageColorMap))
        .enter()
        .append("rect")
        .attr("class", "sleepLegendBar")
        .attr("x", (d, i) => i * 52)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", (d) =>
          plotVar === "Details"
            ? sleepDetailsColorMap[d]
            : sleepStageColorMap[d]
        )
        .attr("opacity", plotVar === "Details" ? 0.5 : 1);

      svg
        .selectAll("sleepLegendBar")
        .data(Object.keys(sleepStageColorMap))
        .enter()
        .append("text")
        .attr("class", "sleepLegendBar")
        .attr("x", (d, i) => i * 50 + 22)
        .attr("y", 12)
        .text((d) => d);

      svg.selectAll(".sleepLegendAdditional").remove();
      if (plotVar === "Details") {
        const additionalY = 20;
        svg
          .append("rect")
          .attr("class", "sleepLegendAdditional")
          .attr("x", 0)
          .attr("y", additionalY)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", "grey")
          .attr("opacity", 0.8);

        svg
          .append("text")
          .attr("class", "sleepLegendAdditional")
          .attr("x", 20)
          .attr("y", additionalY + 12)
          .text("Briefly Wake");
      }
    }
  }, [plotVar]);

  return (
    <div
      className={"d3-component"}
      style={{
        height: "10%",
        width: "10%",
        position: "absolute",
        top: "41%",
        paddingLeft: "1%",
      }}
      ref={d3Container}
    ></div>
  );
};
