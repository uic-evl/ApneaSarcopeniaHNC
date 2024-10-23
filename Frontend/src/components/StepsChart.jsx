import {
    Alert,
    Button,
    Card,
    DatePicker,
    Flex,
    Radio,
    Result,
    Spin,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import tw from "tailwind-styled-components";

// constants
import { DATE_PERIODS } from "@src/constants";

// utils
import {
    capitalizeFirstLetter,
    convertTimestampToDateString,
    summarizeDataDaily,
    summarizeDataMonthly,
} from "@src/utils";

const { RangePicker } = DatePicker;
import StepsChartVis from "./StepsChartVis";


export default function StepsChart(props) {

    const error = useMemo(() => {
        let msg = '';
        if (props.sleepError) {
            msg = 'Sleep data error: ' + props.sleepError.message + '</br>';
        }
        if (props.stepsError) {
            msg += 'Step data error: ' + props.stepsError.message;
        }
        return msg;
    }, [props.sleepError, props.stepsError]);

    const [dateRange, setDateRange] = useState({
        date_from: null,
        date_to: null,
    });
    const [datePeriod, setDatePeriod] = useState(DATE_PERIODS.all);
    const [datePickerKey, setDatePickerKey] = useState(0);

    const handlePeriodSelection = ({ target: { value } }) => {
        setDatePeriod(value);

        let range = null;
        switch (value) {
            case DATE_PERIODS.today:
                range = {
                    date_from: todayTimestamp,
                    date_to: nowTimestamp,
                };
                break;
            case DATE_PERIODS.week:
                range = {
                    date_from: weekAgoTimestamp,
                    date_to: todayTimestamp,
                };
                break;
            case DATE_PERIODS.month:
                range = {
                    date_from: monthAgoTimestamp,
                    date_to: todayTimestamp,
                };
                break;
            case DATE_PERIODS.year:
                range = {
                    date_from: yearAgoTimestamp,
                    date_to: todayTimestamp,
                };
                break;
            case DATE_PERIODS.all:
                range = {
                    date_from: null,
                    date_to: null,
                };
                break;
        }

        if (range !== null) {
            setDateRange(range);
            setDatePickerKey((previousKey) => previousKey + 1);
        }
    };

    const handleRangePicker = (_, datePicker) => {
        const pickedFromDate = moment(datePicker[0]).unix() * 1000;
        const pickedToDate = moment(datePicker[1]).unix() * 1000;

        if (!pickedFromDate || !pickedToDate) {
            return;
        }

        setDatePeriod(DATE_PERIODS.none);
        setDateRange({
            date_from: pickedFromDate,
            date_to: pickedToDate,
        });
    };


    if (props.sleepData === null || props.stepData === null) {
        if (error !== '') {
          return (
            <Card className="relative mx-6 mt-5">
              <Alert
                className="w-full"
                message="Fetch error"
                showIcon
                description={error}
                type="error"
                action={
                  <Button onClick={fetchData} size="middle" danger>
                    Retry
                  </Button>
                }
              />
            </Card>
          );
        }
        return (
          <Spin spinning={true} tip="Loading...">
            <Card className="relative mx-6 mt-5 h-96"></Card>
          </Spin>
        );
      }
    
    
      return (
        <Card className="mx-6 mt-5">
          <Flex justify="center" className="gap-3 mb-4">
            <Radio.Group
              size="large"
              value={datePeriod}
              onChange={handlePeriodSelection}
            >
              {Object.keys(DATE_PERIODS).map((period, i) => (
                <Radio.Button key={period + i + 'something'} value={period}>
                  {capitalizeFirstLetter(period)}
                </Radio.Button>
              ))}
            </Radio.Group>
            <RangePicker key={datePickerKey} onChange={handleRangePicker} />
          </Flex>
          <Flex align="center" justify="space-between" className="gap-8 mx-24">
            <StepsChartVis {...props}/>
          </Flex>
        </Card>
      );
}