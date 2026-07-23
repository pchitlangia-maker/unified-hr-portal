import React, { useState } from 'react';
import { Users, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function Round1ReviewDashboard({ candidates, jobs, onSelectCandidate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('ALL');

  // Stats Calculations
  const total = candidates.length;
  const hrCleared = candidates.filter(c => c.r1_status === 'HR cleared').length;
  const pendingHigh = candidates.filter(c => c.r1_status === 'Pending' && ['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2-'].includes(c.r1_tier)).length;
  const pendingLow = candidates.filter(c => c.r1_status === 'Pending' && ['Tier 3', 'Tier 4'].includes(c.r1_tier)).length;
  const rejected = candidates.filter(c => c.r1_status === 'Rejected').length;

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.ug_university?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJobId === 'ALL' || String(c.job_id) === String(selectedJobId);
    return matchesSearch && matchesJob;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-orange-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Queue</span>
            <Users className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-slate-800">{total}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">HR Cleared</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-emerald-600">{hrCleared}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending High Tier</span>
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-blue-600">{pendingHigh}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Low Tier</span>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-amber-600">{pendingLow}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-red-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-red-600">{rejected}</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border rounded-xl shadow-sm">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search candidates by name, email, university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Job Position:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title} ({j.job_id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Position</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">UG University</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-400 font-medium">
                    No candidates found in the current program queue.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {c.job_title || 'N/A'} <span className="text-xs text-muted-foreground">({c.job_code})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{c.ug_university || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        ['Tier 1', 'Tier 1+'].includes(c.r1_tier) ? 'bg-orange-50 text-orange-600' :
                        ['Tier 2', 'Tier 2-'].includes(c.r1_tier) ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.r1_tier || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{c.r1_score || 0}/30</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.r1_status === 'HR cleared' ? 'bg-emerald-50 text-emerald-600' :
                        c.r1_status === 'Rejected' ? 'bg-red-50 text-red-600' :
                        c.r1_status === 'Access requested' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {c.r1_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => onSelectCandidate(c)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-lg text-xs transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
