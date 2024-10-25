import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDate, parseFirebaseDate } from '../utils/dateUtils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FaPhoneAlt, FaClock, FaCheck } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#4BC0C0'];

const Dashboard = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    averageDuration: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const callsRef = collection(db, 'calls');
    const unsubscribe = onSnapshot(query(callsRef), (snapshot) => {
      const callsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCalls(callsData);
      
      // Calculate metrics
      const total = callsData.length;
      const totalDuration = callsData.reduce((sum, call) => sum + (call.call_duration || 0), 0);
      const completedCalls = callsData.filter(call => call.analyzed).length;
      
      setMetrics({
        totalCalls: total,
        averageDuration: total > 0 ? totalDuration / total : 0,
        completionRate: total > 0 ? (completedCalls / total) * 100 : 0
      });
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Prepare data for charts
  const dailyCallTrend = calls.reduce((acc, call) => {
    const date = formatDate(call.timestamp);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const callTrendData = Object.entries(dailyCallTrend)
    .sort((a, b) => parseFirebaseDate(a[0]) - parseFirebaseDate(b[0]))
    .map(([date, count]) => ({
      date,
      calls: count
    }));

  // Prepare caller distribution data
  const callerDistribution = calls.reduce((acc, call) => {
    const callerId = call.callerId || 'Unknown';
    acc[callerId] = (acc[callerId] || 0) + 1;
    return acc;
  }, {});

  const callerPieData = Object.entries(callerDistribution).map(([name, value]) => ({
    name,
    value
  }));

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaPhoneAlt className="text-blue-500 text-2xl mr-4" />
            <div>
              <p className="text-gray-500">Total Calls</p>
              <p className="text-2xl font-bold">{metrics.totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaClock className="text-green-500 text-2xl mr-4" />
            <div>
              <p className="text-gray-500">Average Duration</p>
              <p className="text-2xl font-bold">{metrics.averageDuration.toFixed(2)}s</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaCheck className="text-purple-500 text-2xl mr-4" />
            <div>
              <p className="text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Daily Call Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={callTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calls" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Caller Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={callerPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {callerPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Calls Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Calls</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caller ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calls.slice(0, 10).map((call) => (
                <tr key={call.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{call.callerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{call.to_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.call_duration ? `${call.call_duration.toFixed(2)}s` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      call.analyzed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {call.analyzed ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(call.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;