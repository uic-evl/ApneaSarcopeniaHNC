import { useEffect, useRef, useCallback } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { filterDates } from "@src/utils";
import moment from "moment";

export default function BodyCompScatterVisWithoutSidelength(props) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const bottomTitleSize = 15;
  const sectionTitleSize = 20;
  const leftMargin = 4;
  const rightMargin = 4;
  const topMargin = sectionTitleSize;
  const bottomMargin = sectionTitleSize + bottomTitleSize;

  const minKgDiffToPlot = .1;
  //default x scale, unless they go out-of-bounds
  const defaultLmiExtents = [10, 30];
  //default y scale, unless they go out-of-bounds
  const defaultFmiExtents = [3, 15];
  useEffect(() => {
    if (
      props.bodyCompData === null ||
      svg === undefined ||
      props.dateRange === undefined
    ) {
      return;
    }

    // console.log(props.bodyCompTrend);
    //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7542899/
    const lmiThreshold =
      props.gender === null
        ? 15.25
        : props.gender.toLowerCase() === "male"
          ? 16.7
          : 13.8;

    //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2929934/
    const fmiThreshold =
      props.gender === null
        ? 8.1
        : props.gender.toLowerCase() === "male"
          ? 6.6
          : 9.5;

    const useFilter = props.useFilter ? props.useFilter : true;

    const lmiExtents = d3.extent(props.bodyCompData.filter(d => d.lmi > 0).map((d) => d.lmi));
    const fmiExtents = d3.extent(props.bodyCompData.filter(d => d.fmi > 0).map((d) => d.fmi));

    const viewHeight = height - topMargin - bottomMargin;
    const viewWidth = width - leftMargin - rightMargin;

    const xScale = d3
      .scaleLinear()
      .domain([
        Math.min(lmiExtents[0], defaultLmiExtents[0]),
        Math.max(lmiExtents[1], defaultLmiExtents[1]),
      ])
      .range([leftMargin, width - rightMargin]);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(fmiExtents[0], defaultFmiExtents[0]),
        Math.max(fmiExtents[1], defaultFmiExtents[1]),
      ])
      .range([height - bottomMargin, topMargin]);

    const badZoneWidth = xScale(lmiThreshold) - leftMargin;
    const badZoneHeight = yScale(fmiThreshold) - topMargin;

    const dateRangeDays = (props.dateRange.stop-props.dateRange.start)/(1000*60*24*60);

    const data = useFilter
      ? filterDates(
        props.bodyCompData,
        props.dateRange.start,
        props.dateRange.stop
      )
      : props.bodyCompData.map((d) => d);
    
    data.sort((a, b) => a.date - b.date);

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(data.map((d) => d.date)))
      .range(["pink", "black"]);

    var plotData = [];
    const windowSize = dateRangeDays > 89? 7 : dateRangeDays > 28? 5 : 3;
    data.forEach((d, i) => {
      const window = data.slice(
        Math.max(0, i - windowSize),
        Math.min(data.length - 1, i + windowSize)
      );
      const entry = {};
      for (const obj of window) {
        for (const [key, value] of Object.entries(obj)) {
          if (key === "formattedDate") {
            continue;
          }
          const currVal = entry[key] ? entry[key] : 0;
          entry[key] = currVal + value / window.length;
        }
      }
      plotData.push(entry);
    });


    //calculate changes in values
    let maxChange = 0;
    let minChange = Infinity;
    const compChanges = plotData.filter(d=>d.lmi > 0).filter(d => d.fmi > 0).map((d,i) => {
      const d2 = plotData[Math.min(i+1,plotData.length-1)];
      const compChange = (d.lmi - d2.lmi)**2 + (d.fmi - d2.fmi)**2;
      const thing = Object.assign({},d);
      thing.compChange = compChange;
      maxChange = Math.max(compChange,maxChange);
      minChange = Math.min(compChange,minChange);
      return thing;
    })

    console.log(maxChange,minChange)
    const kgPlotThreshold = Math.min(1,Math.max(minKgDiffToPlot, (maxChange)/4));
    let trendData = [];
    if (props.bodyCompTrend === true) {
      trendData.push(plotData[0]);
      let currval = plotData[0];
      for (const i in compChanges) {
        const val = compChanges[+i];
        if ((val.compChange >= kgPlotThreshold) || +i === data.length - 1 || i === 0) {
          trendData.push(val);
          currval = val;
        }
      }
      // trendData = plotData.filter(
      //   (d, i) => i === 0 || i === data.length - 1 || i % 7 === 0
      // );
    } else {
      trendData = plotData.filter((d, i) => i === data.length - 1);
    }
    // console.log(trendData);

    const filterWindowSize = dateRangeDays > 89? 7 : dateRangeDays >= 28? 3 : 1;
    const pathPoints = [];
    trendData.forEach((d, i) => {
      // if (i === 0 || i === data.length - 1 || i % filterWindowSize === 0)
        pathPoints.push([xScale(d.lmi), yScale(d.fmi)]);
    });

    const threshPoints = [
      // Horizontal line for FMI threshold
      [
        [leftMargin * 6.5, yScale(fmiThreshold)], // Start at the left margin
        [xScale.range()[1] / 1.01, yScale(fmiThreshold)], // End at the right edge of the chart
      ],
      // Vertical line for LMI threshold
      [
        [xScale(lmiThreshold), yScale.range()[0] / 1.03], // Start at the bottom of the chart
        [xScale(lmiThreshold), topMargin], // End at the top margin
      ],
    ];

    // console.log(threshPoints);

    svg.selectAll(".thresholdLine").remove();
    const threshLines = svg.selectAll(".thresholdLine").data(threshPoints);
    threshLines
      .enter()
      .append("path")
      .attr("class", "thresholdLine")
      .attr("d", d3.line())
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("strokeWidth", 10)
      .attr("stroke-dasharray", 4);

    // Add text for the thresholds
    const threshText = ["Fat Mass Index (kg/m²)", "Lean Mass Index (kg/m²)"];

    svg.selectAll(".threshText").remove();

    // Position for FMI text (on the left, rotated above the threshold line)
    svg
      .append("text")
      .attr("class", "threshText")
      .attr("x", 0) // Slightly offset to the left of the threshold line
      .attr("y", 0) // Slightly above the threshold line
      .attr("font-size", bottomTitleSize)
      .text(threshText[0])
      .attr("text-anchor", "middle") // Text anchor set to "end" for right-aligned text
      .attr(
        "transform",
        `translate(${leftMargin+10},${height/2})rotate(-90)`
      ); // Rotate around the text position

    // Position for LMI text (on the bottom, centered under the threshold line)
    svg
      .append("text")
      .attr("class", "threshText")
      .attr('x', width/2)
      // .attr("x", xScale(lmiThreshold) - 5) // Position at the threshold line
      .attr("y", height - 2) // Adjust for the middle bottom of the chart
      .attr("font-size", bottomTitleSize)
      .text(threshText[1])
      .attr("text-anchor", "middle"); // Text anchor set to "middle" for centering the text

    // Add x-axis values for min and max LMI (numeric values)
    const xValues = [
      lmiThreshold - (xScale.domain()[1] - xScale.domain()[0]) / 4,
      lmiThreshold,
      lmiThreshold + (xScale.domain()[1] - xScale.domain()[0]) / 4,
    ].map((value) => ({ value }));

    svg.selectAll(".xAxisValue").remove();
    const xAxisValues = svg.selectAll(".xAxisValue").data(xValues);
    xAxisValues
      .enter()
      .append("text")
      .attr("class", "xAxisValue")
      .merge(xAxisValues)
      .attr("x", (d, i) => xScale(d.value) - i * 5)
      .attr("y", yScale(yScale.domain()[0]) + bottomMargin / 4)
      .attr("font-size", 0.5 * sectionTitleSize)
      .attr("text-anchor", "middle")
      .text((d) => d.value.toFixed(1)); // Only show the numeric value, formatted

    // Add y-axis values for min and max FMI (numeric values)
    const yValues = [
      fmiThreshold - (yScale.domain()[1] - yScale.domain()[0]) / 4,
      fmiThreshold,
      fmiThreshold + (yScale.domain()[1] - yScale.domain()[0]) / 4,
    ].map((value) => ({ value }));

    svg.selectAll(".yAxisValue").remove();
    const yAxisValues = svg.selectAll(".yAxisValue").data(yValues);
    yAxisValues
      .enter()
      .append("text")
      .attr("class", "yAxisValue")
      .merge(yAxisValues)
      .attr("x", xScale(xScale.domain()[0]) + leftMargin * 6) // Position near the y-axis line
      .attr("y", (d) => yScale(d.value) + 2) // Position based on FMI scale
      .attr("font-size", 0.5 * sectionTitleSize)
      .attr("text-anchor", "middle")
      .text((d) => d.value.toFixed(1)); // Only show the numeric value, formatted

    //make sarcopenia range red

    // const pos = [];
    // const increment = 0.5;
    // var currpos = 0;
    // while (currpos <= 1) {
    //   pos.push(currpos);
    //   currpos += increment;
    // }

    //coloring the bad zones
    // svg.selectAll(".colorFill").remove();

    // svg
    //   .selectAll(".colorFill")
    //   .data(pos)
    //   .enter()
    //   .append("rect")
    //   .attr("class", "colorFill")
    //   .attr("x", leftMargin)
    //   .attr("y", topMargin)
    //   .attr("width", badZoneWidth)
    //   .attr("height", height - topMargin - bottomMargin)
    //   .attr("fill", "red")
    //   .attr("opacity", (g) => 0.1 * (1 - g ** 4));

    //draw a ling for the trajectory
    const dotSize = Math.min(width,height)/50//Math.max(1, Math.min(4, width / (3 * trendData.length)));
    const curveFunc = d3.line().curve(d3.curveCardinal)
    svg.selectAll(".linePath").remove();
    svg
      .append("path")
      .attr("class", "linePath")
      .attr("d", curveFunc(pathPoints))
      .attr("fill", "none")
      .attr("stroke", "teal")
      .attr("stroke-width", dotSize / 4);

    //draw bmi for timepoints
    svg.selectAll(".sarcopeniaPoints").remove();
    const points = svg
      .selectAll(".sarcopeniaPoints")
      .data(trendData, (d, i) => i);
    points
      .enter()
      .append("circle")
      .attr("class", "sarcopeniaPoints")
      .merge(points)
      .attr("cx", (d) => xScale(d.lmi))
      .attr("cy", (d) => yScale(d.fmi))
      .attr("r", (d,i) => (((1+i)/(trendData.length))**.25)*dotSize)
      .attr("fill", (d) => colorScale(d.date))
      .append("title")
      .text((d) => {
        // console.log(moment(d.date).format("YYYY-MM-DD"), d.lmi, d.fmi, d.bmi);
        return `Date: ${moment(d.date).format("YYYY-MM-DD")}
        LMI: ${d.lmi.toFixed(2)}
        FMI: ${d.fmi.toFixed(2)}
        BMI: ${d.bmi.toFixed(2)}`;
      })
      .transition(100);
    points.exit().remove();
    points.raise();

    const annotationText = [
      {
        x: leftMargin + badZoneWidth / 2,
        y: topMargin + bottomMargin / 6,
        text: "Sarcopenic Obese",
        size: 0.7 * sectionTitleSize,
        length: '',
        opacity: .7,
      },
      {
        x: leftMargin + badZoneWidth / 2,
        y: height-bottomMargin - 5,//height - bottomTitleSize,
        text: "Low Lean Mass",
        size: 0.7 * sectionTitleSize,
        length: '',
        opacity: .7,
      },
      {
        x: width - rightMargin - ((width - xScale(lmiThreshold)) / 2.5),
        y: height-bottomMargin - 5,//height - bottomTitleSize,
        text: "High Lean Mass",
        size: 0.7 * sectionTitleSize,
        length: '',
        opacity: .7,
      },
      {
        x: width - rightMargin - ((width - xScale(lmiThreshold)) / 2.5),
        y: topMargin + bottomMargin / 6,
        text: "Obesity",
        size: 0.7 * sectionTitleSize,
        length: '',
        opacity: .7,
      },
      // {
      //   x: width / 2,
      //   y: height - 2,
      //   text: "Lean Mass Index vs Fat Mass Index",
      //   size: 0.6 * bottomTitleSize,
      //   length: "",
      // },
    ];
    const annotations = svg.selectAll(".anno").data(annotationText);
    annotations
      .enter()
      .append("text")
      .attr("class", "anno")
      .merge(annotations)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("font-size", (d) => d.size)
      .attr("text-anchor", "middle")
      .attr("textLength", (d) => d.text.length * d.size > width / 2 ? width / 3 : d.length)
      .attr("lengthAdjust", "spacingAndGlyphs")
      .attr('opacity',d=>d.opacity)
      .text((d) => d.text);
  }, [
    svg,
    props.bodyCompData,
    props.dateRange,
    props.useFilter,
    props.gender,
    props.bodyCompTrend,
  ]);
  return (
    <div
      className={"d3-component"}
      style={{ height: "98%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
