import axios from "axios";

const API_BASE = "http://localhost:5000";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const getNotifications = async () => {
  return axios.get(`${API_BASE}/api/notifications`, getAuthConfig());
};

export const markNotificationAsRead = async (id) => {
  return axios.patch(
    `${API_BASE}/api/notifications/${id}/read`,
    {},
    getAuthConfig()
  );
};

export const deleteNotificationById = async (id) => {
  return axios.delete(`${API_BASE}/api/notifications/${id}`, getAuthConfig());
};