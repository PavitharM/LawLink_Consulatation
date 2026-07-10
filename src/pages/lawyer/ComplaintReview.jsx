import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Clock, CheckCircle, AlertTriangle, Paperclip, Send, ArrowLeft, Calendar, User, Loader2, X, Eye } from 'lucide-react';
import { getComplaintById, updateComplaintStatus, rejectAssignment } from '../../services/complaint.service';
import { getMessages, sendMessage } from '../../services/message.service';

const ComplaintReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'overview';
  });
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  
  // Resolution Draft States
  const [outcome, setOutcome] = useState('');
  const [resolution, setResolution] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  
  // Document Viewer
  const [viewingDoc, setViewingDoc] = useState(null);
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await getComplaintById(id);
        if (response.success) {
          setCaseData(response.data);
          setOutcome(response.data.resolutionOutcome || '');
          setResolution(response.data.resolutionSummary || '');
          if (response.data.hearingDate) {
            const date = new Date(response.data.hearingDate);
            const localISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            setHearingDate(localISO);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  useEffect(() => {
    let interval;
    if (tab === 'chat' && caseData?.client?.id) {
      const fetchChat = async () => {
        try {
          const res = await getMessages(caseData.client.id);
          if (res.success) setChat(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchChat();
      interval = setInterval(fetchChat, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tab, caseData]);

  const send = async () => {
    if (!msg.trim() || !caseData?.client?.id) return;
    const currentMsg = msg;
    setMsg('');
    
    // Optimistic update
    setChat(prev => [...prev, {
      id: Date.now().toString(), senderId: 'me', text: currentMsg, createdAt: new Date().toISOString()
    }]);

    try {
      await sendMessage(caseData.client.id, currentMsg);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async () => {
    try {
      const payload = {
        status: 'RESOLVED',
        resolutionOutcome: outcome,
        resolutionSummary: resolution,
        hearingDate: hearingDate || undefined
      };
      const response = await updateComplaintStatus(id, payload);
      if (response.success) {
        setCaseData(p => ({ ...p, status: 'RESOLVED', resolutionOutcome: outcome, resolutionSummary: resolution }));
        setTab('overview');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = {
        resolutionOutcome: outcome,
        resolutionSummary: resolution,
        hearingDate: hearingDate || undefined
      };
      const response = await updateComplaintStatus(id, payload);
      if (response.success) {
        setCaseData(p => ({ ...p, resolutionOutcome: outcome, resolutionSummary: resolution }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async () => {
    try {
      const response = await updateComplaintStatus(id, { status: 'IN_REVIEW' });
      if (response.success) {
        setCaseData(p => ({ ...p, status: 'IN_REVIEW' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      const response = await rejectAssignment(id);
      if (response.success) {
        navigate('/lawyer/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = ['overview', 'documents', 'chat', 'resolution'];

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!caseData) return <div className="flex justify-center p-xl text-on-surface-variant">Case not found.</div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-md mb-xl">
        <button onClick={() => navigate('/lawyer/assigned-complaints')} className="p-sm rounded-lg hover:bg-surface-container transition-colors">
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-sm mb-xs">
            <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{caseData.id.split('-')[0]}</span>
            <span className="bg-yellow-100 text-yellow-700 text-label-sm px-sm py-xs rounded-full flex items-center gap-xs">
              <Clock size={12} /> {caseData.status}
            </span>
            <span className="bg-red-50 text-red-600 text-label-sm px-sm py-xs rounded-full">{caseData.priority} Priority</span>
          </div>
          <h1 className="text-headline-md text-on-surface">{caseData.title}</h1>
        </div>
        {caseData.status === 'OPEN' && (
          <div className="flex gap-sm">
            <button onClick={handleReject} className="px-lg py-sm rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors">
              Reject Case
            </button>
            <button onClick={handleAccept} className="px-lg py-sm rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors">
              Accept Case
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-sm mb-xl border-b border-surface-container-high">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-lg py-sm text-label-md capitalize transition-colors border-b-2 -mb-px
              ${tab === t ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          <div className="lg:col-span-2 space-y-lg">
            {/* Client Info */}
            <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
              <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-lg"><User size={18} className="text-primary" /> Client Information</h3>
              <div className="grid grid-cols-2 gap-md">
                {[
                  { label: 'Name', value: caseData.client?.name || 'Unknown' },
                  { label: 'Email', value: caseData.client?.email || 'N/A' },
                  { label: 'Phone', value: caseData.client?.phone || 'N/A' },
                  { label: 'Package', value: caseData.package?.name || 'None' },
                  { label: 'Category', value: caseData.category },
                  { label: 'Filed On', value: new Date(caseData.createdAt).toLocaleDateString('en-GB') },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                    <p className="text-body-md text-on-surface font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
              <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-md"><FileText size={18} className="text-primary" /> Case Description</h3>
              <p className="text-body-md text-on-surface leading-relaxed">{caseData.description}</p>
            </div>

            {/* Hearings */}
            <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
              <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-md"><Calendar size={18} className="text-primary" /> Scheduled Hearings</h3>
              {caseData.hearingDate ? (
                <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-md">
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">{new Date(caseData.hearingDate).toLocaleDateString('en-GB')}</p>
                  </div>
                  <span className="text-label-sm bg-blue-100 text-blue-700 px-sm py-xs rounded-full">Scheduled</span>
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant">No hearings scheduled.</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card h-fit">
            <h3 className="text-headline-sm text-on-surface mb-lg">Case Timeline</h3>
            <div className="relative">
              {[
                { event: 'Complaint Filed', date: new Date(caseData.createdAt).toLocaleDateString('en-GB'), done: true },
                { event: 'Lawyer Assigned', date: caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString('en-GB') : 'N/A', done: !!caseData.assignedToId },
                { event: 'Final Resolution', date: caseData.status === 'RESOLVED' ? new Date(caseData.updatedAt).toLocaleDateString('en-GB') : 'TBD', done: caseData.status === 'RESOLVED' },
              ].map((t, i) => (
                <div key={i} className="flex gap-md mb-lg last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${t.done ? 'bg-primary' : 'bg-surface-container-high'}`}>
                      {t.done ? <CheckCircle size={14} className="text-on-primary" /> : <Clock size={14} className="text-on-surface-variant" />}
                    </div>
                    {i < 2 && <div className={`w-0.5 flex-1 mt-xs ${t.done ? 'bg-primary' : 'bg-surface-container-high'}`} style={{ minHeight: '24px' }} />}
                  </div>
                  <div className="pb-md">
                    <p className={`text-body-sm font-medium ${t.done ? 'text-on-surface' : 'text-on-surface-variant'}`}>{t.event}</p>
                    <p className="text-body-sm text-on-surface-variant">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {tab === 'documents' && (
        <div className="space-y-md">
          {caseData.documents && caseData.documents.length > 0 ? caseData.documents.map((doc, i) => (
            <div key={i} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card flex items-center gap-md">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Paperclip size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-body-md font-semibold text-on-surface capitalize">{doc.type ? doc.type.replace('_', ' ') : 'Document'}</p>
                <p className="text-body-sm text-on-surface-variant">Uploaded {new Date(doc.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
              <button 
                onClick={() => setViewingDoc(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${doc.url}`)} 
                className="flex items-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
                <Eye size={14} /> View
              </button>
            </div>
          )) : (
            <p className="text-body-md text-on-surface-variant">No documents uploaded.</p>
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col p-xl">
          <div className="flex justify-end mb-md">
            <button onClick={() => setViewingDoc(null)} className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {viewingDoc.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) ? (
              <img src={viewingDoc} alt="Document" className="max-w-full max-h-full object-contain" />
            ) : (
              <iframe src={viewingDoc} title="Document Viewer" className="w-full h-full border-0" />
            )}
          </div>
        </div>
      )}

      {/* Chat */}
      {tab === 'chat' && (
        <div className="bg-white border border-surface-container-high rounded-xl shadow-card flex flex-col" style={{ height: '500px' }}>
          <div className="flex-1 overflow-y-auto p-lg space-y-lg flex flex-col">
            {chat.map(m => {
              const isLawyer = m.senderId !== caseData.client.id;
              const timeString = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={m.id} className={`flex items-end gap-sm ${isLawyer ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold shrink-0
                    ${isLawyer ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {isLawyer ? 'ME' : 'C'}
                  </div>
                  <div className={`max-w-[70%] px-lg py-md rounded-2xl text-body-md
                    ${isLawyer ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-low text-on-surface rounded-bl-sm'}`}>
                    {m.text}
                    <p className={`text-body-sm mt-xs opacity-70`}>{timeString}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-lg border-t border-surface-container-high">
            <div className="flex items-center gap-sm bg-surface-container-low rounded-xl px-md py-sm">
              <input type="text" placeholder="Send a message to your client..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                className="flex-1 bg-transparent text-body-md focus:outline-none" />
              <button onClick={send} disabled={!msg.trim()}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${msg.trim() ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution */}
      {tab === 'resolution' && (
        <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card max-w-2xl">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-sm">
              <CheckCircle size={20} className="text-green-600" /> Submit Case Resolution
            </h3>
            {draftSaved && <span className="text-label-sm text-green-700 bg-green-100 px-sm py-xs rounded-lg flex items-center gap-xs"><CheckCircle size={14} /> Draft Saved</span>}
          </div>
          
          <div className="space-y-md">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Outcome *</label>
              <select value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary">
                <option value="">Select outcome...</option>
                <option value="Resolved in client's favor">Resolved in client's favor</option>
                <option value="Settled out of court">Settled out of court</option>
                <option value="Case dismissed">Case dismissed</option>
                <option value="Ongoing (requires extension)">Ongoing (requires extension)</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Resolution Summary *</label>
              <textarea rows={5} value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe the outcome and key actions taken... (You can save this as a draft)"
                className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary resize-none" />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Final Court Date & Time (Optional)</label>
              <input type="datetime-local" value={hearingDate} onChange={e => setHearingDate(e.target.value)} className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" />
            </div>
            <div className="flex gap-md pt-sm">
              <button onClick={handleResolve} disabled={!outcome || !resolution} className="px-xl py-sm rounded-lg bg-green-600 text-white text-body-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                Mark as Resolved
              </button>
              <button onClick={handleSaveDraft} className="px-xl py-sm rounded-lg border border-outline-variant text-body-md hover:bg-surface-container transition-colors">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintReview;
