import { useEffect, useRef,useMemo } from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import { filterDates } from '@src/utils';

function makeScale(targetMinutes){
    return d3.scaleLinear()
        .domain([0,targetMinutes])
        .range(['white','green'])
}
const activityColorScales = {
    'totalActivity': makeScale(120),
    'minutesFairlyActive': makeScale(60),
    'minutesLightlyActive': makeScale(45),
    'minutesVeryActive': makeScale(15),
    'activityCalories': makeScale(1000)
}
export default function ActivityChartVis(props) {

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const leftMargin = 4;
    const rightMargin = 4;
    const topMargin = 4;
    const bottomMargin = 14;

    const activityLevels = ['minutesFairlyActive','minutesLightlyActive','minutesVeryActive'];
    
    const formattedData = useMemo(()=>{
        if (props.activityData === null) {return}
        const timeDict = {};
        for (let key of Object.keys(props.activityData)){
            let vals = props.activityData[key];
            if(vals === undefined){
                console.log('missing',key,'from activity');
                continue
            }
            for(const val of vals){
                const date = val.date;
                const entry = timeDict[date]? timeDict[date]:{}
                entry[key] = val;
                timeDict[date] = entry
            }
        }
        let data = [];
        for(const [key,val] of Object.entries(timeDict)){
            const ref = val.minutesFairlyActive;
            const entry = {
                date: ref.date,
                dateTime: ref.dateTime,
                formattedDate: ref.formattedDate,
            };
            let totalActivity = 0;
            for(const [key2,val2] of Object.entries(val)){
                entry[key2] = val2.number;
                if(activityLevels.indexOf(key2) >= 0)
                    totalActivity += val2.number;
            }   
            entry['totalActivity'] = totalActivity;
            data.push(entry)
        }
        return data
    },[props.activityData])

    
    useEffect(() => {
        if (formattedData === undefined || formattedData === null || svg === undefined || props.dateRange === undefined) { return }
        const plotVar = props.plotVar? props.plotVar : 'totalActivity';
        let data = formattedData.map(d =>{
            return {number: d[plotVar], ...d}
        })

        data = filterDates(data, props.dateRange.start, props.dateRange.stop, 'date')
        if (data.length < 1)
            return
    
        const viewWidth = (width - leftMargin - rightMargin)
        const barWidth = Math.min(70, viewWidth / (data.length));
        const xCorrection = Math.max(0, (viewWidth - data.length * barWidth) / 2);

        const [vMin, vMax] = d3.extent(data.map(d => plotVar == 'activityCalories'? d.activityCalories:d.totalActivity));
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
                timestamp: d.date,
                activity: d.number,
                height: h,
                x: xScale(d.date),
                y: height - bottomMargin - h,
                color: activityColorScales[props.plotVar](d.number),
                dateString: d.dateTime
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
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('rx', barWidth / 3).attr('ry', barWidth / 3)
            .attr('opacity', .7)
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
            .text(d => d.dateString.slice(5,d.dateString.length));
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
            .text(d => d.activity);
        valueLabels.exit().remove();
    }, [svg, formattedData,props.dateRange,props.plotVar]);

    return (
        <div
            className={"d3-component"}
            style={{ 'height': '90%', 'width': '99%' }}
            ref={d3Container}
        ></div>
    );
}