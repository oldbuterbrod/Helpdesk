import React, { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useIndexedDB } from "../../hooks/useIndexedDB";
import './DashboardComponent.css'

const DashboardComponent = () => {
  const { getAllData, dbReady } = useIndexedDB("MyDatabase", "MyStore", 1);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!dbReady) return;
      const allTickets = await getAllData();
      setTickets(allTickets);
    };
    fetchTickets();
  }, [dbReady, getAllData]);

 
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status !== "Завершенные").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Завершенные").length;

  // Последние 5 заявок
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)) // Сортировка по дате создания
    .slice(0, 5);

  // Данные для графиков
  const statusData = [
    { name: "Открытые", value: openTickets },
    { name: "Решённые", value: resolvedTickets },
  ];

  const priorityData = [
    { name: "Высокий", value: tickets.filter((t) => t.priority === "Высокий").length },
    { name: "Средний", value: tickets.filter((t) => t.priority === "Средний").length },
    { name: "Низкий", value: tickets.filter((t) => t.priority === "Низкий").length },
  ];

  const timelineData = tickets.reduce((acc, t) => {
    const date = t.creationDate.split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const timelineChartData = Object.keys(timelineData).map((date) => ({
    date,
    count: timelineData[date],
  }));

  return (
    <div className="dashboard-container p-4">
      <h1 className="text-2xl font-bold mb-4">Панель управления</h1>


      <div className="metrics-container grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="metric-card p-4 bg-blue-100 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Всего заявок</h2>
          <p className="text-2xl font-bold">{totalTickets}</p>
        </div>
        <div className="metric-card p-4 bg-green-100 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Открытые</h2>
          <p className="text-2xl font-bold">{openTickets}</p>
        </div>
        <div className="metric-card p-4 bg-yellow-100 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Решённые</h2>
          <p className="text-2xl font-bold">{resolvedTickets}</p>
        </div>
      </div>

     
      <div className="charts-container grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
       
        <div className="chart-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Распределение по статусам</h3>
          <p className="text-sm mb-4">Этот график показывает количество открытых и завершённых заявок.</p>
          <PieChart width={300} height={300}>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d"][index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        
        <div className="chart-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Распределение по приоритетам</h3>
      
          <BarChart width={300} height={300} data={priorityData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </div>

    
        <div className="chart-card p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Динамика создания заявок</h3>
          
          <LineChart width={500} height={300} data={timelineChartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>

      <div className="recent-tickets-container p-4 mt-8 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Последние заявки</h3>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Номер</th>
              <th className="border px-4 py-2">Описание</th>
              <th className="border px-4 py-2">Дата создания</th>
              <th className="border px-4 py-2">Ответственный</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.map((t) => (
              <tr key={t.id}>
                <td className="border px-4 py-2">{t.number}</td>
                <td className="border px-4 py-2">{t.description}</td>
                <td className="border px-4 py-2">{t.creationDate}</td>
                <td className="border px-4 py-2">{t.responsibleEmployee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardComponent;
