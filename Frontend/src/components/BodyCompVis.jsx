import {useEffect, useRef,useCallback} from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';

const accessors = {
    'fat_mass_weight': 'fatMassWeight',
    'bone_mass': 'bone',
    'fat_ratio': 'fatRatio',
    'muscle_mass': 'muscle',
    'weight': 'weight'
}

const colorDict = {
    'fat_mass_weight': '#e41a1c',
    'weight': '#377eb8',
    'bone_mass': 'grey',
    'muscle_mass': '#4daf4a',
}
export default function BodyCompVis(props){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const leftMargin = 4;
    const rightMargin = 4;
    const topMargin = 4;
    const bottomMargin = 14;

    const filterDates = useCallback((data) => {
        if(props.dateRange.start !== null)
            data = data.filter(d => d.date >= props.dateRange.start );
        if(props.dateRange.stop !== null)
            data = data.filter(d => d.date <= props.dateRange.stop);
        return data
    }, [props.dateRange])

    useEffect(()=>{
        if(props.withingsData === null || svg === undefined || props.dateRange === undefined){ return }
        const dotSize = Math.min(20, width/(4*props.withingsData.weight.length),rightMargin,leftMargin);
        console.log("Withings data",props.withingsData);
        const hSquared = props.withingsData.height;
        const useFilter = props.useFilter? props.useFilter : false;
        const xDomain = useFilter? [props.dateRange.start,props.dateRange.stop]: d3.extent(props.withingsData.weight.map(d=>d.date))
        const xScale = d3.scaleLinear()
            .domain(xDomain)
            .range([leftMargin,width-rightMargin]);

        const weightMax = d3.max(props.withingsData.weight.map(d=>d.weight/hSquared));
        const yScale = d3.scaleLinear()
            .domain([0,weightMax])
            .range([height-bottomMargin-dotSize,topMargin+dotSize])
        
        
        console.log('dot size',dotSize)
        function drawLine(key){
            const accessor = accessors[key];
            const data = useFilter? filterDates(props.withingsData[key]): props.withingsData[key];
            const color = colorDict[key]? colorDict[key]:'black';
            const linePoints = [];
            const items = []
            data.forEach((d) => {
                const tempX = xScale(d.date);
                const tempY = yScale(d[accessor]/hSquared)
                const entry = {
                    x: tempX,
                    value: d[accessor]/hSquared,
                    y: tempY,
                    ...d,
                }
                items.push(entry);
                linePoints.push([tempX,tempY])
            })
            console.log("here items",items)

            svg.select('.'+key+'path').remove();
            svg.append('path')
                .attr('class',key+'path')
                .attr('d', d3.line()(linePoints))
                .attr('fill','none')
                .attr('stroke',color)
                .attr('stroke-width',dotSize/2);

            const dots = svg.selectAll('.dots'+key).data(items, d => d.date);
            dots.enter().append('circle')
                .attr('class','dots'+key)
                .merge(dots)
                
                .transition(100)
                .attr('cy',d=>d.y)
                .attr('cx',d=>d.x)
                .attr('r', dotSize)
                .attr('fill','none')
                .attr('stroke',color)
                .attr('stroke-width',dotSize/2);
            dots.exit().remove();
        }
         
        ['bone_mass','fat_mass_weight','muscle_mass','weight'].map(drawLine)
        
    },[svg,props.withingsData,filterDates,props.useFilter]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}