import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, FileText, User, Calendar, MessageSquare, Paperclip, Download, Upload, Loader2, XCircle } from 'lucide-react';
import { getComplaintById } from '../../services/complaint.service';

const statusConfig = {
  'OPEN': { color: 'bg-blue-100 text-blue-700', label: 'Open' },
  'IN_REVIEW': { color: 'bg-yellow-100 text-yellow-700', label: 'In Review' },
  'RESOLVED': { color: 'bg-green-100 text-green-700', label: 'Resolved' },
  'CLOSED': { color: 'bg-gray-100 text-gray-600', label: 'Closed' },
};

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await getComplaintById(id);
        if (response.success) {
          setComplaint(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!complaint) return <div className="flex justify-center p-xl text-on-surface-variant">Complaint not found</div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-md mb-xl">
        <button onClick={() => navigate(-1)} className="p-sm rounded-lg hover:bg-surface-container transition-colors">
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-sm mb-xs flex-wrap">
            <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{complaint.id.split('-')[0]}</span>
            <span className={`text-label-sm px-sm py-xs rounded-full font-semibold ${statusConfig[complaint.status]?.color || 'bg-gray-100'}`}>{statusConfig[complaint.status]?.label || complaint.status}</span>
            <span className="text-label-sm bg-red-50 text-red-600 px-sm py-xs rounded-full">{complaint.priority} Priority</span>
            <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">{complaint.category}</span>
          </div>
          <h1 className="text-headline-md text-on-surface">{complaint.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Case Info */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h2 className="text-headline-sm text-on-surface mb-lg flex items-center gap-sm">
              <FileText size={18} className="text-primary" /> Case Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-lg mb-lg">
              {[
                { label: 'Filed On', value: new Date(complaint.createdAt).toLocaleDateString() },
                { label: 'Incident Date', value: complaint.incidentDate ? new Date(complaint.incidentDate).toLocaleDateString() : 'N/A' },
                { label: 'Location', value: complaint.location || 'N/A' },
                { label: 'Opposing Party', value: complaint.opposingParty || 'N/A' },
                { label: 'Package', value: complaint.package?.name || 'Standard Representation' },
                { label: 'Case ID', value: complaint.id.split('-')[0] },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                  <p className="text-body-md text-on-surface font-medium mt-xs">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant mb-sm">Description</p>
              <div className="bg-surface-container-low rounded-xl p-lg">
                <p className="text-body-md text-on-surface leading-relaxed">{complaint.description}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h2 className="text-headline-sm text-on-surface mb-lg flex items-center gap-sm">
              <Paperclip size={18} className="text-primary" /> Uploaded Documents
            </h2>
            <div className="space-y-sm">
              {complaint.documents?.map((doc, i) => (
                <div key={i} className="flex items-center justify-between bg-surface-container-low rounded-xl p-md">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{doc.type}</p>
                      <p className="text-body-sm text-on-surface-variant">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5001';
                    window.open(`${baseUrl}${doc.url}`, '_blank');
                  }} className="flex items-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
                    <Download size={14} /> Download
                  </button>
                </div>
              ))}
              {(!complaint.documents || complaint.documents.length === 0) && (
                <p className="text-body-sm text-on-surface-variant text-center py-md">No documents uploaded.</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h2 className="text-headline-sm text-on-surface mb-lg">Quick Actions</h2>
            <div className="flex gap-md flex-wrap">
              {complaint.assignedTo && (
                <Link to={`/user/consultation?lawyerId=${complaint.assignedTo.id}`} className="no-underline">
                  <button className="flex items-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md hover:opacity-90 transition-opacity">
                    <MessageSquare size={18} /> Consultation

                  </button>
                </Link>
              )}
              <button
                onClick={() => navigate(`/user/upload?case=${complaint.id}&from=details`)}
                className="flex items-center gap-sm px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors"
              >
                <Upload size={18} /> Upload More Documents
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-lg">
          {/* Assigned Lawyer */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface mb-md flex items-center gap-sm">
              <User size={18} className="text-primary" /> Assigned Lawyer
            </h3>
            {complaint.assignedTo ? (
              <>
                <div className="flex items-center gap-md mb-lg">
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary-container">
                    {complaint.assignedTo.name?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">{complaint.assignedTo.name}</p>
                    <p className="text-body-sm text-on-surface-variant">Assigned Lawyer</p>
                  </div>
                </div>
                <div className="flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-body-sm text-green-600">Currently online</span>
                </div>
              </>
            ) : (
              <div className="text-center py-lg">
                <p className="text-body-md text-yellow-600 font-medium">⏳ Pending Assignment</p>
                <p className="text-body-sm text-on-surface-variant mt-xs">A lawyer will be assigned soon.</p>
              </div>
            )}
          </div>

          {/* Next Hearing */}
          {complaint.hearingDate && (
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-xl text-on-primary shadow-card">
              <Calendar size={24} className="mb-md" />
              <p className="text-label-md opacity-80 mb-xs">📅 Next Court Hearing</p>
              <p className="text-headline-sm font-bold">{new Date(complaint.hearingDate).toLocaleDateString()}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface mb-lg">Case Timeline</h3>
            <div className="space-y-sm">
              {[
                { event: 'Complaint Filed', date: new Date(complaint.createdAt).toLocaleDateString(), done: true },
                { event: 'Payment Received', date: new Date(complaint.createdAt).toLocaleDateString(), done: !!complaint.packageId },
                { event: 'Lawyer Assigned', date: complaint.assignedTo ? 'Completed' : 'Pending', done: !!complaint.assignedTo },
                { event: 'Documents Reviewed by Lawyer', date: 'Pending', done: complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' },
                { event: 'Resolution', date: 'TBD', done: complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' },
              ].map((item, i, arr) => (
                <div key={i} className="flex gap-md">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                      ${item.done ? 'bg-primary' : 'bg-surface-container-high'}`}>
                      {item.done
                        ? <CheckCircle size={14} className="text-on-primary" />
                        : <Clock size={14} className="text-on-surface-variant" />}
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-xs ${item.done ? 'bg-primary' : 'bg-surface-container-high'}`} style={{ minHeight: '20px' }} />
                    )}
                  </div>
                  <div className="pb-sm">
                    <p className={`text-body-sm font-medium ${item.done ? 'text-on-surface' : 'text-on-surface-variant'}`}>{item.event}</p>
                    <p className="text-body-sm text-on-surface-variant">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
