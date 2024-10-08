import { useState } from 'react';
import SleepScoreChartVis from './SleepScoreChartVis';
import SleepDetailsChartVis from './SleepDetailsChartVis';
import SleepLevelChartVis from './SleepLevelChartVis';
import { Flex, Radio } from 'antd';



export default function SleepContainer({ sleepData, dateRange,goalsDaily,hrData,spo2Data }) {
    const [plotVar, setPlotVar] = useState('Efficiency');

    const plotActivityOptions = [
        'Efficiency', 'Levels','Details'
    ]
    const handleButtonChange = ({ target: { value } }) => {
        setPlotVar(value);
    }

    return (
        <>
            <Flex align="center" justify="center" style={{ width: '100%', margin: '0px', height: '2em' }}>
                <Radio.Group
                    options={plotActivityOptions.map(v => {
                        return { 'label': v, 'value': v }
                    })}
                    onChange={handleButtonChange}
                    value={plotVar}
                    optionType="button"
                />
            </Flex>
            <Flex align="center" justify="space-between" style={{ height: 'calc(100% - 2.1em)', width: '100%', margin: '0px' }}>
                {plotVar === 'Efficiency' ?
                    <SleepScoreChartVis
                        dateRange={dateRange}
                        sleepData={sleepData}
                    />
                    : plotVar === 'Levels'? <SleepLevelChartVis
                        sleepData={sleepData}
                        dateRange={dateRange}
                        // hrData={hrData}
                        // spo2Data={spo2Data}
                    />
                    : <SleepDetailsChartVis
                        sleepData={sleepData}
                        dateRange={dateRange}
                    />
                }
            </Flex>
        </>
    );
}