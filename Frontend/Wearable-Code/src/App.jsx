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

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem("Option 1", "1", <PieChartOutlined />),
  getItem("Option 2", "2", <DesktopOutlined />),
  getItem("User", "sub1", <UserOutlined />, [
    getItem("Tom", "3"),
    getItem("Bill", "4"),
    getItem("Alex", "5"),
  ]),
  getItem("Team", "sub2", <TeamOutlined />, [
    getItem("Team 1", "6"),
    getItem("Team 2", "8"),
  ]),
  getItem("Files", "9", <FileOutlined />),
];

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div className="demo-logo-vertical" />
        <Title>Patient Reported Outcome</Title>
        <Title className="pb-0">Patient’s ID</Title>
        <SubTitle>Patient’s Data</SubTitle>
        <InfoItem>
          <Label>First Name</Label>
          <Value>Nasibeh</Value>
        </InfoItem>
        <InfoItem>
          <Label> Last Name</Label>
          <Value> Heshmati</Value>
        </InfoItem>
        <InfoItem>
          <Label>Sex</Label>
          <Value>Female</Value>
        </InfoItem>
        <InfoItem>
          <Label>Age</Label>
          <Value>29</Value>
        </InfoItem>
        <InfoItem>
          <Label>Current BMI</Label>
          <Value> 20.0</Value>
        </InfoItem>
        <InfoItem>
          <Label> Current Weight</Label>
          <Value> 115 lbs</Value>
        </InfoItem>
        <InfoItem>
          <Label> Height</Label>
          <Value> 5.31 ft</Value>
        </InfoItem>
        <Title className="mt-8">Treatment Information</Title>
      </Sider>
      <Layout>
        <Content>
          <WithingsCharts />
          <SleepLogsCharts />
          <SleepStepsChart />
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
