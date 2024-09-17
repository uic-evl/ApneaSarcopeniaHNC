import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as env from "./env.js";


export default function Oauth2Login({cookieName, tokenRegex}) {
  const navigate = useNavigate();
  const [tokenObtained,setTokenObtained] = useState(false);
  const [code,setCode] = useState(null)

  useEffect(() => {

    const accessCode = new URLSearchParams(window.location.search).get("code");
    if (accessCode !== null) {
      // const accessToken = code;
      console.log(accessCode);
      localStorage.setItem(cookieName,accessCode);
      setCode(accessCode);
    } else {
      setCode(null);
      console.log('bad code',window.location.href,accessCode)
    }
  }, []);


  useEffect(() => {
    if (code !== null && localStorage.getItem(cookieName) !== null) {
      navigate("/");
    }
  }, [code, navigate]);

  return (
    <div className="root">
    </div>
  );
}