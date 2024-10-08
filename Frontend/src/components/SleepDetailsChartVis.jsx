import { useEffect, useRef,useMemo } from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import { dayInMs } from '../utils';
import { filterDates } from '../utils';

const colorMap = {
    'rem':'#b3cde3',
    'light': '#8c96c6',
    'deep': '#88419d',
    'wake': '#fdbe85',
}
const orderedSleepLevels = ['deep','light','rem','wake'];
export default function SleepDetailsChartVis(props) {

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const leftMargin = 4;
    const rightMargin = 4;
    const topMargin = 4;
    const bottomMargin = 14;

    useEffect(() => {
        if (props.sleepData === null || svg === undefined || props.dateRange === undefined) { return }
        const data = filterDates(props.sleepData, props.dateRange.start, props.dateRange.stop, 'date')
        
        if (data.length < 1)
            return
        console.log('data',data,dayInMs)

        const viewWidth = (width - leftMargin - rightMargin)
        const [vMin, vMax] = d3.extent(data.map(d => d.timeInBed));
        const [dateMin, dateMax] = [props.dateRange.start,props.dateRange.stop];//d3.extent(data.map(d => d.date));
        const barWidth = (width-leftMargin-rightMargin)/(1+(dateMax-dateMin)/(dayInMs))//Math.min(70, viewWidth / (data.length));
        const xCorrection = 0//Math.max(0, (viewWidth - data.length * barWidth) / 2);

        const yScale = d3.scaleLinear()
            .domain([0, vMax])
            .range([2, height - topMargin - bottomMargin]);

        const xScale = d3.scaleLinear()
            .domain([dateMin,dateMax])
            .range([xCorrection + leftMargin, width - rightMargin - barWidth])


        const items = []
        for(const day of data){
            if(!day.isMainSleep){continue}
            const subEntry = {
                date: day.date,
                x: xScale(day.date),
                dateString: day.dateOfSleep,
            }
            let currY = height-bottomMargin;
            for(const level of orderedSleepLevels){
                const entry = Object.assign({level: level, color: colorMap[level]? colorMap[level]:'black'}, subEntry);
                const minutes = day.levels.summary[level].minutes;
                const h = yScale(minutes);
                entry.height = h;
                currY = currY - h;
                entry.y = currY;
                entry.minutes=minutes;
                items.push(entry);
            }
        
        }


        const bars = svg.selectAll('.sleepBars').data(items, d => d.date + d.level);
        bars.enter()
            .append('rect').attr('class', 'sleepBars')
            .merge(bars)
            .attr('width', barWidth)
            .attr('y', d => d.y)
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('rx', barWidth / 6).attr('ry', barWidth / 6)
            .attr('opacity', .8)
            .transition(100)
            .attr('x', d => d.x)
            .attr('height', d => d.height)
            .attr('fill', d => d.color);

        bars.exit().remove();

        const timeLabels = svg.selectAll('.sleepTimeLabel').data(items.filter(d=>d.level==='deep'), d => d.date + d.level);
        timeLabels.enter()
            .append('text').attr('class','sleepTimeLabel')
            .merge(timeLabels)
            .attr('x',d=> d.x + (barWidth/2))
            .attr('text-anchor','middle')
            .attr('dominant-baseline','middle')
            .attr('y', height-bottomMargin/2)
            .attr('font-size',12)
            .text(d => d.dateString.slice(5,d.dateString.length));
        timeLabels.exit().remove();

        const annotationSize = Math.min(18,barWidth/3)
        function getAnnotationY(d){
            let tempY = d.y + d.height/2;
            return tempY
        }

        const valueLabels = svg.selectAll('.valueLabel').data(items, d => d.date + d.level);
        valueLabels.enter()
            .append('text').attr('class','valueLabel')
            .merge(valueLabels)
            .transition(100)
            .attr('x',d=> d.x + (barWidth/2))
            .attr('text-anchor','middle')
            .attr('dominant-baseline','middle')
            .attr('y', getAnnotationY)
            .attr('font-size',d=> Math.min(d.height,annotationSize))
            .text(d => d.height > 8? d.minutes:'');
        valueLabels.exit().remove();

        svg.selectAll('text').raise();
    }, [svg, props.sleepData,props.dateRange]);

    return (
        <div
            className={"d3-component"}
            style={{ 'height': '90%', 'width': '99%' }}
            ref={d3Container}
        ></div>
    );
}