import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ load user from localStorage on refresh
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // ✅ keep synced
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("ems_email"); // optional
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserContext);

export default AuthProvider;
