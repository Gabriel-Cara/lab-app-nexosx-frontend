import axios from "axios";

export const api = axios.create({
  // baseURL: "https://nexus-api-pvf5.onrender.com",
  baseURL: "http://localhost:3333",
})