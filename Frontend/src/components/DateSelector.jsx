import { Button, Card, DatePicker, Flex, Radio } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;

import { dayToTimestamp, convertTimestampToDateString } from "@src/utils";

import {
  LeftOutlined,
  RightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useState } from "react";

export default function DateSelector({
  dateRange,
  setDateRange,
  setDetailsDate,
  datePicker,
  setDatePicker,
  ...props
}) {
  //wrapper element. Pass a list of objects as children and it will render them under a date selector thing
  //passes props as well as datePeriod for aggregation('all','year','month','week'...) nd dateRange {date_from: null | ms-timestamp, date_to: null || ms-timestamp}
  //todo: make gooder
  //parameters: itemHeight: height of children divs, itemWidht: widht of children divs
  //children: list of jsx elements to render and pass date stuff too

  function shiftDateRange(days) {
    const currStart = convertTimestampToDateString(dateRange.start / 1000);
    const currStop = convertTimestampToDateString(dateRange.stop / 1000);
    if (days === 0) {
      return;
    }
    if (days > 0) {
      const newStart = moment(currStart).add(days, "day");
      const newStop = moment(currStop).add(days, "day");
      // console.log("newstart", newStart, newStop);
      setDateRange({
        start: dayToTimestamp(newStart),
        stop: dayToTimestamp(newStop),
      });
      setDetailsDate(newStop.format("YYYY-MM-DD"));
    } else {
      const newStart = moment(currStart).subtract(Math.abs(days), "day");
      const newStop = moment(currStop).subtract(Math.abs(days), "day");
      // console.log("newstart", newStart, newStop);
      setDateRange({
        start: dayToTimestamp(newStart),
        stop: dayToTimestamp(newStop),
      });
      setDetailsDate(newStop.format("YYYY-MM-DD"));
    }
  }

  function updateDateRange(value) {
    console.log(datePicker);
    const currStop = convertTimestampToDateString(dateRange.stop / 1000);

    if (value === "week") {
      const newStart = moment(currStop).subtract(1, "week");
      setDateRange({
        start: dayToTimestamp(newStart),
        stop: dayToTimestamp(currStop),
      });
    } else if (value === "month") {
      const newStart = moment(currStop).subtract(1, "month");
      setDateRange({
        start: dayToTimestamp(newStart),
        stop: dayToTimestamp(currStop),
      });
    } else if (value === "quarter") {
      const newStart = moment(currStop).subtract(3, "month");
      setDateRange({
        start: dayToTimestamp(newStart),
        stop: dayToTimestamp(currStop),
      });
    } else if (value === "year") {
      const newStart = moment(currStop).subtract(1, "year");
      setDateRange({
        start: dayToTimestamp(newStart),
        stop: dayToTimestamp(currStop),
      });
    }
  }
  const datePeriod = ["year", "quarter", "month", "week"];

  function handleDatePeriodChange(e) {
    setDatePicker(e.target.value);
    updateDateRange(e.target.value);
  }

  const forwardEnabled = dateRange.stop < moment().unix() * 1000;
  const backwardEnabled =
    dateRange.start >= moment().subtract(100, "days").unix() * 1000;

  function incrementDay() {
    shiftDateRange(1);
  }

  function decrementDay() {
    shiftDateRange(-1);
  }

  function incrementWeek() {
    // week or month or quarter
    console.log(datePicker);
    datePicker === "week"
      ? shiftDateRange(7)
      : datePicker === "month"
      ? shiftDateRange(30)
      : shiftDateRange(90);
  }

  function decrementWeek() {
    datePicker === "week"
      ? shiftDateRange(-7)
      : datePicker === "month"
      ? shiftDateRange(-30)
      : shiftDateRange(-90);
  }

  function resetDates() {
    setDateRange({
      stop: dayToTimestamp(moment()),
      start: dayToTimestamp(moment().subtract(4, "weeks")),
    });
  }

  function handleRangePicker(_, datePicker) {
    console.log("date picked", datePicker, _);
    const pickedFromDate = moment(datePicker[0]).unix() * 1000;
    const pickedToDate = moment(datePicker[1]).unix() * 1000;

    if (!pickedFromDate || !pickedToDate) {
      return;
    }

    setDateRange({
      start: pickedFromDate,
      stop: pickedToDate,
    });
  }

  //when you click on a date, it will limit the time period to 4 weeks?
  const disabledDates = (current, { from, type }) => {
    console.log("here", current, from);
    if (from) {
      const minDate = from.add(-3, "months");
      const maxDate = from.add(3, "months");
      switch (type) {
        case "year":
          return (
            current.year() < minDate.year() || current.year() > maxDate.year()
          );
        case "month":
          return (
            getYearMonth(current) < getYearMonth(minDate) ||
            getYearMonth(current) > getYearMonth(maxDate)
          );
        default:
          return Math.abs(current.diff(from, "months")) >= 3;
      }
    }
    return false;
  };

  //todo: update allowed dates dynamically?
  return (
    <div className="mx-6 mt-3 shadow p-2" style={{ width: "100%" }}>
      <Flex justify="center" className="gap-3 mb-4">
        <Radio.Group
          options={datePeriod.map((v) => {
            return { label: v, value: v };
          })}
          onChange={handleDatePeriodChange}
          value={datePicker}
          optionType="button"
        />
        <Button onClick={decrementWeek} disabled={!backwardEnabled}>
          <DoubleLeftOutlined />
        </Button>
        <Button onClick={decrementDay} disabled={!backwardEnabled}>
          <LeftOutlined />
        </Button>
        <Button type={"text"}>
          {convertTimestampToDateString(dateRange.start / 1000) +
            " - " +
            convertTimestampToDateString(dateRange.stop / 1000)}
        </Button>
        <Button onClick={incrementDay} disabled={!forwardEnabled}>
          <RightOutlined />
        </Button>
        <Button onClick={incrementWeek} disabled={!forwardEnabled}>
          <DoubleRightOutlined />
        </Button>
        <Button onClick={resetDates}>
          <RollbackOutlined />
        </Button>
        <RangePicker
          onChange={handleRangePicker}
          disabledDate={disabledDates}
          format={"YYYY-MM-DD"}
          // defaultValue={[convertTimestampToDateString(dateRange.start), convertTimestampToDateString(dateRange.stop)]}
          // maxDate={moment()}
          // minDate={moment().subtract(3,'months').format('YYYY-MM-DD')}
        />
      </Flex>
    </div>
  );
}
