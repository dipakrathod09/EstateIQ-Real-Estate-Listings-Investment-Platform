import React, { useEffect, useState } from 'react';
import { fetchBackendHealth } from '../api/client';
import { Activity, ShieldCheck, Cpu, Database, TrendingUp, Sparkles } from 'lucide-react';

export const Home = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchBackendHealth()
      .then((data) => {
        if (isMounted) {
          setHealth(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to reach Django backend');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 0 Foundation Live</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Next-Gen Real Estate <br />
          <span className="gradient-text">& AI Investment Analytics</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Combining Django REST Framework, React (Vite), and FastAPI ML services to deliver real-time valuation models and intelligent property discovery.
        </p>
      </div>

      {/* Health Check Proof Card */}
      <div className="my-10 max-w-2xl mx-auto w-full">
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all"></div>
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-sky-400">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">System Connectivity Check</h3>
                <p className="text-xs text-slate-400">End-to-End API Integration Status</p>
              </div>
            </div>
            
            <div>
              {loading && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Connecting...
                </span>
              )}
              {!loading && health && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping"></span>
                  Connected ({health.status})
                </span>
              )}
              {!loading && error && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Connection Error
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 font-mono text-sm text-slate-300">
              <div className="text-xs text-slate-500 mb-1">// Endpoint GET /api/health/</div>
              {loading && <div className="text-slate-500 animate-pulse">Fetching backend status...</div>}
              {!loading && health && (
                <pre className="text-emerald-400 overflow-x-auto">
                  {JSON.stringify(health, null, 2)}
                </pre>
              )}
              {!loading && error && (
                <div className="text-rose-400">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Architectural Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-3 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Database className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-semibold text-white">Django REST Backend</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            PostgreSQL relational store, custom User role model (Buyer, Owner, Agent, Builder, Admin), and JWT security.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-semibold text-white">FastAPI ML Service</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Containerized microservice predicting property valuations and ROI metrics in real time.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-semibold text-white">Enterprise Scalability</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Docker Compose environment, S3 media management, and GitHub Actions parallel CI pipelines.
          </p>
        </div>
      </div>
    </div>
  );
};
