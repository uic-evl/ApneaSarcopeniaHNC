import { useEffect, useRef } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";

export default function GaugeChart({ score, colorScale }) {
  // console.log(score);
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const sideMargin = 4;
  const topMargin = 4;
  const bottomMargin = 14;

  useEffect(() => {
    if (svg === undefined) {
      return;
    }

    svg.selectAll(".basePath").remove();

    const radius = Math.min(
      height - topMargin - bottomMargin,
      width / 2 - sideMargin
    );
    const thickness = radius * 0.15;
    svg
      .append("path")
      .attr("class", "basePath")
      .attr("transform", `translate(${width / 2},${height - bottomMargin})`)
      .attr("fill", "grey")
      .attr("opacity", 0.1)
      .attr(
        "d",
        d3.arc()({
          innerRadius: radius - thickness,
          outerRadius: radius,
          startAngle: -Math.PI / 2,
          endAngle: Math.PI / 2,
        })
      );
  }, [svg]);

  useEffect(() => {
    if (score === undefined || svg === undefined) {
      return;
    }

    const cScale = colorScale
      ? colorScale
      : d3
          .scaleLinear()
          .domain([0, 0.5, 1])
          .range(["#d7191c", "#ffffbf", "#2c7bb6"]);

    const radius = Math.min(
      height - topMargin - bottomMargin,
      width / 2 - sideMargin
    );
    const thickness = radius * 0.15;
    const pctPath = svg.selectAll(".pctPath").data([score]);
    pctPath
      .enter()
      .append("path")
      .attr("class", "pctPath")
      .attr("transform", `translate(${width / 2},${height - bottomMargin})`)
      .attr("opacity", 0.8)
      .merge(pctPath)
      .transition(1000)
      .attr("fill", cScale)
      .attr("d", (d) =>
        d3.arc()({
          innerRadius: radius - thickness,
          outerRadius: radius,
          startAngle: -Math.PI / 2,
          endAngle: ((2 * d - 1) * Math.PI) / 2,
        })
      );

    svg.select(".centerText").remove();
    svg
      .append("text")
      .attr("class", "centerText")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", 0.8 * height - bottomMargin)
      .attr("font-size", radius / 3)
      .attr("font-weight", "bold")
      //   .text(score === 0 ? "No Data" : (score * 100).toFixed() + "%");
      .text((score * 100).toFixed() + "%");
  }, [score, svg]);

  return (
    <div
      className={"d3-component"}
      style={{ height: "99%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
