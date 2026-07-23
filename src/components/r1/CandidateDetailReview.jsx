import { FileText, Users, Link, ExternalLink, ArrowLeft, Award } from 'lucide-react';

export default function CandidateDetailReview({ candidate, reviewers, onSave, onCancel }) {
  const [r1Tier, setR1Tier] = useState(candidate.r1_tier || 'N/A');
  const [r1Score, setR1Score] = useState(candidate.r1_score || 0);
  const [r1Comments, setR1Comments] = useState(candidate.r1_comments || '');
  const [r1Status, setR1Status] = useState(candidate.r1_status || 'Pending');
  const [assignedTechReviewer, setAssignedTechReviewer] = useState(candidate.assigned_tech_reviewer_id || '');

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(candidate.id, {
        r1_tier: r1Tier,
        r1_score: r1Score,
        r1_comments: r1Comments,
        r1_status: r1Status,
        assigned_tech_reviewer_id: assignedTechReviewer || null
      });
    } catch (e) {
      alert('Error saving review: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Dossier Panel */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" /> Candidate Profile Dossier
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Full Name</span>
                <span className="text-sm font-bold text-slate-800">{candidate.name}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Email Address</span>
                <span className="text-sm font-medium text-slate-700">{candidate.email}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-muted-foreground block">UG University</span>
                <span className="text-sm font-medium text-slate-700">{candidate.ug_university || 'N/A'}</span>
              </div>
            </div>

            <div className="border-t pt-4 flex flex-wrap gap-3">
              {candidate.resume_url && (
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FileText size={14} /> View Resume
                </a>
              )}
              {candidate.github_url && (
                <a
                  href={candidate.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Users size={14} /> GitHub Repository
                </a>
              )}
              {candidate.linkedin_url && (
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Link size={14} /> LinkedIn Profile
                </a>
              )}
              {candidate.demo_url && (
                <a
                  href={candidate.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={14} /> Live Demo Link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Form Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Round 1 Screening Form</h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assign Tier</label>
                <select
                  value={r1Tier}
                  onChange={(e) => setR1Tier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="N/A">N/A</option>
                  <option value="Tier 1+">Tier 1+</option>
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2+">Tier 2+</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                  <option value="Tier 4">Tier 4</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Total Screening Score (Max 30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={r1Score}
                  onChange={(e) => setR1Score(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">App Status Decision</label>
                <select
                  value={r1Status}
                  onChange={(e) => setR1Status(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Access requested">Access requested</option>
                  <option value="HR cleared">HR cleared</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {r1Status === 'HR cleared' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assign Technical Reviewer</label>
                  <select
                    value={assignedTechReviewer}
                    onChange={(e) => setAssignedTechReviewer(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="">Select Reviewer...</option>
                    {reviewers.map(r => (
                      <option key={r.user_id} value={r.user_id}>{r.email}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Screening Comments</label>
                <textarea
                  rows="4"
                  value={r1Comments}
                  onChange={(e) => setR1Comments(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Enter recruiter summary comments..."
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm transition-colors mt-2"
              >
                {saving ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
