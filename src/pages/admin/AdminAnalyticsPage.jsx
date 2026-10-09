import React from 'react';
import { BarChart2, TrendingUp, Activity, Server, Zap, Globe, Shield } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import StatCard from '../../components/common/StatCard';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement
);

const AdminAnalyticsPage = () => {
  const categorySearchData = {
    labels: ['Antibiotics', 'Analgesics', 'Antidiabetics', 'Antihistamines', 'NSAIDs', 'Cardiovascular'],
    datasets: [
      {
        label: 'Searches (Last 30 Days)',
        data: [14200, 18500, 9400, 12100, 8900, 6700],
        backgroundColor: '#059669',
        borderRadius: 8,
      }
    ]
  };

  const deviceDistributionData = {
    labels: ['Mobile Web / PWA', 'Desktop Browser', 'Embedded API Partners'],
    datasets: [
      {
        data: [68, 24, 8],
        backgroundColor: ['#059669', '#0f766e', '#ca8a04'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Platform Telemetry & Search Analytics</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Real-time public health data, search volume density, and system infrastructure performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Daily Queries"
          value="48,920"
          subtitle="99.98% served under 80ms"
          icon={Activity}
          color="primary"
        />
        <StatCard
          title="Search Success Rate"
          value="96.4%"
          subtitle="Found in-stock pharmacy"
          icon={Zap}
          color="teal"
        />
        <StatCard
          title="POS Sync Rate"
          value="99.2%"
          subtitle="134 nodes connected"
          icon={Server}
          color="warning"
        />
        <StatCard
          title="Shortage Index"
          value="Low (1.2%)"
          subtitle="Critical drugs balanced"
          icon={Shield}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6 border border-neutral-200 shadow-sm space-y-4 bg-white">
          <h3 className="font-bold text-base text-neutral-900">Search Volume by Pharmacological Category</h3>
          <div className="h-64">
            <Bar
              data={categorySearchData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>

        <div className="card p-6 border border-neutral-200 shadow-sm space-y-4 bg-white flex flex-col justify-between">
          <h3 className="font-bold text-base text-neutral-900">Traffic Source Distribution</h3>
          <div className="h-48 relative flex items-center justify-center">
            <Doughnut
              data={deviceDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } },
                cutout: '65%',
              }}
            />
          </div>
          <p className="text-xs text-center text-neutral-500">68% searches initiated from smartphones on-the-go</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
