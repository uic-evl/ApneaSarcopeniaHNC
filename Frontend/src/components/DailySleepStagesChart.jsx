import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Flex, Result, Spin } from "antd";
import tw from "tailwind-styled-components";

// components
import DayAnalysis from "@src/components/DayAnalysis";

// services
import { getDailySleepLog } from "@src/service/fitbit";

const levelMapping = {
  wake: 100,
  rem: 80,
  light: 70,
  deep: 60,
};

export default function DailySleepStagesChart({ selectedItem }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sleepLog, setSleepLog] = useState([]);

  useEffect(() => {
    if (selectedItem?.time) {
      getRequests();
    }
  }, [selectedItem?.time]);

  const getRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([getDailySleepLogRequest()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDailySleepLogRequest = async () => {
    try {
      const logs = await getDailySleepLog({ date: selectedItem.time });

      if (logs === 404) {
        setSleepLog([]);
        return;
      }

      setSleepLog(logs);
    } catch (error) {
      throw new Error("Failed to fetch weight data");
    }
  };

  const convertedLogs = useMemo(() => {
    const result = [];
    const input = sleepLog;

    input.forEach((entry, index) => {
      const date = new Date(entry.dateTime);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const formattedTime = `${hours}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      if (index > 0) {
        const prevDate = new Date(input[index - 1].dateTime);
        const prevHours = prevDate.getHours();
        const prevMinutes = prevDate.getMinutes();
        const prevSeconds = prevDate.getSeconds();
        const prevFormattedTime = `${prevHours}:${prevMinutes
          .toString()
          .padStart(2, "0")}:${prevSeconds.toString().padStart(2, "0")}`;

        if (prevFormattedTime !== formattedTime) {
          result.push({
            time: prevFormattedTime,
            y: levelMapping[input[index - 1].level],
            type:
              input[index - 1].level.charAt(0).toUpperCase() +
              input[index - 1].level.slice(1),
          });
          result.push({
            time: formattedTime,
            y: levelMapping[input[index - 1].level],
            type:
              input[index - 1].level.charAt(0).toUpperCase() +
              input[index - 1].level.slice(1),
          });
        }
      }

      result.push({
        time: formattedTime,
        y: levelMapping[entry.level],
        type: entry.level.charAt(0).toUpperCase() + entry.level.slice(1),
      });
    });

    return result;
  }, [sleepLog]);

  if (loading) {
    return (
      <Spin spinning={loading} tip="Loading...">
        <Card className="relative mx-6 mt-5 h-96"></Card>
      </Spin>
    );
  }

  if (error) {
    return (
      <Card className="relative mx-6 mt-5">
        <Alert
          className="w-full"
          message="Fetch error"
          showIcon
          description={error}
          type="error"
          action={
            <Button onClick={getRequests} size="middle" danger>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  if (selectedItem === null) return null;

  if (convertedLogs.length === 0) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, No data available for this date."
        extra={null}
      />
    );
  }

  return (
    <Flex justify="center">
      <DayAnalysis data={convertedLogs} selectedItem={selectedItem} />
    </Flex>
  );
}