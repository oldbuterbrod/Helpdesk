import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./Sidebar.css"; 

const Sidebar = () => {
  const navigate = useNavigate();

  return <div className="sidebar">
     <div className="sidebar-item" onClick={() => navigate("/")}>
        Главная
      </div>
      <div className="sidebar-item" onClick={() => navigate("/HelpsCard")}>
        Заявки
      </div>
  </div>;
};

export default Sidebar;
