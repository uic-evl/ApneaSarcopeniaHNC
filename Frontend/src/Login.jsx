import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as env from "./env.js";
import './index.css';

export default function Login() {
  const navigate = useNavigate();
  const [fitbitCode,setFitbitCode] = useState(localStorage.getItem('fitbit-code'));
  const [whithingsCode, setWhithingsCode] = useState(localStorage.getItem('whithings-code'));
  const [fitbitToken,setFitbitToken] = useState(localStorage.getItem('fitbit-token'));
  const [whithingsToken,setWhithingsToken] = useState(localStorage.getItem('whithings-token'));
  
  const whithingRedirect = window.location.href + 'whithingslogin';

  function makeFitbitScope(){
    const fitbitScopeItems = [
      'activity','heartrate', 'location', 
      'nutrition', 'oxygen_saturation', 
      'profile', 'respiratory_rate', 
      'settings', 'sleep', 'social', 
      'temperature','weight'];
    let fitbitScope = fitbitScopeItems[0];
    for(const obj of fitbitScopeItems.slice(1,fitbitScopeItems.length+1)){
      fitbitScope += '%20'+obj;
    }
    return fitbitScope;
  }
  
  const handleFitbitClick = () => {
    const fbScope = makeFitbitScope();
    // const targetUrl = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${env.FITBIT_CLIENT_ID}&scope=${fbScope}`;
    const targetUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${env.FITBIT_CLIENT_ID}&scope=${fbScope}&code_challenge_method=S256&code_challenge=${env.CHALLENGE}`;
    window.location.href = targetUrl;
  };

  const handleWithingsClick = () => {
    const targetUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${env.WHITHINGS_CLIENT_ID}&scope=user.info,user.metrics,user.activity&redirect_uri=${whithingRedirect}&state=${env.CHALLENGE}`
    window.location.href = targetUrl;
  }

  const handleFbLogoutClick = () => {
    localStorage.removeItem('fitbit-token');
    localStorage.removeItem('fitbit-code');
    localStorage.removeItem('verifier');
    localStorage.removeItem('challenge');
    setFitbitCode(null);
    setFitbitToken(null);
  }

  const handleWthLogoutClick = () => {
    localStorage.removeItem('whithings-token');
    localStorage.removeItem('whithings-code');
    localStorage.removeItem('verifier');
    localStorage.removeItem('challenge');
    setWhithingsCode(null);
    setWhithingsToken(null);
  }

  async function fetchFitbitToken(code){
    // Prepare the body for the POST request
    const body = new URLSearchParams();
    body.append("client_id", env.FITBIT_CLIENT_ID);
    body.append("code", code); // The authorization code we just received
    body.append("grant_type", "authorization_code");
    body.append("code_verifier", env.VERIFIER);
    const tokenUrl = "https://api.fitbit.com/oauth2/token";
    // console.log('body',body.toString())
    fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(), // The body must be URL-encoded
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          console.log("Fitbit Access Token:", data);
          // TODO: Store the access token in the local storage as well
          localStorage.setItem("fitbit-token", data.access_token);
          localStorage.setItem('fitbit-refresh-token',data.refresh_token);
          setFitbitToken(data.access_token); // Function to fetch Fitbit data using the access token
        } else {
          console.error("Error fetching access token:", data);
          localStorage.removeItem('fitbit-code');
          setFitbitCode(null);
        }
        
      })
      .catch((error) => {
        console.error("Error during token exchange:", error);
        localStorage.removeItem('fitbit-code');
        setFitbitCode(null);
      });
  }

  async function fetchWhithingsToken(code){
    // Prepare the body for the POST request
    const body = new URLSearchParams();
    body.append("client_id", env.WHITHINGS_CLIENT_ID);
    body.append("code", code); // The authorization code we just received
    body.append("grant_type", "authorization_code");
    body.append('client_secret',env.WHITHINGS_SECRET)
    body.append("action", 'requesttoken');
    body.append('redirect_uri',whithingRedirect)
    const tokenUrl = "https://wbsapi.withings.net/v2/oauth2";
    console.log('whithing body',body.toString())
    fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(), // The body must be URL-encoded
    })
      .then((response) => {
        console.log('whithing response',response)
        return response.json();
      })
      .then((data) => {
        console.log("whithing body",data);
        if (data.body.access_token) {
          const atoken = data.body.access_token;
          console.log("Whiting Access Token:", atoken);
          // TODO: Store the access token in the local storage as well
          localStorage.setItem("whithings-token", atoken);
          localStorage.setItem("whithings-refresh-token",data.body.refresh_token);
          setWhithingsToken(atoken); // Function to fetch Fitbit data using the access token
        } else {
          console.error("Error fetching access token:", data);
        }
        //whithings codes expire in 10second and can be used once so always clear them
        localStorage.removeItem('whithings-code');
        setWhithingsCode(null);
      })
      .catch((error) => {
        console.error("Error during token exchange:", error);
        localStorage.removeItem('whithings-code');
        setWhithingsCode(null);
      });
  }

  useEffect(()=>{
    console.log('fibit code',fitbitCode,localStorage.getItem('fitbit-code'))
    if(fitbitCode !== null && fitbitCode !== undefined) {
      console.log('fetching',fitbitCode)
      fetchFitbitToken(fitbitCode);
    }
  },[fitbitCode])

  useEffect(()=>{
    console.log('withings code',whithingsCode,localStorage.getItem('whithings-code'))
    if(whithingsCode !== null && whithingsCode !== undefined) {
      console.log('fetching',whithingsCode)
      fetchWhithingsToken(whithingsCode);
    }
  },[whithingsCode])
  useEffect(()=>{
    if ( localStorage.getItem('fitbit-token') !== null && localStorage.getItem('whithings-token')!== null){
      navigate('/vis');
    }
  },[fitbitToken, whithingsToken])


  return (
    <div className="root">
        <div className="btn-container">
          <button className="btn btn-primary" onClick={handleFitbitClick} target={"_"}>
            {'log in with FitBit'}
          </button>
        </div>
        <div className="btn-container">
          <button className="btn btn-primary" onClick={handleWithingsClick} target={"_"}>
            {'log in with Whithings'}
          </button>
        </div>
        <div className="btn-container">
          <button className="btn btn-primary" onClick={handleFbLogoutClick}>
            {'Log Out FB'}
          </button>
        </div>
        <div className="btn-container">
          <button className="btn btn-primary" onClick={handleWthLogoutClick}>
            {'Log Out Whithings'}
          </button>
        </div>
        <div>
        {whithingsCode}
        {fitbitCode}
        {fitbitToken}
        {whithingsToken}
        </div>
        
    </div>
  );
}