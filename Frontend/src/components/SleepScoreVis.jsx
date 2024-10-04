import { useEffect, useRef, useMemo } from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import { filterDates } from '@src/utils';
import GaugeChart from './GaugeChart';
import moment from 'moment';

export default function SleepScoreVis({ sleepData, dateRange }) {

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const sideMargin = 4;
    const topMargin = 4;
    const bottomMargin = 14;

    const avgScore = useMemo(() => {
        if (sleepData === null || dateRange===null) { return }
    
        const data = filterDates(
            sleepData.map(d => {return {...d,date: moment(d.dateOfSleep).unix() * 1000}}),
            dateRange.start,
            dateRange.stop
        )
        function getScore(d) {
            return d.efficiency/100;
        }

        var totalScore = 0;
        var scoreCount = 0;
        sleepData.forEach(d => {
            const s = getScore(d);
            if (s > 0) {
                totalScore += s;
                scoreCount += 1;
            }
        })

        const avgScore = scoreCount ? totalScore / scoreCount : 0;

        return avgScore
    }, [dateRange, sleepData]);



    return (
        <div
            style={{ 'height': '100%', 'width': '100%' }}
        >
            <GaugeChart score={avgScore} />
        </div>
    );
}