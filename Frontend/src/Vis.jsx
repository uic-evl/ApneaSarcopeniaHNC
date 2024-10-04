import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Layout,
  theme,
  Card,
  Row,
  Col,
  Flex,
  Radio,
  Typography,
} from "antd";

import tw from "tailwind-styled-components";

const { Title, Text } = Typography
import moment from "moment";
// features
// import LineChart from "@features/lineChart";

// components

import SleepLogsCharts from "@src/components/SleepLogsCharts";

import SleepScoreChartVis from "./components/SleepScoreChartVis.jsx";
import ActivityContainer from "./components/ActivityContainer.jsx";
import BodyCompVis from "./components/BodyCompVis.jsx";
import BodyCompScatterVis from "./components/BodyCompScatterVis.jsx";
import ActivityScoreVis from "./components/ActivityScoreVis.jsx";
import SleepScoreVis from "./components/SleepScoreVis.jsx";


import { WithingsAPI, FitbitAPI } from './service/API.js';

const activitesToFetch = [
  'calories', 'activityCalories',
  'minutesSedentary',
  'minutesLightlyActive', 'minutesFairlyActive', 'minutesVeryActive'
]


function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

import DateSelector from "./components/DateSelector.jsx";

import { nowTimestamp, convertTimestampToDateString, dayToTimestamp } from "./utils/index.js";

function capitalizeFirstLetter(string) {
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function weightUnitString(weightUnit) {
  if (weightUnit === 'en_US') {
    return 'lb'
  }
  if (weightUnit === 'en_US') {
    return 'Stone'
  }
  if (weightUnit === undefined) {
    return '<Units Missing>'
  }
  return 'Kg'
}

function calcBMI(height, weight, heightUnit, weightUnit) {
  //unit considerations https://dev.fitbit.com/build/reference/web-api/developer-guide/application-design/#Localization
  if (heightUnit === 'en_US') {
    height = height * .0254;
  }
  if (weightUnit === 'en_US') {
    weight = weight * .4535924;
  } else if (weightUnit === 'en_GB') {
    weight = weight * 6350293;
  }
  var BMI = Math.round(weight / Math.pow(height, 2));
  return BMI;
}

function inchesToFeetString(height) {
  if (height === undefined || height === '') { return '0' }
  const ft = Math.round(height / 12);
  const inch = height - (12 * ft);
  return ft.toFixed() + "'" + inch.toFixed() + '"';
}

export default function Vis() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const fitbitAPI = new FitbitAPI('fitbit-token');
  const withingsAPI = new WithingsAPI('whithings-token');

  //for fitbit data requests from today in months. Max is 100 days (~3.3 months). 
  //Todo: maybe figure out how to do longer data periods? 
  const [monthRange, setMonthRange] = useState(3.1);

  const [fitbitProfile, setFitbitProfile] = useState(loadFromSession('fitbitProfile'));
  const [bmi, setBMI] = useState(0);

  const [withingsData, setWithingsData] = useState(loadFromSession('withingsData'));
  const [withingsError, setWithingsError] = useState(null);
  const [goalsDaily, setgoalsDaily] = useState(loadFromSession('goalsDaily'));
  const [dateWindow, setDateWindow] = useState();

  const [sleepData, setSleepData] = useState(loadFromSession('sleepData'));
  const [stepsData, setStepsData] = useState(loadFromSession('stepsData'));
  const [spo2Data, setSpo2Data] = useState(loadFromSession('spo2Data'));
  const [hrData, setHRData] = useState(loadFromSession('hrData'));
  const [activityData, setActivityData] = useState(loadFromSession('activityData'));

  const [sleepError, setSleepError] = useState();
  const [stepsError, setStepsError] = useState();
  const [spo2Error, setSpo2Error] = useState();
  const [hrError, setHRError] = useState();

  const [dateRange, setDateRange] = useState({ stop: nowTimestamp(), start: dayToTimestamp(moment().subtract(21, "days")) });

  const [useFilter, setUseFilter] = useState(true)



  function savetoSession(item, name) {
    if (item !== undefined && item !== null) {
      sessionStorage.setItem(name, JSON.stringify(item))
    }
  }

  function loadFromSession(name) {
    const res = sessionStorage.getItem(name);
    // console.log('load', name, res)
    if (res === null || res === '') {
      return null
    }
    return JSON.parse(res);

  }

  let withingsLoading = false;
  let fitbitLoading = false;
  let sleepLoading = false;
  let stepsLoading = false;
  let spo2Loading = false;
  let hrLoading = false;
  let stepGoalsLoading = false;
  let activityLoading = false;

  async function fetchProfile() {
    if (fitbitProfile === null) {
      if (fitbitLoading) { return }
      fitbitLoading = true;
      const data = await fitbitAPI.fetchFitbitProfile();
      // console.log('data fetched',data.user);
      if (data && data !== null) {
        //relevant data: age, gender, sfullName, weight, weightUnit
        setFitbitProfile(data.user);
      }
      fitbitLoading = true;
    }
  }

  async function fetchStepsGoals() {
    if (stepGoalsLoading) { return }
    stepGoalsLoading = true;
    const data = await fitbitAPI.fetchStepsGoal();
    if (data && data !== null) {
      setgoalsDaily(data.goals);
    }
  }

  async function getActivity(months) {
    if (activityLoading) { return }
    try {
      activityLoading = true;
      let res = {}
      for (let key of activitesToFetch) {
        const temp = await fitbitAPI.getActivitySince(key, months);
        res[key] = temp
      }
      console.log('activities', res);
      setActivityData(res)
      activityLoading = false
    } catch (error) {
      console.log('activity error', error.message)
    } finally {
      activityLoading = false;
    }
  }


  async function getSPO2(months) {
    if (spo2Loading) { return }
    try {
      spo2Loading = true;
      const tempSPO2 = await fitbitAPI.getSPO2Since(months);
      console.log('spo2', tempSPO2);
      setSpo2Data(tempSPO2);
      setSpo2Error(undefined);
      spo2Loading = false
    } catch (error) {
      setSpo2Error(error);
    } finally {
      spo2Loading = false;
    }
  }

  async function getSleep(months) {
    console.log('calling sleep thing',sleepLoading)
    if (sleepLoading) { return }
    try {
      sleepLoading = true;
      const tempSleep = await fitbitAPI.getSleepSince(months);
      console.log('sleep', tempSleep);
      setSleepData(tempSleep);
      setSleepError(undefined);
      sleepLoading = false;
    } catch (error) {
      setSleepError(error);
    } finally {
      sleepLoading = false;
    }

  }

  async function getSteps(months) {
    if (stepsLoading) { return }
    try {
      stepsLoading = true;
      const temp = await fitbitAPI.getStepsSince(months);
      console.log('steps', temp)
      setStepsData(temp);
      setStepsError(undefined);
      stepsLoading = false;
    } catch (error) {
      setStepsError(error);
    } finally {
      stepsLoading = false;
    }
  }

  async function getHR(months) {
    if (hrLoading) { return; }
    try {
      hrLoading = true;
      const temp = await fitbitAPI.getHRSince(months);
      console.log('hr', temp)
      setHRData(temp);
      setHRError(undefined);
      hrLoading = false;
    } catch (error) {
      setHRError(error);
    } finally {
      hrLoading = false;
    }
  }

  async function getWithings() {
    if (withingsLoading) {
      return;
    }
    withingsLoading = true;

    try {
      const results = await withingsAPI.fetchWithingsBatchEntry(['weight', 'height', 'bone_mass', 'fat_ratio', 'muscle_mass', 'fat_mass_weight']);
      console.log('withings results', results);
      withingsLoading = false;
      setWithingsData(results);
      setWithingsError(null);
    } catch (error) {
      setWithingsError(error.message);
    } finally {
      withingsLoading = false;
    }
  };


  async function reloadData(months) {
    for (const key of ['fitbitProfile', 'withingsData', 'stepsData', 'sleepData', 'hrData', 'spo2Data', 'activityData']) {
      sessionStorage.removeItem(key);
    }
    await fitbitAPI.refreshFitbitToken();
    fetchProfile();
    getHR(months);
    getSteps(months);
    getSPO2(months);
    getSleep(months);
    getActivity(monthRange);
    getWithings();
  }

  useEffect(() => {
    if (fitbitProfile === null)
      fetchProfile();

    if (withingsData === null)
      getWithings();

    if (goalsDaily === null)
      fetchStepsGoals();

  }, []);

  useEffect(() => {
    if (hrData === null)
      getHR(monthRange);
    if (stepsData === null)
      getSteps(monthRange);
    if (spo2Data === null)
      getSPO2(monthRange);
    if (sleepData === null)
      getSleep(monthRange);
    if (activityData === null)
      getActivity(monthRange);
  }, [monthRange])

  useEffect(() => {
    savetoSession(fitbitProfile, 'fitbitProfile')
  }, [fitbitProfile])

  useEffect(() => {
    savetoSession(sleepData, 'sleepData');
  }, [sleepData])

  useEffect(() => {
    savetoSession(stepsData, 'stepsData');
  }, [stepsData])

  useEffect(() => {
    savetoSession(spo2Data, 'spo2Data');
  }, [spo2Data])

  useEffect(() => {
    savetoSession(hrData, 'hrData')
  }, [hrData])

  useEffect(() => {
    savetoSession(withingsData, 'withingsData')
  }, [withingsData])

  useEffect(() => {
    savetoSession(goalsDaily, 'goalsDaily');
  }, [goalsDaily]);

  useEffect(() => {
    savetoSession(activityData, 'activityData')
  }, [activityData])

  useEffect(() => {
    if (fitbitProfile !== null) {
      console.log('profile', fitbitProfile)
      const height = fitbitProfile['height'];
      const weight = fitbitProfile['weight'];
      if (height && weight) {
        const beemeye = calcBMI(height, weight, fitbitProfile['heightUnit'], fitbitProfile['weightUnit'])
        setBMI(beemeye);
      } else {
        console.log('error in bmi', height, weight, fitbitProfile);
        setBMI(0);
      }
    } else {
      setBMI(0);
    }

  }, [fitbitProfile]);

  //calculate bmi, fmi and lmi (using nasibehs forumla so idk) with the withings data, 
  //returns a list of objects iwth bmi, fmi, and lmi, along with date: time since epoch in ms? and formattedDate: YYYY-MM-DD hh:mm:ss
  //if times dont sync for a necessary variable, returns a -1
  const bodyCompData = useMemo(() => {
    if (withingsData === null) { return null }
    const height = withingsData.height;//meters;
    const timeDict = {}
    for (const key of Object.keys(withingsData)) {
      if (key === 'height') { continue; }
      let vals = withingsData[key];

      if (vals === undefined || !vals.length) {
        console.log('missing', key, 'from activity');
        continue
      }
      for (const val of vals) {
        const date = val.date;
        const entry = timeDict[date] ? timeDict[date] : {}
        entry[key] = val;
        timeDict[date] = entry
      }
    }
    const heightSquared = height ** height;
    let tempData = [];
    for (const [key, val] of Object.entries(timeDict)) {
      const ref = val.weight;
      const entry = {
        date: ref.date,
        formattedDate: ref.formattedDate,
      };
      entry.bmi = val.weight ? val.weight.weight / heightSquared : -1;
      entry.fmi = val.fat_mass_weight ? val.fat_mass_weight.fatMassWeight / heightSquared : -1;
      entry.lmi = val.weight && val.fat_ratio ? (val.weight.weight * (1 - (val.fat_ratio.fatRatio / 100))) / heightSquared : -1;
      tempData.push(entry)
    }
    return tempData
  }, [withingsData]);

  function notUndefined(obj, key) {
    if (obj === undefined || obj === null) { return 'Missing' }
    return obj[key] ? obj[key] : 'Invalid Key'
  }

  function logOut() {
    fitbitAPI.resetToken();
    withingsAPI.resetToken();
    fitbitAPI.goToLogin();
  }



  function CardWraper(leftElement, rightElement, leftTitle = '', rightTitle = '', height = '10em') {
    const titleStyle = { width: '100%', height: '1.5em', fontSize: '1.1em', fontWeight: 'bold' };
    const leftStyle = { width: '100%', height: 'calc(100% - 1.6em)' }
    const rightStyle = leftStyle
    return (
      <div className="mx-6 mt-1 text-center p-1 shadow" style={{ width: '100%' }}>
        {/* <Flex align="center" justify="center" style={{ width: '100%', margin: '0px', height: '1.1em', fontSize: '1em', fontWeight: 'bold' }}>
          {title}
        </Flex> */}
        <Flex align="center" justify="space-between" style={{ height: height, width: '100%', margin: '0px', padding: '0px' }}>
          <div className='shadow m-0 p-0 border-h-2' style={{ width: '20vw', height: '100%' }}>
            <div className='m-0 p-0 border-b-2 text-center' style={titleStyle}>
              {leftTitle}
            </div>
            <div className='m-0 p-0' style={leftStyle}>
              {leftElement}
            </div>
          </div>
          <div className='shadow m-0 p-0' style={{ width: 'calc(100% - 20vw)', height: '100%' }}>
            <div className='m-0 p-0 border-b-2 text-center' style={titleStyle}>
              {rightTitle}
            </div>
            <div className='m-0 p-0' style={rightStyle}>
              {rightElement}
            </div>
          </div>
        </Flex>
      </div>
    )
  }
  const rightCharts = [
    <BodyCompVis
      gender={fitbitProfile ? fitbitProfile['gender'] : null}
      withingsData={withingsData}
      dateRange={dateRange}
      useFilter={useFilter}
    />,
    <SleepScoreChartVis
      key={'sleep1'}
      sleepData={sleepData}
      dateRange={dateRange}
    />,
    <ActivityContainer
      activityData={activityData}
      dateRange={dateRange}
      stepsData={stepsData}
      goalsDaily={goalsDaily}
    />,
  ]
  const rightChartTitles = ['Body Comp Over Time', 'Sleep', 'Activity']

  const leftCharts = [
    <BodyCompScatterVis
      gender={fitbitProfile ? fitbitProfile['gender'] : null}
      bodyCompData={bodyCompData}
      dateRange={dateRange}
      useFilter={useFilter}
    />,
    <SleepScoreVis
      sleepData={sleepData}
      dateRange={dateRange}
    />,
    <ActivityScoreVis
      activityData={activityData}
      goalsDaily={goalsDaily}
      stepsData={stepsData}
      dateRange={dateRange}
    />,
  ]

  const chartHeights = [
    '16em',
    '12em',
    '15em',
  ]

  const leftChartTitles = ['Body Comp', 'Mean Sleep Efficiency', 'Activity Goal Completion']


  return (
    <Row span={24} style={{ height: "100vh", width: '100vw' }}>
      <Col className={'shadow mx-2 mt-4'} span={4}>
        <div />
        <Title level={3}>Patient Reported Outcome</Title>
        <Title level={4}>{notUndefined(fitbitProfile, 'fullName')}</Title>
        <Title level={5}>{`Gender: ${capitalizeFirstLetter(notUndefined(fitbitProfile, 'gender'))}`}</Title>
        <Title level={5}>{`Age: ${notUndefined(fitbitProfile, 'age')}`}</Title>
        <Title level={5}>{`Height: ${inchesToFeetString(notUndefined(fitbitProfile, 'height'))}`}</Title>
        <Title level={5}>{`Weight (Fitbit): ${notUndefined(fitbitProfile, 'weight') + weightUnitString(notUndefined(fitbitProfile, 'weightUnit'))}`}</Title>
        <Title level={5}>{`Sleep Tracking Setting: ${notUndefined(fitbitProfile, 'sleepTracking')}`}</Title>
        <Flex align='center' justify='center'>
          <Button onClick={() => logOut()} danger>
            {'Log Out'}
          </Button>
        </Flex>
        <Flex align='center' justify='center'>
          <Button onClick={() => reloadData(monthRange)} color={"default"} variant={"solid"}>
            {'Reload Data'}
          </Button>
        </Flex>
      </Col>
      <Col span={19}>

        <Row span={24}>

          <Col span={24}>
            <DateSelector
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            {rightCharts.map((c, i) => CardWraper(leftCharts[i], c, leftChartTitles[i], rightChartTitles[i], chartHeights[i]))}
            <SleepLogsCharts
              sleepData={sleepData}
              stepsData={stepsData}
              hrData={hrData}
              spo2Data={spo2Data}
              sleepError={sleepError}
              stepsError={stepsError}
              hrError={hrError}
              spo2Error={spo2Error}
            />
          </Col>
        </Row>
      </Col>

    </Row >
  );
}