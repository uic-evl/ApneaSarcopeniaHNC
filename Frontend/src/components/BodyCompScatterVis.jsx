import { useEffect, useRef, useCallback } from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import { filterDates } from '@src/utils';

export default function BodyCompScatterVis(props) {

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const leftMargin = 4;
    const rightMargin = 4;
    const topMargin = 4;
    const bottomMargin = 14;

    //default x scale, unless they go out-of-bounds
    const defaultLmiExtents = [10,30]
    //default y scale, unless they go out-of-bounds
    const defaultFmiExtents = [1,15]
    useEffect(() => {
        if (props.bodyCompData === null || svg === undefined || props.dateRange === undefined) { return }

        //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7542899/
        const lmiThreshold = props.gender === null? 15.25 : props.gender.toLowerCase() === 'male'? 16.7 : 13.8;

        //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2929934/
        const fmiThreshold = props.gender === null? 8.1 : props.gender.toLowerCase() === 'male'? 6.6 : 9.5;

        const useFilter = props.useFilter ? props.useFilter : true;

        const lmiExtents = d3.extent(props.bodyCompData.map(d => d.lmi));
        const fmiExtents = d3.extent(props.bodyCompData.map(d => d.fmi));

        const sideLength = Math.min(width - leftMargin - rightMargin, height - topMargin - bottomMargin);

        const xOffset = Math.max(0, (width - leftMargin - rightMargin - sideLength) / 2);
        const xStart = leftMargin + xOffset;
        const xScale = d3.scaleLinear()
            .domain([Math.min(lmiExtents[0], defaultLmiExtents[0]), Math.max(lmiExtents[1], defaultLmiExtents[1])])
            .range([xStart, xStart + sideLength]);

        const yOffset = Math.max(0, (height - topMargin - bottomMargin - sideLength) / 2);
        const yStart = height - bottomMargin - yOffset
        const yScale = d3.scaleLinear()
            .domain([Math.min(fmiExtents[0], defaultFmiExtents[0]), Math.max(fmiExtents[1], defaultFmiExtents[1])])
            .range([yStart , yStart - sideLength]);


        const data = useFilter ? filterDates(props.bodyCompData,props.dateRange.start,props.dateRange.stop) : props.bodyCompData.map(d => d);
        data.sort((a, b) => a.date - b.date)

        const colorScale = d3.scaleLinear()
            .domain(d3.extent(data.map(d => d.date)))
            .range(['pink', 'black'])


        var plotData = [];
        const windowSize = 3;
        data.forEach((d, i) => {
            const window = data.slice(Math.max(0, i - windowSize), Math.min(data.length - 1, i + windowSize));
            const entry = {}
            for (const obj of window) {
                for (const [key, value] of Object.entries(obj)) {
                    if (key === 'formattedDate') { continue }
                    const currVal = entry[key] ? entry[key] : 0;
                    entry[key] = currVal + (value / window.length)
                }
            }
            plotData.push(entry)
        })

        plotData = plotData.filter((d, i) => i === 0 || i === data.length - 1 || i % 7 === 0);
        const pathPoints = [];
        plotData.forEach(d => {
            pathPoints.push([xScale(d.lmi), yScale(d.fmi)]);
        });

        const threshPoints = [
            [
                [xStart, yScale(fmiThreshold)],
                [xStart + sideLength, yScale(fmiThreshold)]
            ],
            [
                [xScale(lmiThreshold), yStart],
                [xScale(lmiThreshold), yStart - sideLength]
            ]
        ]
        svg.selectAll('.thresholdLine').remove()
        const threshLines = svg.selectAll('.thresholdLine').data(threshPoints);
        threshLines.enter()
            .append('path').attr('class', 'thresholdLine')
            .attr('d', d3.line())
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('strokeWidth', 10)
            .attr('stroke-dasharray',4);

        svg.selectAll('.colorFill').remove();
        svg.append('rect')
            .attr('class','colorFill')
            .attr('')

        const dotSize = Math.max(4, Math.min(8, sideLength / 20, width / (10 * data.length)));
        svg.selectAll('.linePath').remove();
        svg.append('path').attr('class', 'linePath')
            .attr('d', d3.line()(pathPoints))
            .attr('fill', 'none')
            .attr('stroke', 'teal')
            .attr('stroke-width', dotSize / 4)


        const points = svg.selectAll('.points').data(plotData, (d, i) => i);
        points.enter()
            .append('circle').attr('class', 'points')
            .merge(points)
            .transition(100)
            .attr('cx', d => xScale(d.lmi))
            .attr('cy', d => yScale(d.fmi))
            .attr('r', dotSize)
            .attr('fill', d => colorScale(d.date))
        points.exit().remove();
        points.raise()

    }, [svg, props.bodyCompData, props.dateRange, props.useFilter, props.gender]);

    return (
        <div
            className={"d3-component"}
            style={{ 'height': '99%', 'width': '99%' }}
            ref={d3Container}
        ></div>
    );
}