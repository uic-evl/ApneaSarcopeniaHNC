import { useEffect, useRef,useMemo } from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import moment from 'moment';
import { sleepScoreColorScale } from '../utils';
export default function SleepScoreChartVis(props) {

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const leftMargin = 4;
    const rightMargin = 4;
    const topMargin = 4;
    const bottomMargin = 14;
    useEffect(() => {
        if (props.sleepData === null || svg === undefined || props.dateRange === undefined) { return }
        var data = props.sleepData.map((log) => {
            const date = moment(log.dateOfSleep).unix() * 1000;

            return {
                ...log,
                number: log.efficiency,
                date,
            };
        });
        if (props.dateRange.start !== null)
            data = data.filter(d => d.date >= props.dateRange.start);
        if (props.dateRange.stop !== null)
            data = data.filter(d => d.date <= props.dateRange.stop);
        if (data.length < 1)
            return


        //trim empty data at the beginning
        let sliceStart = 0;
        data.sort((a, b) => a.date - b.date);
        for (const item of data) {
            if (item.number <= 0) {
                sliceStart += 1;
            } else {
                break
            }
        }
        if (sliceStart > 0) {
            data = data.slice(sliceStart, data.length)
        }

        const viewWidth = (width - leftMargin - rightMargin)
        const barWidth = Math.min(70, viewWidth / (data.length));
        const xCorrection = Math.max(0, (viewWidth - data.length * barWidth) / 2);

        const [vMin, vMax] = d3.extent(data.map(d => d.number));
        const [dateMin, dateMax] = d3.extent(data.map(d => d.date));

        const yScale = d3.scaleLinear()
            .domain([0, vMax])
            .range([2, height - topMargin - bottomMargin]);

        const xScale = d3.scaleLinear()
            .domain([dateMin, dateMax])
            .range([xCorrection + leftMargin, width - rightMargin - barWidth])

        const makeItem = (d, idx) => {
            const h = yScale(d.number);
            const entry = {
                timestamp: d.dateOfSleep,
                sleepScore: d.number,
                height: h,
                x: xScale(d.date),
                y: height - bottomMargin - h,
                color: sleepScoreColorScale(d.number),
                dateString: d.dateOfSLeep
            }
            return entry;
        }

        const items = data.map(makeItem);
        const bars = svg.selectAll('.bars').data(items, d => d.timestamp);
        bars.enter()
            .append('rect').attr('class', 'bars')
            .merge(bars)
            .attr('width', barWidth)
            .attr('y', d => d.y)
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('rx', barWidth / 3).attr('ry', barWidth / 3)
            .attr('opacity', .8)
            .transition(100)
            .attr('x', d => d.x)
            .attr('height', d => d.height)
            .attr('fill', d => d.color);

        bars.exit().remove();

        const timeLabels = svg.selectAll('.timeLabel').data(items, d => d.timestamp);
        timeLabels.enter()
            .append('text').attr('class','timeLabel')
            .merge(timeLabels)
            .attr('x',d=> d.x + (barWidth/2))
            .attr('text-anchor','middle')
            .attr('dominant-baseline','middle')
            .attr('y', height-bottomMargin/2)
            .attr('font-size',12)
            .text(d => d.timestamp.slice(5,d.timestamp.length));
        timeLabels.exit().remove();

        const annotationSize = Math.min(18,barWidth/3)
        function getAnnotationY(d){
            let tempY = d.y + annotationSize;
            if(tempY > height - 2*bottomMargin - annotationSize){
                tempY = d.y - 1 - annotationSize/2;
            }
            return tempY
        }
        const valueLabels = svg.selectAll('.valueLabel').data(items, d => d.timestamp);
        valueLabels.enter()
            .append('text').attr('class','valueLabel')
            .merge(valueLabels)
            .transition(100)
            .attr('x',d=> d.x + (barWidth/2))
            .attr('text-anchor','middle')
            .attr('dominant-baseline','middle')
            .attr('y', getAnnotationY)
            .attr('font-size',annotationSize)
            .text(d => d.sleepScore);
        valueLabels.exit().remove();
    }, [svg, props.sleepData,props.dateRange]);

    return (
        <div
            className={"d3-component"}
            style={{ 'height': '90%', 'width': '99%' }}
            ref={d3Container}
        ></div>
    );
}