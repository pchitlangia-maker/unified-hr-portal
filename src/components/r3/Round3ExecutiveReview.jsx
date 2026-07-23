import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Users, 
  Flame, 
  Award, 
  GraduationCap, 
  Building,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Search,
  ExternalLink,
  FileText
} from 'lucide-react';
import ExecutiveDecisionModal from './ExecutiveDecisionModal';
import Round1ReviewDashboard from '../r1/Round1ReviewDashboard';
import CandidateDetailReview from '../r1/CandidateDetailReview';
import Round2TechnicalReview from '../r2/Round2TechnicalReview';
import CandidateTechnicalReview from '../r2/CandidateTechnicalReview';

function normalizeUniversity(rawName) {
  if (!rawName) return 'Other/Unspecified';
  
  let clean = rawName.trim();
  clean = clean.replace(/[,]?\s*india/gi, '');
  clean = clean.replace(/\s+and\s*$/i, '');
  clean = clean.replace(/\s+&\s*$/i, '');
  clean = clean.replace(/[,]$/, '');
  clean = clean.trim();
  
  if (!clean) return 'Other/Unspecified';
  
  const lower = clean.toLowerCase();
  
  if (lower.includes('vardhaman')) {
    return 'Vardhaman College of Engineering';
  }
  if (lower.includes('iiit nagpur') || (lower.includes('information technology') && lower.includes('nagpur'))) {
    return 'IIIT Nagpur';
  }
  if (lower.includes('iiit kottayam') || (lower.includes('information technology') && lower.includes('kottayam'))) {
    return 'IIIT Kottayam';
  }
  if (lower.includes('iiit kurnool') || (lower.includes('information technology') && lower.includes('kurnool'))) {
    return 'IIIT Kurnool';
  }
  if (lower.includes('iiit manipur') || (lower.includes('information technology') && lower.includes('manipur'))) {
    return 'IIIT Manipur';
  }
  if (lower.includes('iiit jabalpur') || lower.includes('pdpm') || (lower.includes('information technology') && lower.includes('jabalpur'))) {
    return 'IIIT Jabalpur';
  }
  if (lower.includes('vellore institute') || lower.includes('vit-ap') || lower.includes('vit ap') || lower.includes('vit bhopal') || lower.includes('vit chennai') || lower.match(/\bvit\b/)) {
    return 'Vellore Institute of Technology (VIT)';
  }
  if (lower.includes('koneru lakshmaiah') || lower.includes('kl university') || lower.includes('k l university') || lower.match(/\bklu\b/)) {
    return 'KL University';
  }
  if (lower.includes('world peace university') || lower.includes('mit-wpu') || lower.includes('mit wpu')) {
    return 'MIT World Peace University';
  }
  if (lower.includes('srm university') || lower.includes('srm institute')) {
    return 'SRM University';
  }
  if (lower.includes('annamacharya')) {
    return 'Annamacharya University';
  }
  if (lower.includes('osmania')) {
    return 'Osmania University';
  }
  if (lower.includes('jawaharlal nehru') || lower.includes('jntu')) {
    if (lower.includes('hyderabad')) return 'JNTU Hyderabad';
    if (lower.includes('kakinada')) return 'JNTU Kakinada';
    if (lower.includes('anantapur')) return 'JNTU Anantapur';
    return 'JNTU';
  }
  if (lower.includes('birla institute') || lower.includes('bits pilani') || lower.match(/\bbits\b/)) {
    return 'BITS Pilani';
  }
  if (lower.includes('amrita vishwa') || lower.includes('amrita university')) {
    return 'Amrita Vishwa Vidyapeetham';
  }
  if (lower.includes('savitribai') || lower.includes('pune university') || lower.includes('sppu')) {
    return 'Savitribai Phule Pune University (SPPU)';
  }
  if (lower.includes('mumbai university') || lower.includes('university of mumbai')) {
    return 'Mumbai University';
  }
  if (lower.includes('iit patna') || (lower.includes('indian institute') && lower.includes('patna'))) {
    return 'IIT Patna';
  }
  if (lower.includes('newton school')) {
    return 'Newton School of Technology';
  }
  
  return clean;
}

export default function Round3ExecutiveReview({ candidates, onSaveVerdict }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedUnivName, setSelectedUnivName] = useState(null);
  const [univSearch, setUnivSearch] = useState('');
  const [showAllUnis, setShowAllUnis] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [r3TabFilter, setR3TabFilter] = useState('ALL');

  // Stats
  const totalCount = candidates.length;
  const hrClearedCount = candidates.filter(c => c.r1_status === 'HR cleared').length;
  const trClearedCount = candidates.filter(c => c.r2_decision === 'Yes' || c.r2_decision === 'Maybe').length;
  const hiredCount = candidates.filter(c => c.r3_verdict === 'Selected').length;
  const pendingCount = candidates.filter(c => !c.r1_status || c.r1_status === 'Pending').length;

  // University normalizing helper
  const uniDataList = useMemo(() => {
    const rawGroups = {};
    candidates.forEach(cand => {
      const rawUniv = cand.college || cand.ug_university || 'Other/Unspecified';
      const normName = normalizeUniversity(rawUniv);
      
      if (!rawGroups[normName]) {
        rawGroups[normName] = {
          name: normName,
          total: 0,
          tiers: {
            'Tier 1+': 0,
            'Tier 1': 0,
            'Tier 2+': 0,
            'Tier 2': 0,
            'Tier 3': 0,
            'T4': 0,
            'N/A': 0
          },
          candidates: []
        };
      }
      
      const g = rawGroups[normName];
      g.total++;
      g.candidates.push(cand);
      
      const tier = cand.r1_tier || 'N/A';
      if (g.tiers[tier] !== undefined) {
        g.tiers[tier]++;
      } else {
        g.tiers['N/A']++;
      }
    });
    
    return Object.values(rawGroups).sort((a, b) => b.total - a.total);
  }, [candidates]);

  const sortedUnis = useMemo(() => {
    let list = uniDataList;
    if (univSearch) {
      list = list.filter(u => u.name.toLowerCase().includes(univSearch.toLowerCase()));
    }
    return list;
  }, [uniDataList, univSearch]);

  const handleTileClick = (stage) => {
    if (stage === 'Hired') {
      setActiveSubTab('r3');
    } else if (stage === 'Review') {
      setActiveSubTab('r2');
    } else if (stage === 'Pending') {
      setActiveSubTab('r1');
    }
  };

  // Pivot Table calculations
  const tierPivotData = useMemo(() => {
    const tiers = ['Tier 1+', 'Tier 1', 'Tier 2+', 'Tier 2', 'Tier 3', 'T4', 'N/A'];
    const counts = tiers.reduce((acc, tier) => {
      acc[tier] = { yes: 0, pending: 0, reject: 0, total: 0 };
      return acc;
    }, {});

    candidates.forEach(c => {
      const tier = c.r1_tier || 'N/A';
      const status = c.r1_status || 'Pending';
      if (counts[tier]) {
        if (status === 'HR cleared') counts[tier].yes++;
        else if (status === 'Rejected') counts[tier].reject++;
        else counts[tier].pending++;
        counts[tier].total++;
      }
    });
    return counts;
  }, [candidates]);

  return (
    <div className="exec-tab-container animate-in fade-in duration-300">
      
      {/* Executive Sub-tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3 justify-between">
        <div className="exec-nav-group">
          <button
            onClick={() => { setActiveSubTab('overview'); setSelectedUnivName(null); }}
            className={`exec-nav-tab ${activeSubTab === 'overview' ? 'active' : ''}`}
          >
            <BarChart size={14} /> Overview & Charts
          </button>
          <button
            onClick={() => setActiveSubTab('r1')}
            className={`exec-nav-tab ${activeSubTab === 'r1' ? 'active' : ''}`}
          >
            <Users size={14} /> R1: HR Review
          </button>
          <button
            onClick={() => setActiveSubTab('r2')}
            className={`exec-nav-tab ${activeSubTab === 'r2' ? 'active' : ''}`}
          >
            <Flame size={14} /> R2: Technical Review
          </button>
          <button
            onClick={() => setActiveSubTab('r3')}
            className={`exec-nav-tab ${activeSubTab === 'r3' ? 'active' : ''}`}
          >
            <Award size={14} /> R3: Executive Review
          </button>
          <button
            onClick={() => setActiveSubTab('university')}
            className={`exec-nav-tab ${activeSubTab === 'university' ? 'active' : ''}`}
          >
            <GraduationCap size={14} /> University Overview
          </button>
          <button
            onClick={() => setActiveSubTab('rubrics')}
            className={`exec-nav-tab ${activeSubTab === 'rubrics' ? 'active' : ''}`}
          >
            <FileText size={14} /> Rubrics
          </button>
        </div>
      </div>

      {/* Overview & Charts Viewport */}
      {activeSubTab === 'overview' && !selectedUnivName && (
        <div className="exec-tab-container">
          
          {/* Top Funnel Metric Tiles */}
          <div className="exec-metrics-grid">
            <button 
              onClick={() => handleTileClick('ALL')}
              className="exec-metric-card total"
            >
              <span className="exec-metric-title">Total Applications</span>
              <span className="exec-metric-value">{totalCount}</span>
            </button>
            <button 
              className="exec-metric-card duplicate"
            >
              <span className="exec-metric-title">Duplicates</span>
              <span className="exec-metric-value">0</span>
            </button>
            <button 
              onClick={() => handleTileClick('ALL')}
              className="exec-metric-card unique"
            >
              <span className="exec-metric-title">Unique Applications</span>
              <span className="exec-metric-value">{totalCount}</span>
            </button>
            <button 
              onClick={() => handleTileClick('Review')}
              className="exec-metric-card reviewed"
            >
              <span className="exec-metric-title">Reviewed</span>
              <span className="exec-metric-value" style={{ color: '#10B981' }}>{hrClearedCount}</span>
            </button>
            <button 
              onClick={() => handleTileClick('Pending')}
              className="exec-metric-card pending"
            >
              <span className="exec-metric-title">Pending Review</span>
              <span className="exec-metric-value" style={{ color: '#F59E0B' }}>{pendingCount}</span>
            </button>
          </div>

          {/* Pivot Table: Tier — Status Distribution */}
          <div className="exec-card">
            <h3 className="exec-card-title">
              <Users size={16} className="text-slate-400" /> Tier — Status Distribution
            </h3>
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th className="p-3 font-semibold uppercase">Tier</th>
                    <th className="p-3 font-semibold uppercase text-center text-emerald-600 bg-emerald-50/20">HR Cleared (Yes)</th>
                    <th className="p-3 font-semibold uppercase text-center text-amber-600 bg-amber-50/20">Pending</th>
                    <th className="p-3 font-semibold uppercase text-center text-red-600 bg-red-50/20">Rejected</th>
                    <th className="p-3 font-semibold uppercase text-center font-bold text-slate-800">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(tierPivotData).map(([tier, stats]) => (
                    <tr key={tier} className="hover:bg-slate-50/30">
                      <td className="p-3 font-bold text-slate-800">{tier}</td>
                      <td className="p-3 text-center text-emerald-600 font-bold">{stats.yes}</td>
                      <td className="p-3 text-center text-amber-600 font-bold">{stats.pending}</td>
                      <td className="p-3 text-center text-red-600 font-bold">{stats.reject}</td>
                      <td className="p-3 text-center font-bold text-slate-800 bg-slate-50/30">{stats.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pivot Table: Screened by Decision (Round 2) */}
          <div className="exec-card">
            <h3 className="exec-card-title">
              <Flame size={16} className="text-slate-400" /> Screened by Decision (Round 2)
            </h3>
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th className="p-3 font-semibold uppercase">Decision</th>
                    <th className="p-3 font-semibold uppercase text-center text-emerald-600">Yes</th>
                    <th className="p-3 font-semibold uppercase text-center text-amber-600">Maybe</th>
                    <th className="p-3 font-semibold uppercase text-center text-red-600">No</th>
                    <th className="p-3 font-semibold uppercase text-center text-slate-600">Pending</th>
                    <th className="p-3 font-semibold uppercase text-center font-bold text-slate-800">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/30">
                    <td className="p-3 font-bold text-slate-800">Total Count</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">{candidates.filter(c => c.r2_decision === 'Yes').length}</td>
                    <td className="p-3 text-center text-amber-600 font-bold">{candidates.filter(c => c.r2_decision === 'Maybe').length}</td>
                    <td className="p-3 text-center text-red-600 font-bold">{candidates.filter(c => c.r2_decision === 'No').length}</td>
                    <td className="p-3 text-center text-slate-600 font-bold">{candidates.filter(c => c.r2_decision === 'Pending' || !c.r2_decision).length}</td>
                    <td className="p-3 text-center font-bold text-slate-800 bg-slate-50/30">{totalCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* University Cards Section */}
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="exec-uni-title-small">University Distribution Cards</h3>
            <p className="text-xs text-muted-foreground">Real-time candidate volumes and tier configurations across colleges.</p>
          </div>

          <div className="exec-unis-grid">
            {(showAllUnis ? uniDataList : uniDataList.slice(0, 4)).map((uni) => (
              <div key={uni.name} className="exec-uni-card">
                <div className="exec-uni-header">
                  <div className="exec-uni-info">
                    <div className="exec-uni-icon-box">
                      <Building size={16} />
                    </div>
                    <div>
                      <h4 className="exec-uni-name">{uni.name}</h4>
                      <span className="exec-uni-subtitle">Normalized from variations</span>
                    </div>
                  </div>
                  <span className="exec-uni-badge">
                    {uni.total} {uni.total === 1 ? 'candidate' : 'candidates'}
                  </span>
                </div>
                
                <div className="exec-uni-body">
                  <div className="flex flex-col gap-2">
                    <span className="exec-uni-title-small">Tier Distribution</span>
                    <div className="exec-uni-tiers-grid">
                      {Object.entries(uni.tiers).map(([tierName, count]) => {
                        const classMap = {
                          'Tier 1+': 't1p',
                          'Tier 1': 't1',
                          'Tier 2+': 't2p',
                          'Tier 2': 't2',
                          'Tier 3': 't3',
                          'T4': 't4',
                          'N/A': 'na'
                        };
                        return (
                          <div key={tierName} className={`exec-uni-tier-pill ${classMap[tierName] || 'na'}`}>
                            <span>{tierName}</span>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedUnivName(uni.name)}
                    className="exec-uni-view-btn"
                  >
                    View Candidates ({uni.total}) &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {uniDataList.length > 4 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setShowAllUnis(!showAllUnis)}
                className="px-6 py-2 bg-white hover:bg-slate-50 border border-[#800020] text-[#800020] text-xs font-bold rounded-xl transition-all"
              >
                {showAllUnis ? "View Less Universities" : `View More Universities (${uniDataList.length - 4} more)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* University Drill-Down View */}
      {selectedUnivName && (
        <div className="exec-tab-container">
          <div className="flex items-center gap-3 border-b pb-4">
            <button
              onClick={() => setSelectedUnivName(null)}
              className="exec-btn-outline"
            >
              &larr; Back to Dashboard
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building size={20} className="text-[#800020]" /> {selectedUnivName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Candidate roster and evaluation breakdown</p>
            </div>
          </div>

          <div className="exec-card" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th className="p-3 font-semibold uppercase">Candidate Name</th>
                    <th className="p-3 font-semibold uppercase">Email</th>
                    <th className="p-3 font-semibold uppercase">Applied Tier</th>
                    <th className="p-3 font-semibold uppercase">R1 Status</th>
                    <th className="p-3 font-semibold uppercase">R2 Status</th>
                    <th className="p-3 font-semibold uppercase">R3 Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(uniDataList.find(u => u.name === selectedUnivName)?.candidates || []).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="p-3 text-slate-600">{c.email}</td>
                      <td className="p-3 font-bold text-orange-500">{c.r1_tier || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`exec-pill ${
                          c.r1_status === 'HR cleared' ? 'yes' :
                          c.r1_status === 'Rejected' ? 'no' : 'pending'
                        }`}>{c.r1_status || 'Pending'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`exec-pill ${
                          c.r2_decision === 'Yes' ? 'yes' :
                          c.r2_decision === 'No' ? 'no' : 'pending'
                        }`}>{c.r2_decision || 'Pending'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`exec-pill ${
                          c.r3_verdict === 'Selected' ? 'yes' :
                          c.r3_verdict === 'Rejected' ? 'no' : 'pending'
                        }`}>{c.r3_verdict || 'Pending'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* R1: HR Review Tab Viewport */}
      {activeSubTab === 'r1' && (
        <Round1ReviewDashboard
          candidates={candidates}
          jobs={[]}
          onSelectCandidate={setSelectedCandidate}
        />
      )}

      {/* R2: Technical Review Tab Viewport */}
      {activeSubTab === 'r2' && (
        <Round2TechnicalReview
          candidates={candidates.filter(c => c.r1_status === 'HR cleared')}
          onSelectCandidate={setSelectedCandidate}
        />
      )}

      {/* R3: Executive Review Tab Viewport */}
      {activeSubTab === 'r3' && (
        <div className="exec-tab-container">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold tracking-tight">Round 3 Executive Verdict Worksheet</h2>
            <p className="text-xs text-muted-foreground">Approve hiring selections, check technical reviews, and assign final verdict classifications.</p>
          </div>

          <div className="exec-tab-button-group">
            <button
              onClick={() => setR3TabFilter('ALL')}
              className={`exec-tab-button ${r3TabFilter === 'ALL' ? 'active' : ''}`}
            >
              All Promoted
            </button>
            <button
              onClick={() => setR3TabFilter('Yes')}
              className={`exec-tab-button ${r3TabFilter === 'Yes' ? 'active' : ''}`}
            >
              TR Decision: Yes
            </button>
            <button
              onClick={() => setR3TabFilter('Maybe')}
              className={`exec-tab-button ${r3TabFilter === 'Maybe' ? 'active' : ''}`}
            >
              TR Decision: Maybe
            </button>
          </div>

          <div className="exec-card" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th className="p-3 font-semibold uppercase">Candidate</th>
                    <th className="p-3 font-semibold uppercase">TR Remarks</th>
                    <th className="p-3 font-semibold uppercase">TR Verdict</th>
                    <th className="p-3 font-semibold uppercase">Executive Verdict</th>
                    <th className="p-3 font-semibold uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {candidates
                    .filter(c => c.r2_decision === 'Yes' || c.r2_decision === 'Maybe')
                    .filter(c => r3TabFilter === 'ALL' || c.r2_decision === r3TabFilter)
                    .map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.email}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-600 max-w-xs truncate">
                          {c.r2_comments || 'No technical review comments entered.'}
                        </td>
                        <td className="p-3">
                          <span className={`exec-pill ${
                            c.r2_decision === 'Yes' ? 'yes' : 'maybe'
                          }`}>{c.r2_decision}</span>
                        </td>
                        <td className="p-3">
                          <span className={`exec-pill ${
                            c.r3_verdict === 'Selected' ? 'yes' :
                            c.r3_verdict === 'Rejected' ? 'no' :
                            c.r3_verdict === 'Maybe' ? 'maybe' : 'pending'
                          }`}>{c.r3_verdict || 'Awaiting Verdict'}</span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="exec-btn-outline"
                          >
                            Decide
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* University Overview Tab Viewport */}
      {activeSubTab === 'university' && (
        <div className="exec-tab-container">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#800020]" /> University Overview
            </h2>
            <p className="text-xs text-muted-foreground">Monitor candidate volumes grouped by academic institutions.</p>
          </div>

          <div className="exec-search-wrapper">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" style={{ top: '10px' }} />
            <input
              placeholder="Search universities..."
              value={univSearch}
              onChange={(e) => setUnivSearch(e.target.value)}
              className="exec-search-input"
            />
          </div>

          <div className="exec-card" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr className="exec-university-table-header">
                    <th className="p-3 font-semibold uppercase text-white">University</th>
                    <th className="p-3 font-semibold uppercase text-center text-white">Total</th>
                    <th className="p-3 font-semibold uppercase text-center text-white">Tier 1</th>
                    <th className="p-3 font-semibold uppercase text-center text-white">Tier 1+</th>
                    <th className="p-3 font-semibold uppercase text-center text-white">Tier 2</th>
                    <th className="p-3 font-semibold uppercase text-center text-white">Tier 2+</th>
                    <th className="p-3 font-semibold uppercase text-center text-white">Tier 3</th>
                    <th className="p-3 font-semibold uppercase text-center text-white">Tier 4</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUnis.map((uni) => (
                    <tr key={uni.name} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-sm">
                        <button 
                          onClick={() => setSelectedUnivName(uni.name)}
                          className="text-[#800020] hover:underline font-bold text-left"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                          {uni.name}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-sm bg-slate-50">{uni.total}</td>
                      <td className="p-3 text-center text-sm">{uni.tiers['Tier 1'] || 0}</td>
                      <td className="p-3 text-center text-sm">{uni.tiers['Tier 1+'] || 0}</td>
                      <td className="p-3 text-center text-sm">{uni.tiers['Tier 2'] || 0}</td>
                      <td className="p-3 text-center text-sm">{uni.tiers['Tier 2+'] || 0}</td>
                      <td className="p-3 text-center text-sm">{uni.tiers['Tier 3'] || 0}</td>
                      <td className="p-3 text-center text-sm">{uni.tiers['T4'] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rubrics Tab Viewport */}
      {activeSubTab === 'rubrics' && (
        <div className="exec-tab-container animate-in fade-in duration-300">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#800020]" /> Evaluation Rubrics
            </h2>
            <p className="text-xs text-muted-foreground">Standardized grading weights and rules applied across job roles.</p>
          </div>

          <div className="exec-card">
            <h3 className="exec-card-title">Rubric Weight Allocations</h3>
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th className="p-3 font-semibold uppercase">Category</th>
                    <th className="p-3 font-semibold uppercase">Rule Criteria</th>
                    <th className="p-3 font-semibold uppercase text-center">Max Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold">Education</td>
                    <td className="p-3">UG completed = 2; PG completed = 3</td>
                    <td className="p-3 text-center font-bold">5</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Experience</td>
                    <td className="p-3">1 internship = 1; 2+ internships = 2; Fulltime AI exp = 3</td>
                    <td className="p-3 text-center font-bold">5</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Skills Weights</td>
                    <td className="p-3">Python (0.5), LLM (1.0), RAG (1.0), MCP (1.0)</td>
                    <td className="p-3 text-center font-bold">5</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Projects</td>
                    <td className="p-3">Agentic AI project = 2; RAG implementation = 2</td>
                    <td className="p-3 text-center font-bold">3</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Artifacts</td>
                    <td className="p-3">GitHub = 1; Portfolio = 1; LinkedIn = 0.5</td>
                    <td className="p-3 text-center font-bold">2</td>
                  </tr>
                  <tr className="bg-slate-50 font-black">
                    <td className="p-3" colSpan="2">TOTAL STAGE EVALUATION WEIGHT</td>
                    <td className="p-3 text-center">20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal Rendering */}
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
