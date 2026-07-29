import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, FileText, Clock, CheckCircle, User, Paperclip, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { getLawyerById } from '../../services/user.service';
import { getMessages, sendMessage } from '../../services/message.service';

const ConsultationResponse = () => {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const lawyerId = searchParams.get('lawyerId');
  const { addNotificationLocally } = useNotifications();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!lawyerId) return;

    const fetchLawyer = async () => {
      try {
        const res = await getLawyerById(lawyerId);
        if (res.success) setLawyer(res.data);
      } catch (err) {
        console.error('Failed to load lawyer', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [lawyerId]);

  const fetchChat = async () => {
    if (!lawyerId) return;
    try {
      const res = await getMessages(lawyerId);
      if (res.success) setChat(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [lawyerId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const send = async () => {
    if (!msg.trim() || !lawyerId) return;
    const currentMsg = msg;
    setMsg('');
    
    // Optimistic update
    setChat(prev => [...prev, {
      id: Date.now().toString(), senderId: 'me', text: currentMsg, createdAt: new Date().toISOString()
    }]);

    try {
      await sendMessage(lawyerId, currentMsg);
      fetchChat();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'L';

  if (!lawyerId) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-3xl text-center">
        <MessageSquare size={64} className="text-surface-container-high mb-lg" />
        <h2 className="text-headline-md text-on-surface mb-sm">Select Your Case and Lawyer</h2>
        <p className="text-body-md text-on-surface-variant max-w-md">
          Please navigate to your dashboard and select "Send Message" on a specific case to start a live consultation.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-3xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">Consultation Chat</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Direct communication with {lawyer?.name || 'your assigned lawyer'}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Sidebar Info */}
        <div className="space-y-lg">
          {/* Lawyer Card */}
          <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card">
            <h3 className="text-label-md text-on-surface-variant mb-md">Your Lawyer</h3>
            <div className="flex items-center gap-md mb-lg">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary-container">{getInitials(lawyer?.name)}</div>
              <div>
                <p className="text-body-md font-semibold text-on-surface">{lawyer?.name || 'Lawyer'}</p>
                <p className="text-body-sm text-on-surface-variant">{lawyer?.lawyerProfile?.specialization || 'Legal Specialist'}</p>
                <div className="flex items-center gap-xs mt-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-body-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
            <div className="space-y-sm text-body-sm text-on-surface-variant">
              <div className="flex justify-between"><span>Experience</span><span className="font-medium text-on-surface">{lawyer?.lawyerProfile?.experience || 0} years</span></div>
              <div className="flex justify-between"><span>Rating</span><span className="font-medium text-on-surface">⭐ 4.8</span></div>
              <div className="flex justify-between"><span>Location</span><span className="font-medium text-on-surface">{lawyer?.lawyerProfile?.location || 'Sri Lanka'}</span></div>
            </div>
          </div>

          {/* Case Info */}
          <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card">
            <h3 className="text-label-md text-on-surface-variant mb-md">Case Details</h3>
            <div className="space-y-sm text-body-sm">
              <div className="flex items-center gap-sm text-on-surface-variant">
                <FileText size={14} className="text-primary" />
                <span className="font-medium text-on-surface">CMP-001</span>
              </div>
              <p className="text-on-surface font-medium">Property Dispute with Neighbor</p>
              <div className="flex items-center gap-xs mt-sm">
                <span className="bg-blue-100 text-blue-700 text-label-sm px-sm py-xs rounded-full flex items-center gap-xs">
                  <Clock size={12} /> In Review
                </span>
              </div>
            </div>
          </div>

          {/* Next Hearing */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-lg">
            <p className="text-label-md text-primary mb-xs">📅 Next Hearing</p>
            <p className="text-body-md font-semibold text-on-surface">June 25, 2024</p>
            <p className="text-body-sm text-on-surface-variant">10:30 AM — District Court, Colombo</p>
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white border border-surface-container-high rounded-2xl shadow-card flex flex-col" style={{ minHeight: '600px' }}>
          {/* Chat Header */}
          <div className="flex items-center gap-md p-lg border-b border-surface-container-high">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary-container">{getInitials(lawyer?.name)}</div>
            <div>
              <p className="text-body-md font-semibold text-on-surface">{lawyer?.name || 'Lawyer'}</p>
              <p className="text-body-sm text-green-600 flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Online</p>
            </div>
            <div className="ml-auto">
              <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">Live Chat</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-lg space-y-lg">
            {chat.map(m => {
              const isLawyer = m.senderId === lawyerId;
              const timeString = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={m.id} className={`flex items-end gap-sm ${!isLawyer ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold shrink-0
                    ${!isLawyer ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container'}`}>
                    {!isLawyer ? 'ME' : getInitials(lawyer?.name)}
                  </div>
                  <div className={`max-w-[75%] ${!isLawyer ? 'items-end' : 'items-start'} flex flex-col gap-xs`}>
                    <div className={`px-lg py-md rounded-2xl text-body-md leading-relaxed
                      ${!isLawyer ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-low text-on-surface rounded-bl-sm'}`}>
                      {m.text}
                    </div>
                    <span className={`text-body-sm text-on-surface-variant ${!isLawyer ? 'text-right' : ''}`}>{timeString}</span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-lg border-t border-surface-container-high">
            <div className="flex items-center gap-sm bg-surface-container-low rounded-xl px-md py-sm">
              <button className="text-on-surface-variant hover:text-primary transition-colors p-xs">
                <Paperclip size={18} />
              </button>
              <input
                type="text"
                placeholder="Type your message..."
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                className="flex-1 bg-transparent text-body-md text-on-surface focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!msg.trim()}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                  ${msg.trim() ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant'}`}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant text-center mt-xs">Messages are end-to-end encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationResponse;
