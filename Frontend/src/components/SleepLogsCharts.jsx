import moment from "moment";
import { useState } from "react";
import { Card, Flex } from "antd";

// components
import DailySleepStagesChart from "@src/components/DailySleepStagesChart";
import SleepStagesChart from "@src/components/SleepStagesChart";

export default function SleepLogsCharts() {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemSelect = (item) => {
    setSelectedItem({
      ...item,
      time: moment(item.time, "YY MMM D").format("YYYY-MM-DD"),
    });
  };

  return (
    <Card className="mx-6 mt-5">
      <Flex justify="center">
        <SleepStagesChart onItemSelect={handleItemSelect} />
      </Flex>
      <DailySleepStagesChart selectedItem={selectedItem} />
    </Card>
  );
}