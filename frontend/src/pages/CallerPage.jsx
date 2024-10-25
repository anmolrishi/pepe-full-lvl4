import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDate, formatDateTime, parseFirebaseDate } from '../utils/dateUtils';
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import ReactAudioPlayer from 'react-audio-player';
import { FaPhoneAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB'];

const CallerPage = () => {
  const { id } = useParams();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    averageDuration: 0,
    successRate: 0,
  });

  useEffect(() => {
    const callsRef = collection(db, 'calls');
    const callerQuery = query(callsRef, where('callerId', '==', `caller${id}`));

    const unsubscribe = onSnapshot(callerQuery, (snapshot) => {
      const callsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCalls(callsData);

      // Calculate metrics
      const total = callsData.length;
      const totalDuration = callsData.reduce((sum, call) => sum + (call.call_duration || 0), 0);
      const successfulCalls = callsData.filter(call => call.analyzed).length;

      setMetrics({
        totalCalls: total,
        averageDuration: total > 0 ? totalDuration / total : 0,
        successRate: total > 0 ? (successfulCalls / total) * 100 : 0,
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Prepare disconnection reason data
  const disconnectionData = calls.reduce((acc, call) => {
    const reason = call.disconnection_reason || 'Unknown';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});

  const disconnectionChartData = Object.entries(disconnectionData).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare sentiment data
  const sentimentData = calls.reduce((acc, call) => {
    const sentiment = call.user_sentiment || 'Unknown';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  const sentimentChartData = Object.entries(sentimentData).map(([name, value]) => ({
    name,
    value
  }));

  const CallDetailsModal = ({ call, onClose }) => {
    if (!call) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Call Details</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Call Summary and Sentiment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Call Summary</h4>
                  <p className="text-gray-600">{call.call_summary || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">User Sentiment</h4>
                  <p className="text-gray-600">{call.user_sentiment || 'N/A'}</p>
                </div>
              </div>

              {/* Transcript */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Call Transcript</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-600">
                    {call.call_transcript || 'No transcript available'}
                  </pre>
                </div>
              </div>

              {/* Recording */}
              {call.call_recording && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Call Recording</h4>
                  <ReactAudioPlayer
                    src={call.call_recording}
                    controls
                    className="w-full"
                  />
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Call Duration</h4>
                  <p className="text-gray-600">
                    {call.call_duration ? `${call.call_duration.toFixed(2)}s` : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Disconnection Reason</h4>
                  <p className="text-gray-600">{call.disconnection_reason || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Caller {id} Analytics</h1>

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
              <p className="text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Disconnection Reasons Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Disconnection Reasons</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={disconnectionChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {disconnectionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Sentiment Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">User Sentiment Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentChartData.map((entry, index) => (
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

      {/* Calls Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Call Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calls.map((call) => (
                <tr
                  key={call.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedCall(call)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{call.to_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.call_duration ? `${call.call_duration.toFixed(2)}s` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDateTime(call.start_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.user_sentiment || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Details Modal */}
      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
};

export default CallerPage;