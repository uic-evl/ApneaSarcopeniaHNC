import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as env from "./env.js";

export default function FitbitLogin() {
  const navigate = useNavigate();
  const [tokenObtained,setTokenObtained] = useState(false);


  useEffect(() => {
    const accessTokenRegex = /access_token=([^&]+)/;
    const isMatch = window.location.href.match(accessTokenRegex);

    if (isMatch) {
      const accessToken = isMatch[1];
      console.log(accessToken);
      localStorage.setItem('fitbit-token',accessToken);
      setTokenObtained(true);
    } else {
      setTokenObtained(false);
      console.log('bad token',window.location.href,isMatch)
    }
  }, []);

  useEffect(() => {
    if (tokenObtained && localStorage.getItem('fitbit-token') !== null) {
      navigate("/");
    }
  }, [tokenObtained, navigate]);

  return (
    <div className="root">
    </div>
  );
}