import axios from "axios";

export const baseApi = axios.create({
  baseURL: "https://withings.a-fathollahi.com/api/service/",
});
