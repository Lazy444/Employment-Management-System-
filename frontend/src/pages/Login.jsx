// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// ✅ if your hook is called useUserAuth (from my fixed AuthContext):
import { useUserAuth } from "../context/AuthContext";
//  OR, if you kept the old name, swap the line above to:
// import { userAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // ✅ use the hook to grab login()
  const { login } = useUserAuth(); // or: const { login } = userAuth();

  // ✅ call useNavigate (it’s a function)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // clear previous error

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      if (data?.success) {
        // save user in context
        login(data.user);

        // save token for protected routes
        localStorage.setItem("token", data.token);

        // redirect based on role
        if (data.user.role === "admin") {
          navigate("/admindashboard");
        } else {
          navigate("/employeedashboard");
        }
      } else {
        setError(data?.error || "Invalid credentials.");
      }
    } catch (err) {
      if (err.response && !err.response.data.success) {
        setError(err.response.data.error || "Invalid credentials.");
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to server. Please make sure the backend is running."
        );
      } else {
        setError("Server error. Please try again later.");
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center h-screen justify-center 
      bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6"
    >
      <h2 className="font-sevillana text-3xl text-white">
        Employee Management System
      </h2>

      <div className="border shadow p-6 w-80 bg-white rounded">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="******"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-teal-600"
              />
              <span className="ml-2 text-gray-700 text-sm">Remember me</span>
            </label>
            <a
              href="#"
              className="text-teal-600 hover:text-teal-800 text-sm hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-medium transition-colors duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;