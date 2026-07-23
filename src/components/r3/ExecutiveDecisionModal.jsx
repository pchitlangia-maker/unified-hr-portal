import React, { useState } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';

export default function ExecutiveDecisionModal({ candidate, onClose, onSave }) {
  const [verdict, setVerdict] = useState(candidate.r3_verdict || '');
  const [verdictTier, setVerdictTier] = useState(candidate.r3_verdict_tier || '');
  const [onboardingGuidelines, setOnboardingGuidelines] = useState(candidate.r3_onboarding_guidelines || '');
  const [rejectionComments, setRejectionComments] = useState(candidate.r3_rejection_comments || '');

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!verdict) {
      alert("Please select a Verdict decision.");
      return;
    }

    // Validation: Rejection Comments Required if Rejected
    if (verdict === 'Rejected' && !rejectionComments.trim()) {
      alert("Please enter rejection comments as they are required for this decision.");
      return;
    }

    setSaving(true);
    try {
      await onSave(candidate.id, {
        r3_verdict: verdict,
        r3_verdict_tier: verdictTier || null,
        r3_onboarding_guidelines: onboardingGuidelines || null,
        r3_rejection_comments: verdict === 'Rejected' ? rejectionComments : null
      });
    } catch (e) {
      alert("Error saving executive decision: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white border rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" /> Executive Verdict Decision
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
          <div className="bg-slate-50 border p-4 rounded-xl">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Candidate Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
              <div>Name: <span className="font-semibold">{candidate.name}</span></div>
              <div>Position: <span className="font-semibold">{candidate.job_title}</span></div>
              <div>Screening Score: <span className="font-semibold">{candidate.r1_score}/30</span></div>
              <div>TR Decision: <span className="font-semibold text-orange-600 uppercase text-xs">{candidate.r2_decision}</span></div>
            </div>
            <div className="border-t mt-3 pt-3">
              <span className="text-xs font-bold text-slate-500 block mb-1">TR Evaluator Remarks</span>
              <p className="text-xs text-slate-600 italic leading-relaxed">{candidate.r2_comments || 'No remarks provided.'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Final Selection Verdict</label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="">Select Verdict...</option>
                <option value="Selected">Selected (Hire)</option>
                <option value="Maybe">Maybe / Waitlist</option>
                <option value="Rejected">Rejected (Decline)</option>
              </select>
            </div>

            {verdict === 'Selected' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assign Onboarding Verdict Tier</label>
                <select
                  value={verdictTier}
                  onChange={(e) => setVerdictTier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="">Select Tier...</option>
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                </select>
              </div>
            )}

            {verdict === 'Selected' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Onboarding / Project Guidelines</label>
                <textarea
                  rows="3"
                  value={onboardingGuidelines}
                  onChange={(e) => setOnboardingGuidelines(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Enter specific onboarding tasks or project tags..."
                />
              </div>
            )}

            {verdict === 'Rejected' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  Rejection Comments <span className="text-red-500">*</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Required)</span>
                </label>
                <textarea
                  rows="3"
                  value={rejectionComments}
                  onChange={(e) => setRejectionComments(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-red-200 text-sm"
                  placeholder="Enter reason for rejection..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Decision'}
          </button>
        </div>
      </div>
    </div>
  );
}
