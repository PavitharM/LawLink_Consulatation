import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Briefcase, Filter, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLawyers } from '../../services/user.service';
import { getComplaints, assignLawyer } from '../../services/complaint.service';

const specializations = ['All', 'Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Property Law', 'Corporate Law'];

const SearchLawyers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [availOnly, setAvailOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userComplaints, setUserComplaints] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [lawyersRes, complaintsRes] = await Promise.all([
          getLawyers(),
          getComplaints()
        ]);
        if (lawyersRes.success) setLawyers(lawyersRes.data);
        if (complaintsRes.success) {
          // Filter to only OPEN and unassigned complaints
          setUserComplaints(complaintsRes.data.filter(c => c.status === 'OPEN' && !c.assignedToId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitData();
  }, []);

  const handleRequestLawyer = async () => {
    if (!selectedComplaintId) return;
    setRequesting(true);
    try {
      const response = await assignLawyer(selectedComplaintId, selected.id);
      if (response.success) {
        setSuccessMsg('Request sent successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          setShowAssignModal(false);
          setSelected(null);
          // Remove the assigned complaint from the list
          setUserComplaints(prev => prev.filter(c => c.id !== selectedComplaintId));
          setSelectedComplaintId('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(false);
    }
  };

  const filtered = lawyers.filter(l => {
    const nameMatch = l.name?.toLowerCase().includes(search.toLowerCase());
    const specMatch = l.lawyerProfile?.specialization?.toLowerCase().includes(search.toLowerCase());
    const locMatch = l.lawyerProfile?.location?.toLowerCase().includes(search.toLowerCase());
    
    const matchSearch = nameMatch || specMatch || locMatch;
    const matchSpec = specFilter === 'All' || l.lawyerProfile?.specialization === specFilter;
    const matchAvail = !availOnly || l.lawyerProfile?.availability === 'Available';
    return matchSearch && matchSpec && matchAvail;
  });

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">Find a Lawyer</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Browse verified legal professionals across Sri Lanka. All lawyers are Bar Association registered.</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card mb-xl">
        <div className="flex flex-col gap-lg">
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text" placeholder="Search by name, specialization, or city..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-md py-md border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Spec Pills */}
          <div className="flex items-center gap-sm flex-wrap">
            <Filter size={16} className="text-on-surface-variant shrink-0" />
            {specializations.map(s => (
              <button key={s} onClick={() => setSpecFilter(s)}
                className={`px-md py-xs rounded-full text-label-sm font-semibold transition-colors
                  ${specFilter === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {s}
              </button>
            ))}
            <label className="flex items-center gap-xs cursor-pointer ml-auto">
              <input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} className="accent-primary" />
              <span className="text-body-sm text-on-surface-variant">Available Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-body-md text-on-surface-variant mb-lg">{filtered.length} lawyers found</p>

      {/* Lawyer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
        {filtered.map(l => {
          const profile = l.lawyerProfile || {};
          const isAvailable = profile.availability !== 'Unavailable';
          return (
            <div key={l.id} className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5">
              {/* Top */}
              <div className="flex items-start gap-md mb-lg">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-headline-sm font-bold text-on-primary-container shrink-0">
                  {l.name ? l.name.charAt(0) : 'L'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-xs">
                    <h3 className="text-headline-sm text-on-surface truncate">{l.name}</h3>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} title={isAvailable ? 'Available' : 'Unavailable'} />
                  </div>
                  <p className="text-body-sm font-semibold text-primary">{profile.specialization || 'General'}</p>
                  <div className="flex items-center gap-xs mt-xs text-body-sm text-on-surface-variant">
                    <MapPin size={12} /> {profile.location || 'Anywhere'} • {profile.experience || 0} yrs
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-body-sm text-on-surface-variant mb-lg line-clamp-2 leading-relaxed">{profile.bio || 'Experienced lawyer'}</p>

              {/* Languages */}
              <div className="flex gap-xs flex-wrap mb-lg">
                {(profile.languages || []).map(lang => (
                  <span key={lang} className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">{lang}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-md border-t border-surface-container-high mb-lg">
                <div className="text-center">
                  <p className="text-label-sm text-on-surface-variant">Rating</p>
                  <div className="flex items-center gap-xs text-yellow-500 mt-xs">
                    <Star size={14} fill="currentColor" />
                    <span className="text-body-md font-bold text-on-surface">4.8</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-label-sm text-on-surface-variant">Cases</p>
                  <p className="text-body-md font-bold text-on-surface mt-xs">20+</p>
                </div>
                <div className="text-center">
                  <p className="text-label-sm text-on-surface-variant">Reviews</p>
                  <p className="text-body-md font-bold text-on-surface mt-xs">15+</p>
                </div>
                <div className="text-center">
                  <p className="text-label-sm text-on-surface-variant">Fee</p>
                  <p className="text-body-sm font-bold text-primary mt-xs">₹{profile.consultationFee || '500'}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-sm">
                <button onClick={() => setSelected(l)} className="flex-1 py-sm rounded-xl border border-outline-variant text-body-sm font-semibold hover:bg-surface-container transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Modal */}
      {selected && (() => {
        const profile = selected.lawyerProfile || {};
        const isAvailable = profile.availability !== 'Unavailable';
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-lg" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-lg mb-xl">
                <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-headline-md font-bold text-on-primary-container">
                  {selected.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <h2 className="text-headline-sm text-on-surface">{selected.name}</h2>
                  <p className="text-body-md text-primary font-semibold">{profile.specialization || 'General'}</p>
                  <div className="flex items-center gap-xs text-on-surface-variant text-body-sm mt-xs">
                    <MapPin size={14} /> {profile.location || 'Anywhere'}
                  </div>
                  <div className={`flex items-center gap-xs mt-xs text-body-sm ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {isAvailable ? 'Available for new cases' : 'Not available'}
                  </div>
                </div>
              </div>

              <p className="text-body-md text-on-surface-variant leading-relaxed mb-xl">{profile.bio}</p>

              <div className="grid grid-cols-2 gap-md mb-xl">
                {[
                  { label: 'Experience', value: `${profile.experience || 0} yrs` },
                  { label: 'Cases Handled', value: '20+' },
                  { label: 'Rating', value: `4.8 ⭐ (15+ reviews)` },
                  { label: 'Consultation Fee', value: `₹${profile.consultationFee || '500'}` },
                  { label: 'Languages', value: (profile.languages || []).join(', ') },
                ].map((item, i) => (
                  <div key={i} className={i === 4 ? 'col-span-2' : ''}>
                    <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                    <p className="text-body-md text-on-surface font-medium mt-xs">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-md mt-xl pt-lg border-t border-surface-container-high">
                <button onClick={() => {
                  setSelected(null);
                  setShowAssignModal(false);
                  setSuccessMsg('');
                }} className="flex-1 py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">
                  Close
                </button>
                <button onClick={() => setShowAssignModal(true)} className="flex-1 py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:bg-primary-container transition-colors">
                  Request Lawyer
                </button>
              </div>

              {/* Assignment Sub-Modal */}
              {showAssignModal && (
                <div className="mt-md p-md bg-surface-container-low rounded-xl border border-surface-container-high">
                  <h4 className="text-label-md font-semibold text-on-surface mb-sm">Select a Case to Assign</h4>
                  {userComplaints.length === 0 ? (
                    <div className="text-body-sm text-on-surface-variant">
                      You don't have any open, unassigned cases. <br />
                      <button onClick={() => navigate('/user/complaints/new')} className="text-primary font-medium hover:underline mt-xs">Create a new case</button>
                    </div>
                  ) : (
                    <div className="space-y-md">
                      <select 
                        value={selectedComplaintId} 
                        onChange={(e) => setSelectedComplaintId(e.target.value)}
                        className="w-full border border-outline-variant rounded-lg px-md py-sm text-body-md focus:outline-none focus:border-primary"
                      >
                        <option value="">-- Choose a Case --</option>
                        {userComplaints.map(c => (
                          <option key={c.id} value={c.id}>{c.title} ({c.id.split('-')[0]})</option>
                        ))}
                      </select>
                      
                      {successMsg ? (
                        <div className="text-green-600 flex items-center gap-xs text-body-sm font-medium">
                          <CheckCircle size={16} /> {successMsg}
                        </div>
                      ) : (
                        <div className="flex justify-end gap-sm">
                          <button onClick={() => setShowAssignModal(false)} className="px-md py-xs rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">Cancel</button>
                          <button onClick={handleRequestLawyer} disabled={!selectedComplaintId || requesting} className="px-md py-xs rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:bg-primary-container disabled:opacity-50 transition-colors flex items-center gap-xs">
                            {requesting && <Loader2 size={14} className="animate-spin" />} Send Request
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SearchLawyers;
