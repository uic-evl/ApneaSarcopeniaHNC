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
import LineChart from "@features/lineChart";

// components
import SleepStagesChart from "@src/components/SleepStagesChart";
import SleepStepsChart from "@src/components/SleepStepsChart";
import ActivitySummary from "@src/components/ActivitySummary";
import DayAnalysis from "@src/components/DayAnalysis";
import WithingsCharts from "@src/components/WithingsChart";
import DailySleepStagesChart from "@src/components/DailySleepStagesChart";
import SleepLogsCharts from "@src/components/SleepLogsCharts";

// fake data
import weeklyBMI from "@src/assets/data/weeklyBMI.json";
import monthlyBMI from "@src/assets/data/monthlyBMI.json";
import multi from "@src/assets/data/multi.json";
import weeklySleep from "@src/assets/data/weeklySleep.json";
import monthlySleep from "@src/assets/data/monthlySleep.json";
import daySleep from "@src/assets/data/daySleep.json";
import monthlySleepScoreAndSteps from "@src/assets/data/monthlySleepScoreAndSteps.json";

const { Header, Content, Footer, Sider } = Layout;

import API from './service/API.js';

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

  const api = new API('fitbit-token','whithings-token');

  const [fitbitProfile, setFitbitProfile] = useState();
  const [bmi, setBMI] = useState(0);

  async function fetchProfile(){
    if (fitbitProfile === undefined) {
      const data = await api.fetchFitbitProfile();
      console.log('data fetched',data.user);
      setFitbitProfile(data.user);
      if (data && data !== null) {
        //relevant data: age, gender, sfullName, weight, weightUnit
        setFitbitProfile(data.user);
        
      }
    }
  }

  useEffect(()=>{
    fetchProfile();
  },[]);

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
      </Sider>
      <Layout>
        <Content>
          <WithingsCharts />
          {/* <SleepLogsCharts />
          <SleepStepsChart /> */}
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
