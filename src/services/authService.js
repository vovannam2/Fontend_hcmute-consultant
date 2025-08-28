import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // đổi thành link backend thật

export const login = async (email, password) => {
  return await axios.post(`${API_URL}/login`, { email, password });
};
