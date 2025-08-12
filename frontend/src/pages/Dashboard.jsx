import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout"); // backend logout endpoint
    } catch (err) {
      console.error("Logout request failed:", err.message);
    }
    logout(); // clear context + localStorage
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px", fontSize: "24px" }}>
      Dashboard Page
      <br />
      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#d9534f",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
