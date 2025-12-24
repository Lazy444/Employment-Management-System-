// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from "react";

// create the context
const UserContext = createContext(null);

// provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    // optional: localStorage.setItem("token", userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// custom hook to use the auth context
export const useUserAuth = () => useContext(UserContext);

export default AuthProvider;