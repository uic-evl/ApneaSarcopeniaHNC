import { useEffect, useState } from "react";
import {
  Button,
  Menu,
  Breadcrumb,
  Layout,
  theme,
  Flex,
  Radio,
  DatePicker,
  Card,
  Typography,
} from "antd";
import tw from "tailwind-styled-components";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

// features
// import LineChart from "@features/lineChart";

// components
import SleepStagesChart from "@src/components/SleepStagesChart";
import SleepStepsChart from "@src/components/SleepStepsChart";
import ActivitySummary from "@src/components/ActivitySummary";
import DayAnalysis from "@src/components/DayAnalysis";
import WithingsCharts from "@src/components/WithingsChart";
import DailySleepStagesChart from "@src/components/DailySleepStagesChart";
import SleepLogsCharts from "@src/components/SleepLogsCharts";

// fake data
// import weeklyBMI from "@src/assets/data/weeklyBMI.json";
// import monthlyBMI from "@src/assets/data/monthlyBMI.json";
// import multi from "@src/assets/data/multi.json";
// import weeklySleep from "@src/assets/data/weeklySleep.json";
// import monthlySleep from "@src/assets/data/monthlySleep.json";
// import daySleep from "@src/assets/data/daySleep.json";
// import monthlySleepScoreAndSteps from "@src/assets/data/monthlySleepScoreAndSteps.json";

const { Header, Content, Footer, Sider } = Layout;

import {WithingsAPI,FitbitAPI} from './service/API.js';

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

function capitalizeFirstLetter(string) {
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function calcBMI(height,weight,heightUnit,weightUnit){
  //unit considerations https://dev.fitbit.com/build/reference/web-api/developer-guide/application-design/#Localization
  if (heightUnit === 'en_US') {
    height = height*.0254;
  }
  if (weightUnit === 'en_US'){
    weight = weight*.4535924;
  } else if (weightUnit === 'en_GB') {
    weight = weight*6350293;
  }
  var BMI = Math.round(weight / Math.pow(height, 2) );
  return BMI;
}

function inchesToFeetString(height){
  if (height === undefined || height === ''){ return '0'}
  const ft = Math.round(height/12);
  const inch = height - (12*ft);
  return ft.toFixed() + "'" + inch.toFixed() + '"';
}

// const items = [
//   getItem("Option 1", "1", <PieChartOutlined />),
//   getItem("Option 2", "2", <DesktopOutlined />),
//   getItem("User", "sub1", <UserOutlined />, [
//     getItem("Tom", "3"),
//     getItem("Bill", "4"),
//     getItem("Alex", "5"),
//   ]),
//   getItem("Team", "sub2", <TeamOutlined />, [
//     getItem("Team 1", "6"),
//     getItem("Team 2", "8"),
//   ]),
//   getItem("Files", "9", <FileOutlined />),
// ];

export default function Vis() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const fitbitAPI = new FitbitAPI('fitbit-token');
  const withingsAPI = new WithingsAPI('whithings-token');

  const [monthRange,setMonthRange] = useState(3);

  const [fitbitProfile, setFitbitProfile] = useState();
  const [bmi, setBMI] = useState(0);

  const [withingsData,setWithingsData] = useState();
  const [withingsError, setWithingsError] = useState(null);
  const [dateWindow,setDateWindow] = useState();

  const [sleepData,setSleepData]= useState(null);
  const [stepsData,setStepsData] = useState(null);
  const [spo2Data, setSpo2Data] = useState(null);
  const [hrData, setHRData] = useState(null);

  const [sleepError,setSleepError] = useState();
  const [stepsError, setStepsError] = useState();
  const [spo2Error, setSpo2Error] = useState();
  const [hrError, setHRError] = useState();

  let withingsLoading = false;
  let fibitLoading = false;
  let sleepLoading = false;
  let stepsLoading = false;
  let spo2Loading = false;
  let hrLoading = false;

  async function fetchProfile(){
    if (fitbitProfile === undefined) {
      const data = await fitbitAPI.fetchFitbitProfile();
      // console.log('data fetched',data.user);
      setFitbitProfile(data.user);
      if (data && data !== null) {
        //relevant data: age, gender, sfullName, weight, weightUnit
        setFitbitProfile(data.user);
        
      }
    }
  }

  async function getSPO2(months){
    if(spo2Loading){ return }
    try{
      spo2Loading = true;
      const tempSPO2 = await fitbitAPI.getSPO2Since(months);
      console.log('spo2',tempSPO2);
      setSpo2Data(tempSPO2);
      setSpo2Error(undefined);
      spo2Loading = false
    } catch(error){
      setSpo2Error(error);
    } finally{
      spo2Loading =false;
    }
  }

  async function getSleep(months){
    if(sleepLoading){return}
    try{
      sleepLoading = true;
      const tempSleep = await fitbitAPI.getSleepSince(months);
      console.log('sleep',tempSleep);
      setSleepData(tempSleep);
      setSleepError(undefined);
      sleepLoading=false;
    }  catch(error){
      setSleepError(error);
    } finally {
      sleepLoading = false;
    }

  }

  async function getSteps(months){
    if(stepsLoading){return}
    try{
      stepsLoading = true;
      const temp = await fitbitAPI.getStepsSince(months);
      console.log('steps',temp)
      setStepsData(temp);
      setStepsError(undefined);
      stepsLoading = false;
    }  catch(error){
      setStepsError(error);
    } finally{
      stepsLoading = false;
    }
  }

  async function getHR(months){
    if(hrLoading){ return; }
    try {
      hrLoading = true;
      const temp = await fitbitAPI.getHRSince(months);
      console.log('hr',temp)
      setHRData(temp);
      setHRError(undefined);
      hrLoading = false;
    }  catch(error){
      setHRError(error);
    } finally{
      hrLoading = false;
    }
  }

  async function getWithings(){
    if(withingsLoading){
      return;
    }
    withingsLoading = true;

    try {
        const results = await withingsAPI.fetchWithingsBatchEntry(['weight','height','bone_mass','fat_ratio','muscle_mass','fat_mass_weight']);
        console.log('withings results',results);
        withingsLoading = false;
        setWithingsData(results);
        setWithingsError(null);
    } catch(error){
      setWithingsError(error.message);
    }finally {
      withingsLoading=false;
    }
  };

  

  useEffect(()=>{
    fetchProfile();
    getWithings(withingsAPI);
  },[]);

  useEffect(()=>{
    getHR(monthRange);
    getSteps(monthRange);
    getSPO2(monthRange);
    getSleep(monthRange);
  },[monthRange])

  useEffect(()=>{
    if(fitbitProfile){
      const height = fitbitProfile['height'];
      const weight = fitbitProfile['weight'];
      if (height && weight) {
        const beemeye = calcBMI(height,weight,fitbitProfile['heightUnit'],fitbitProfile['weightUnit'])
        setBMI(beemeye);
      } else {
        console.log('error in bmi',height,weight,fitbitProfile);
        setBMI(0);
      }
    } else{
      setBMI(0);
    }
    
  },[fitbitProfile]);

  function notUndefined(obj,key){
    if(obj === undefined){ return 'Missing' }
    return obj[key]? obj[key] : 'Invalid Key'
  }

  function logOut(){
    fitbitAPI.resetToken();
    withingsAPI.resetToken();
    fitbitAPI.goToLogin();
  }


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div className="demo-logo-vertical" />
        <Title>Patient Reported Outcome</Title>
        <Title className="pb-0">{notUndefined(fitbitProfile,'fullName')}</Title>
        {/* <SubTitle>Patient’s Data</SubTitle> */}
        <InfoItem>
          <Label>Gender</Label>
          <Value>{capitalizeFirstLetter(notUndefined(fitbitProfile,'gender'))}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Age</Label>
          <Value>{notUndefined(fitbitProfile,'age')}</Value>
        </InfoItem>
        <InfoItem>
          <Label>BMI</Label>
          <Value>{bmi.toFixed(1)}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Weight</Label>
          <Value>{notUndefined(fitbitProfile,'weight')}</Value>
        </InfoItem>
        <InfoItem>
          <Label> Height</Label>
          <Value>{inchesToFeetString(notUndefined(fitbitProfile,'height'))}</Value>
        </InfoItem>
        <Title className="mt-8">Treatment Information</Title>
        <Flex align='center' justify='center'>
          <Button onClick={() => logOut()} danger>
            {'Log Out'}
          </Button>
        </Flex>
        

      </Sider>
      <Layout>
        <Content>
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
          <WithingsCharts 
            withingsData={withingsData}
            withingsError={withingsError}
          />
          
          <SleepStepsChart 
            sleepData={sleepData}
            stepsData={stepsData}
            sleepError={sleepError}
            stepsError={stepsError}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

const Wrapper = tw.div`
  h-screen
  flex
  overflow-hidden
`;

const Container = tw.div`
  bg-red-400
  min-w-[100vw]
  overflow-y-auto
`;

const Title = tw.h2`
  text-white
  text-center
  py-4
  border-t-white
  border-t
`;
const SubTitle = tw.h3`
  text-white
  py-4
  px-3
`;

const InfoItem = tw.div`
  flex
  justify-between
  px-3
  mb-2
`;

const Label = tw.div`
  text-xs
  text-gray-300
`;

const Value = tw.div`
  text-xs
  text-gray-300
`;
