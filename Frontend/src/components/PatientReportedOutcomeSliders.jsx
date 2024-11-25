import { useState } from "react";
import { Row, Col, Flex, InputNumber, Slider } from "antd";

export const PatientReportedOutcomeSliders = (props) => {
  const [sleepInput, setSleepInput] = useState(0);
  const [fatigueInput, setFatigueInput] = useState(0);
  const [painInput, setPainInput] = useState(0);
  const [drowsinessInput, setDrowsinessInput] = useState(0);

  const handleSleepChange = (value) => {
    setSleepInput(value);
  };

  const handleFatigueChange = (value) => {
    setFatigueInput(value);
  };

  const handlePainChange = (value) => {
    setPainInput(value);
  };

  const handleDrowsinessChange = (value) => {
    setDrowsinessInput(value);
  };

  return (
    <>
      <Row>
        <Col span={7}> Sleep:</Col>
        {/* <Col span={12}>
          <Slider
            min={0}
            max={10}
            value={sleepInput}
            onChange={handleSleepChange}
          />
        </Col> */}
        <Col span={8}>
          <InputNumber
            min={0}
            max={10}
            value={sleepInput}
            onChange={handleSleepChange}
            style={{ width: "80%" }}
          />
        </Col>
      </Row>

      <Row>
        <Col span={7}> Fatigue:</Col>
        {/* <Col span={12}>
          <Slider
            min={0}
            max={10}
            value={fatigueInput}
            onChange={handleFatigueChange}
          />
        </Col> */}
        <Col span={8}>
          <InputNumber
            min={0}
            max={10}
            value={fatigueInput}
            onChange={handleFatigueChange}
            style={{ width: "80%" }}
          />
        </Col>
      </Row>

      <Row>
        <Col span={7}> Pain:</Col>
        {/* <Col span={12}>
          <Slider
            min={0}
            max={10}
            value={painInput}
            onChange={handlePainChange}
          />
        </Col> */}
        <Col span={8}>
          <InputNumber
            min={0}
            max={10}
            value={painInput}
            onChange={handlePainChange}
            style={{ width: "80%" }}
          />
        </Col>
      </Row>
      <Row>
        <Col span={7}> Drowsy:</Col>
        {/* <Col span={12}>
          <Slider
            min={0}
            max={10}
            value={drowsinessInput}
            onChange={handleDrowsinessChange}
          />
        </Col> */}
        <Col span={8}>
          <InputNumber
            min={0}
            max={10}
            value={drowsinessInput}
            onChange={handleDrowsinessChange}
            style={{ width: "80%" }}
          />
        </Col>
      </Row>
    </>
  );
};
