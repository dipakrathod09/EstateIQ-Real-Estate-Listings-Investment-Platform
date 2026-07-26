import React from 'react';
import { LayoutDashboard, Users, Home, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Role Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of listings, leads, and investment analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Active Listings</span>
            <Home className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">124</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Leads Captured</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">48</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Portfolio Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">$4.2M</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Role</span>
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">Admin</div>
        </div>
      </div>
    </div>
  );
};
