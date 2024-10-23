import {
  Alert,
  Button,
  Card,
  DatePicker,
  Flex,
  Radio,
  Spin,
} from "antd";
import { useState, Children, useMemo, isValidElement, cloneElement } from "react";
import moment from "moment";

// constants
import { DATE_PERIODS } from "@src/constants";

const { RangePicker } = DatePicker;

import { capitalizeFirstLetter, todayTimestamp, nowTimestamp, weekAgoTimestamp, monthAgoTimestamp, yearAgoTimestamp } from "@src/utils";

export default function DateWrapper({ children, ...props }) {
  //wrapper element. Pass a list of objects as children and it will render them under a date selector thing
  //passes props as well as datePeriod for aggregation('all','year','month','week'...) nd dateRange {date_from: null | ms-timestamp, date_to: null || ms-timestamp}
  //todo: make gooder
  //parameters: itemHeight: height of children divs, itemWidht: widht of children divs
  //children: list of jsx elements to render and pass date stuff too

  const [dateRange, setDateRange] = useState({
    date_from: null,
    date_to: null,
  });
  const [datePeriod, setDatePeriod] = useState(DATE_PERIODS.all);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const itemHeight = props.itemHeight? props.itemHeight:'10em';
  const itemWidth = props.itemWidth? props.itemWidth:'50%'

  const handlePeriodSelection = ({ target: { value } }) => {
    setDatePeriod(value);

    let range = null;
    switch (value) {
      case DATE_PERIODS.today:
        range = {
          date_from: todayTimestamp(),
          date_to: nowTimestamp(),
        };
        break;
      case DATE_PERIODS.week:
        range = {
          date_from: weekAgoTimestamp(),
          date_to: todayTimestamp(),
        };
        break;
      case DATE_PERIODS.month:
        range = {
          date_from: monthAgoTimestamp(),
          date_to: todayTimestamp(),
        };
        break;
      case DATE_PERIODS.year:
        range = {
          date_from: yearAgoTimestamp(),
          date_to: todayTimestamp(),
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


  const childrenWithProps = useMemo(() => {
    return Children.map(children, (child,i) => {
      if (isValidElement(child)) {
        return (
          <div className={'shadow rounded text-center'} 
            style={{height: itemHeight, width: itemWidth, display:'flex', flexDirection:'column',margin: '0px',padding: '0px'}}
          >
            
            <div  style={{height: '1.1em', width:'100%', margin:'0px', fontSize:'1.1em', fontWeight:'bold', display:'flex-item', adding:'0px'}}>
              {props.titles? props.titles[i] : 'Title'}
              </div>
            <div style={{height: 'calc(100% - 1.2em)', width: '100%', margin: '0px', padding:'0px', display:'flex-item'}}>
              {cloneElement(child, { ...props, dateRange, datePeriod })}
            </div>
          
          </div>
      )
      }
      return child;
    });
  }, [Children, dateRange, datePeriod]);

  if (props.dataLoaded === false) {
    if (props.error && props.error !== '') {
      return (
        <Card className="relative mx-6 mt-5">
          <Alert
            className="w-full"
            message="Fetch error"
            showIcon
            description={props.error}
            type="error"
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
          {Object.keys(DATE_PERIODS).filter(d => d !== DATE_PERIODS.today && d !== DATE_PERIODS.none).map((period, i) => (
            <Radio.Button key={period + i + 'something'} value={period}>
              {capitalizeFirstLetter(period)}
            </Radio.Button>
          ))}
        </Radio.Group>
        <RangePicker key={datePickerKey} onChange={handleRangePicker} />
      </Flex>
      <Flex align="center" justify="space-between" className="mx-24"style={{height: '10em',width:'100%',margin: '0px'}}>
        {childrenWithProps}
      </Flex>
    </Card>
  );
}
