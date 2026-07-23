import React, { useState } from 'react';
import { Award, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import ExecutiveDecisionModal from './ExecutiveDecisionModal';

export default function Round3ExecutiveReview({ candidates, onSaveVerdict }) {
  const [trFilter, setTrFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Stats Calculations
  const promotedCount = candidates.length;
  const hiredCount = candidates.filter(c => c.r3_verdict === 'Selected').length;
  const maybeCount = candidates.filter(c => c.r3_verdict === 'Maybe').length;
  const rejectedCount = candidates.filter(c => c.r3_verdict === 'Rejected').length;

  const filtered = candidates.filter(c => {
    // R3 table displays candidates where Round 2 tech decision is Yes or Maybe
    const r2Decision = c.r2_decision || 'Pending';
    const isPromoted = r2Decision === 'Yes' || r2Decision === 'Maybe';

    if (!isPromoted) return false;

    if (trFilter === 'Yes' && r2Decision !== 'Yes') return false;
    if (trFilter === 'Maybe' && r2Decision !== 'Maybe') return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-orange-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Promoted</span>
            <Award className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-slate-800">{promotedCount}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Hired</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-emerald-600">{hiredCount}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Executive Maybe</span>
            <HelpCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-amber-600">{maybeCount}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm border-t-4 border-t-red-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-red-600">{rejectedCount}</div>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border w-fit">
        <button
          onClick={() => setTrFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            trFilter === 'ALL'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All TR Decisions
        </button>
        <button
          onClick={() => setTrFilter('Yes')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            trFilter === 'Yes'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          TR Recommended: Yes
        </button>
        <button
          onClick={() => setTrFilter('Maybe')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            trFilter === 'Maybe'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          TR Recommended: Maybe
        </button>
      </div>

      {/* Decision Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">TR Verdict Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">TR Verdict</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Executive Verdict</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-400 font-medium">
                    No candidates awaiting executive decision.
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
                      {c.job_title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {c.r2_comments || 'No technical review comments entered.'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.r2_decision === 'Yes' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {c.r2_decision}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.r3_verdict === 'Selected' ? 'bg-emerald-50 text-emerald-600' :
                        c.r3_verdict === 'Rejected' ? 'bg-red-50 text-red-600' :
                        c.r3_verdict === 'Maybe' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {c.r3_verdict || 'Awaiting Verdict'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-lg text-xs transition-colors"
                      >
                        Decide
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCandidate && (
        <ExecutiveDecisionModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onSave={async (candidateId, payload) => {
            await onSaveVerdict(candidateId, payload);
            setSelectedCandidate(null);
          }}
        />
      )}
    </div>
  );
}
