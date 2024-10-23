import {useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import {filterDates,dayInMs} from '@src/utils';

export default function StepsChartVis(props){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const leftMargin = 4;
    const rightMargin = 4;
    const topMargin = 4;
    const bottomMargin = 14;

    const colorScale = useMemo(()=>{
        const scale1 = d3.scaleLinear()
            .domain([0.5*props.stepsGoal,props.stepsGoal])
            .range(['white','blue']);

        const scale2 = d3.scaleLinear()
            .domain([props.stepsGoal,1.5*props.stepsGoal])
            .range(['white','green'])
        return (v) => v < props.stepsGoal? scale1(v):scale2(v);
    },[props.stepsGoal]);

    useEffect(()=>{
        if(props.stepsData === null || svg === undefined || props.dateRange === undefined){ return }

        let data = filterDates(props.stepsData,props.dateRange.start,props.dateRange.stop);

        const viewWidth = (width - leftMargin - rightMargin);
        const [dateMin, dateMax] = [props.dateRange.start,props.dateRange.stop];//d3.extent(data.map(d => d.date));
        const barWidth = (viewWidth)/(1+(dateMax-dateMin)/(dayInMs))//Math.min(70, viewWidth / (data.length));
        const xCorrection = 0//Math.max(0, (viewWidth - data.length * barWidth) / 2);

        const [vMin,vMax] = d3.extent(data.map(d => d.number));

        const yScale = d3.scaleLinear()
            .domain([0,Math.max(vMax,1.1*props.stepsGoal)])
            .range([2,height-topMargin-bottomMargin]);

        const xScale = d3.scaleLinear()
            .domain([dateMin,dateMax])
            .range([xCorrection + leftMargin, width - rightMargin - barWidth])

        const makeItem = (d,idx) => {
            const h = yScale(d.number);
            const entry = {
                timestamp: d.dateTime,
                steps: d.number,
                height: h,
                x: xScale(d.date),
                y: height - bottomMargin - h,
                color: colorScale(d.number),
            }
            return entry;
        }

        const items = data.map(makeItem);
        const bars = svg.selectAll('.bars').data(items,d => d.timestamp);
        bars.enter()
            .append('rect').attr('class','bars')
            .merge(bars)
            .attr('width',barWidth)
            .attr('y',d=>d.y)
            .attr('stroke','black')
            .attr('stroke-width',1)
            .attr('rx',barWidth/3).attr('ry',barWidth/3)
            .transition(1000)
            .attr('x',d=>d.x)
            .attr('height',d=>d.height)
            .attr('opacity',.8)
            .attr('fill',d=>d.color);

        svg.select('.goalLine').remove();
        const yval = height - bottomMargin - yScale(props.stepsGoal)
        svg.append('path')
            .attr('class','.goalLine')
            .attr('d',d3.line()([[xScale(dateMin),yval],[xScale(dateMax),yval]]))
            .attr('fill','none')
            .attr('stroke','grey')
            .attr('opacity',.8)
            .attr('stroke-width',3)

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
        const valueLabels = svg.selectAll('.valueLabel').data(items, d => d.timestamp);
        function getAnnotationY(d){
            let tempY = d.y + annotationSize;
            if(tempY > height - 2*bottomMargin - annotationSize){
                tempY = d.y - 1 - annotationSize/2;
            }
            return tempY
        }
        valueLabels.enter()
            .append('text').attr('class','valueLabel')
            .merge(valueLabels)
            .transition(100)
            .attr('x',d=> d.x + (barWidth/2))
            .attr('text-anchor','middle')
            .attr('dominant-baseline','middle')
            .attr('y',getAnnotationY)
            .attr('font-size',annotationSize)
            .text(d => d.steps);
        valueLabels.exit().remove();
    },[svg,props.stepsData,props.dateRange,colorScale]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}