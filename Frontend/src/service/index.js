import axios from "axios";

export const baseApi = axios.create({
  // baseURL: "http://localhost:8000/",
  baseURL: "https://hnc.evl.uic.edu/api/service/"
});
