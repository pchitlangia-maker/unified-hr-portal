import React, { useState } from 'react';
import { Flame, CheckCircle, HelpCircle, Clock, XCircle } from 'lucide-react';

export default function Round2TechnicalReview({ candidates, onSelectCandidate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('ALL');

  // Stats Calculations
  const total = candidates.length;
  const recommendedYes = candidates.filter(c => c.r2_decision === 'Yes').length;
  const recommendedMaybe = candidates.filter(c => c.r2_decision === 'Maybe').length;
  const recommendedNo = candidates.filter(c => c.r2_decision === 'No').length;
  const pending = candidates.filter(c => !c.r2_decision || c.r2_decision === 'Pending').length;

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDecision = selectedDecision === 'ALL' || 
                            (selectedDecision === 'Pending' ? (!c.r2_decision || c.r2_decision === 'Pending') : c.r2_decision === selectedDecision);
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-orange-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Queue Total</span>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-slate-800">{total}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Verdict Yes</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-emerald-600">{recommendedYes}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Verdict Maybe</span>
            <HelpCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-amber-600">{recommendedMaybe}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-red-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Verdict No</span>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-red-600">{recommendedNo}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-blue-600">{pending}</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border rounded-xl shadow-sm">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search assigned candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">TR Decision:</span>
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          >
            <option value="ALL">All Decisions</option>
            <option value="Pending">Pending</option>
            <option value="Yes">Yes</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Screening Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Link</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">TR Decision</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-400 font-medium">
                    No candidates assigned for technical vetting in this program.
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
                      {c.job_title} <span className="text-xs text-muted-foreground">({c.job_code})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{c.r1_score}/30</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {c.demo_url ? (
                        <a href={c.demo_url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-bold">
                          View Demo
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">None Provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.r2_decision === 'Yes' ? 'bg-emerald-50 text-emerald-600' :
                        c.r2_decision === 'No' ? 'bg-red-50 text-red-600' :
                        c.r2_decision === 'Maybe' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {c.r2_decision || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => onSelectCandidate(c)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-lg text-xs transition-colors"
                      >
                        Vet Candidate
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
