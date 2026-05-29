import axios from "axios";

const API = "http://localhost:5000/api/tasks";

export const getTasks = async () => {
  const token = localStorage.getItem("token");

  return axios.get(`${API}/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateTask = async (id, data) => {
  const token = localStorage.getItem("token");

  return axios.put(`${API}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteTask = async (id) => {
  const token = localStorage.getItem("token");

  return axios.delete(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};