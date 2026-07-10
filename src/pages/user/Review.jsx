import React, { useState } from 'react';
import { CheckCircle, User, Briefcase, CreditCard, FileText, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Review = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center py-3xl">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-xl animate-bounce">
          <CheckCircle size={56} className="text-green-600" />
        </div>
        <h2 className="text-headline-lg text-on-surface mb-md">Case Submitted!</h2>
        <p className="text-body-lg text-on-surface-variant mb-xl">
          Your case has been successfully submitted. A lawyer will be assigned to your case within 24 hours. You will receive a notification once assigned.
        </p>
        <div className="bg-white border border-surface-container-high rounded-xl p-xl w-full text-left shadow-card mb-xl">
          <div className="flex items-center justify-between mb-md">
            <span className="text-label-md text-on-surface-variant">Case Reference ID</span>
            <span className="text-label-md font-bold text-primary bg-primary/10 px-md py-xs rounded">CMP-2024-00847</span>
          </div>
          <div className="space-y-sm text-body-sm text-on-surface-variant">
            <div className="flex justify-between"><span>Status</span><span className="text-blue-600 font-medium">Open — Awaiting Assignment</span></div>
            <div className="flex justify-between"><span>Package</span><span className="font-medium text-on-surface">Standard Representation</span></div>
            <div className="flex justify-between"><span>Submitted</span><span className="font-medium text-on-surface">Jun 08, 2024</span></div>
          </div>
        </div>
        <button onClick={() => navigate('/user')} className="px-2xl py-md rounded-xl bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-opacity">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const sections = [
    {
      icon: <User size={20} className="text-primary" />,
      title: 'Your Information',
      items: [
        { label: 'Full Name', value: 'John Doe' },
        { label: 'Email', value: 'john.doe@email.com' },
        { label: 'Phone', value: '+91 98765 43210' },
      ],
    },
    {
      icon: <Briefcase size={20} className="text-primary" />,
      title: 'Case Details',
      items: [
        { label: 'Category', value: 'Civil Law' },
        { label: 'Title', value: 'Property Dispute with Neighbor' },
        { label: 'Priority', value: 'High' },
        { label: 'Description', value: 'I am facing a property boundary dispute with my neighbor who has encroached on my land. Need legal advice urgently.' },
      ],
    },
    {
      icon: <CreditCard size={20} className="text-primary" />,
      title: 'Payment',
      items: [
        { label: 'Package', value: 'Standard Representation' },
        { label: 'Amount Paid', value: '₹1,999' },
        { label: 'Transaction ID', value: 'TXN-2024-LLK-00842' },
      ],
    },
    {
      icon: <FileText size={20} className="text-primary" />,
      title: 'Documents',
      items: [
        { label: 'ID Proof', value: 'aadhaar_card.pdf ✅' },
        { label: 'Complaint', value: 'complaint_letter.pdf ✅' },
        { label: 'Evidence', value: 'property_photos.jpg ✅' },
      ],
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">Review & Submit</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Please review all the details below before submitting your case.</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-lg mb-xl flex items-center gap-md">
        <CheckCircle size={20} className="text-primary" />
        <p className="text-body-md text-primary font-medium">Step 4 of 4 — Final Review. Everything looks good!</p>
      </div>

      <div className="space-y-lg mb-xl">
        {sections.map((section, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <div className="flex items-center justify-between mb-lg">
              <div className="flex items-center gap-sm">
                {section.icon}
                <h3 className="text-headline-sm text-on-surface">{section.title}</h3>
              </div>
              <button className="flex items-center gap-xs text-body-sm text-primary hover:underline">
                <Edit2 size={14} /> Edit
              </button>
            </div>
            <div className="space-y-md">
              {section.items.map((item, j) => (
                <div key={j} className="flex flex-col sm:flex-row sm:items-start gap-xs">
                  <span className="text-label-sm text-on-surface-variant min-w-[160px]">{item.label}</span>
                  <span className="text-body-md text-on-surface flex-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card mb-xl">
        <label className="flex items-start gap-md cursor-pointer">
          <input type="checkbox" className="mt-xs accent-primary" required />
          <span className="text-body-md text-on-surface-variant">
            I confirm that all the information provided is accurate and I agree to the{' '}
            <span className="text-primary underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-primary underline cursor-pointer">Privacy Policy</span> of LawLink.
          </span>
        </label>
      </div>

      <div className="flex gap-md justify-end">
        <button onClick={() => navigate('/user/upload')} className="px-xl py-md rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-2xl py-md rounded-xl bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Submit Case
        </button>
      </div>
    </div>
  );
};

export default Review;
