import { ArrowLeft, FileText, Users, ExternalLink } from 'lucide-react';

export default function CandidateTechnicalReview({ candidate, onSave, onCancel }) {
  const [startDate, setStartDate] = useState(candidate.r2_earliest_start_date || '');
  const [noticeDuration, setNoticeDuration] = useState(candidate.r2_notice_duration || '');
  const [techComments, setTechComments] = useState(candidate.r2_comments || '');
  
  // Demo Sliders
  const [demoDepth, setDemoDepth] = useState(candidate.r2_demo_depth || 0);
  const [complexity, setComplexity] = useState(candidate.r2_complexity || 0);
  const [techStack, setTechStack] = useState(candidate.r2_tech_stack || 0);
  const [businessFit, setBusinessFit] = useState(candidate.r2_business_fit || 0);
  const [techStackDesc, setTechStackDesc] = useState(candidate.r2_tech_stack_desc || '');
  const [techDecision, setTechDecision] = useState(candidate.r2_decision || 'Pending');

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // If demo_url exists, enforce rating sliders completion
    if (candidate.demo_url) {
      if (demoDepth === 0 || complexity === 0 || techStack === 0 || businessFit === 0) {
        alert("Please complete all demo rating sliders before saving.");
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(candidate.id, {
        r2_earliest_start_date: startDate || null,
        r2_notice_duration: noticeDuration,
        r2_comments: techComments,
        r2_demo_depth: demoDepth,
        r2_complexity: complexity,
        r2_tech_stack: techStack,
        r2_business_fit: businessFit,
        r2_tech_stack_desc: techStackDesc,
        r2_decision: techDecision
      });
    } catch (e) {
      alert("Error saving technical review: " + e.message);
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
        {/* Profile Card & Recruiter Remarks */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Technical Vetting Dossier</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Candidate Name</span>
                <span className="text-sm font-bold text-slate-800">{candidate.name}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Email Address</span>
                <span className="text-sm font-medium text-slate-700">{candidate.email}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">UG University</span>
                <span className="text-sm font-medium text-slate-700">{candidate.ug_university || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Recruiter Screening Score</span>
                <span className="text-sm font-bold text-orange-500">{candidate.r1_score}/30</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <span className="text-xs font-bold text-slate-700 block mb-1">Recruiter Remarks</span>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border italic">
                {candidate.r1_comments || 'No recruiter comments entered.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {candidate.resume_url && (
                <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                  <FileText size={14} /> Resume
                </a>
              )}
              {candidate.github_url && (
                <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                  <Users size={14} /> GitHub Repository
                </a>
              )}
              {candidate.demo_url && (
                <a href={candidate.demo_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                  <ExternalLink size={14} /> Live Demo Project
                </a>
              )}
            </div>
          </div>

          {/* Conditional Demo Ratings Section */}
          {candidate.demo_url && (
            <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-5">
              <h4 className="text-md font-bold text-slate-800 border-b pb-2">Demo Review Project Ratings</h4>
              
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">Product Depth</span>
                    <span className="text-xs font-bold text-orange-600">{demoDepth}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={demoDepth}
                    onChange={(e) => setDemoDepth(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">Architecture Complexity</span>
                    <span className="text-xs font-bold text-orange-600">{complexity}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={complexity}
                    onChange={(e) => setComplexity(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">Technical Stack Sophistication</span>
                    <span className="text-xs font-bold text-orange-600">{techStack}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={techStack}
                    onChange={(e) => setTechStack(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">Solves Real Business Problem</span>
                    <span className="text-xs font-bold text-orange-600">{businessFit}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={businessFit}
                    onChange={(e) => setBusinessFit(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Vetting Input Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Technical Vetting Form</h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Earliest Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notice Duration / College Commitments</label>
                <input
                  type="text"
                  value={noticeDuration}
                  onChange={(e) => setNoticeDuration(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="e.g. 15 days notice, college exams in Dec"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tech Stack Description</label>
                <input
                  type="text"
                  value={techStackDesc}
                  onChange={(e) => setTechStackDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="e.g. React, Node.js, Supabase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Technical Verdict Decision</label>
                <select
                  value={techDecision}
                  onChange={(e) => setTechDecision(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Yes">Yes (Recommend Hire)</option>
                  <option value="Maybe">Maybe</option>
                  <option value="No">No (Reject)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vetting & General Comments</label>
                <textarea
                  rows="4"
                  value={techComments}
                  onChange={(e) => setTechComments(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Enter detailed technical evaluation comments..."
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
