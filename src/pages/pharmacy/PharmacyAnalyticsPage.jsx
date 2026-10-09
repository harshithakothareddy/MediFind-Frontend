import React from 'react';
import {
  BarChart2, TrendingUp, Users, Search, ShoppingBag, Eye,
  ArrowUpRight, ArrowDownRight, Award
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import StatCard from '../../components/common/StatCard';
import { formatPrice } from '../../utils/helpers';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend
);

const PharmacyAnalyticsPage = () => {
  const topSearchedData = {
    labels: ['Paracetamol', 'Azithromycin', 'Cetirizine', 'Amoxicillin', 'Metformin', 'Ibuprofen'],
    datasets: [
      {
        label: 'Search Impressions',
        data: [450, 380, 310, 290, 240, 205],
        backgroundColor: '#059669',
        borderRadius: 8,
      },
      {
        label: 'In-Store Holds',
        data: [85, 62, 54, 48, 35, 29],
        backgroundColor: '#0d9488',
        borderRadius: 8,
      }
    ]
  };

  const hourlyTrafficData = {
    labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
    datasets: [
      {
        label: 'Hourly Inquiries',
        data: [35, 80, 140, 95, 175, 260, 220, 90],
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Search Traffic & Demand Analytics</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Real-time patient search trends, conversion to pickup reservations, and unmet medication demand
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Search Views"
          value="4,820"
          subtitle="+18% vs last week"
          icon={Eye}
          color="primary"
        />
        <StatCard
          title="Holds Created"
          value="313"
          subtitle="91% fulfillment rate"
          icon={ShoppingBag}
          color="teal"
        />
        <StatCard
          title="Store Profile Clicks"
          value="1,490"
          subtitle="Direct directions/calls"
          icon={Users}
          color="warning"
        />
        <StatCard
          title="Estimated Revenue"
          value={formatPrice(48250)}
          subtitle="From app reservations"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 border border-neutral-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Top Searched Medicines in Your Locality</h3>
          <div className="h-64">
            <Bar
              data={topSearchedData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>

        <div className="card p-6 border border-neutral-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Peak Search Hours (Daily Inquiries)</h3>
          <div className="h-64">
            <Line
              data={hourlyTrafficData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Unmet Demand Section */}
      <div className="card p-6 border border-neutral-200 shadow-sm space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-neutral-900">Unmet Local Demand (Stock Opportunity)</h3>
            <p className="text-xs text-neutral-500">Medicines frequently searched by patients within 3 km that your store currently lacks</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            High Opportunity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Montelukast 10mg', searches: 140, category: 'Respiratory', estRevenue: '₹9,800' },
            { name: 'Rosuvastatin 20mg', searches: 98, category: 'Cardiovascular', estRevenue: '₹14,200' },
            { name: 'Pantoprazole 40mg', searches: 210, category: 'Gastrointestinal', estRevenue: '₹18,500' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900">{item.name}</h4>
              <p className="text-xs text-neutral-500">{item.category}</p>
              <div className="pt-2 border-t border-neutral-200/80 flex justify-between text-xs">
                <span>{item.searches} local queries</span>
                <strong className="text-teal-700">{item.estRevenue} /mo</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacyAnalyticsPage;
