import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock3, User, Briefcase, Package, FileText, Upload, ArrowRight, RefreshCw, WifiOff } from 'lucide-react';
import { getComplaintById } from '../../services/complaint.service';
import { fileUrl } from '../../services/api';
import { formatLKR } from '../../utils/currency';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { caseRef } from '../../components/ui/status';
import EmptyState from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';

const DOC_LABELS = { id: 'ID proof', idProof: 'ID proof', complaint: 'Complaint letter', evidence: 'Evidence', other: 'Other' };
const fileName = (url = '') => decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'document');
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Summary of a submitted case (?case=<id>). Previously this page showed
 * hard-coded sample data; without a case id there is nothing to review.
 */
const Review = () => {
  const [params] = useSearchParams();
  const caseId = params.get('case');
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(!!caseId);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await getComplaintById(caseId);
      if (res.success) setC(res.data);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Could not load this case.');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { load(); }, [load]);

  if (!caseId) return <Navigate to="/user/complaints" replace />;
  if (loading) return <PageSkeleton stats={0} rows={3} />;
  if (!c) {
    return (
      <div className="bg-white border border-surface-container-high rounded-xl shadow-card max-w-3xl mx-auto">
        <EmptyState
          icon={WifiOff}
          title="Can't load this case"
          description={error || 'It may have been removed.'}
          action={{ label: 'Try again', onClick: load, icon: <RefreshCw size={16} /> }}
        />
      </div>
    );
  }

  const docs = c.documents || [];
  const sections = [
    {
      icon: User,
      title: 'Your information',
      items: [['Full name', c.client?.name], ['Email', c.client?.email], ['Phone', c.client?.phone]],
    },
    {
      icon: Briefcase,
      title: 'Case details',
      items: [
        ['Category', c.category],
        ['Title', c.title],
        ['Description', c.description],
        ...(c.location ? [['Location', c.location]] : []),
        ...(c.incidentDate ? [['Incident date', fmt(c.incidentDate)]] : []),
      ],
    },
    {
      icon: Package,
      title: 'Package & lawyer',
      items: [
        ['Package', c.package?.name || 'Not selected'],
        ...(c.package ? [['Price', `${formatLKR(c.package.price)} ${c.package.period || ''}`.trim()]] : []),
        ['Lawyer', c.assignedTo?.name || 'Awaiting assignment'],
      ],
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-xl">
        <p className="text-label-sm uppercase tracking-widest text-on-surface-variant mb-xs">Case summary</p>
        <h1 className="text-headline-lg text-on-surface">{c.title}</h1>
        <div className="flex flex-wrap items-center gap-sm mt-md">
          <span className="text-label-sm font-mono font-semibold text-primary bg-primary/5 px-sm py-0.5 rounded">{caseRef(c.id)}</span>
          <StatusBadge status={c.status} />
          <PriorityBadge priority={c.priority} />
          <span className="text-body-sm text-on-surface-variant">Filed {fmt(c.createdAt)}</span>
        </div>
      </div>

      <div className={`rounded-xl p-lg mb-xl flex items-center gap-md border ${c.assignedTo ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-primary/5 border-primary/20 text-primary'}`}>
        {c.assignedTo ? <CheckCircle2 size={20} /> : <Clock3 size={20} />}
        <p className="text-body-md font-medium">
          {c.assignedTo
            ? `${c.assignedTo.name} is handling your case.`
            : "Your case is submitted — we'll notify you as soon as a lawyer is assigned."}
        </p>
      </div>

      <div className="space-y-lg mb-xl">
        {sections.map(({ icon: Icon, title, items }) => (
          <section key={title} className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h2 className="text-headline-sm text-on-surface flex items-center gap-sm mb-lg">
              <Icon size={20} className="text-primary" /> {title}
            </h2>
            <dl className="space-y-md">
              {items.map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-xs">
                  <dt className="text-label-sm text-on-surface-variant min-w-[160px]">{label}</dt>
                  <dd className="text-body-md text-on-surface flex-1 whitespace-pre-line">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="text-headline-sm text-on-surface flex items-center gap-sm">
              <FileText size={20} className="text-primary" /> Documents ({docs.length})
            </h2>
            <Link to={`/user/upload?case=${c.id}&from=details`} className="flex items-center gap-xs text-body-sm text-primary font-medium no-underline hover:underline">
              <Upload size={14} /> Add documents
            </Link>
          </div>
          {docs.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-surface-container-high">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-md py-sm">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md text-on-surface">{DOC_LABELS[d.type] || d.type}</p>
                    <a href={fileUrl(d.url)} target="_blank" rel="noopener noreferrer" className="text-body-sm text-on-surface-variant hover:text-primary truncate block no-underline">
                      {fileName(d.url)}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-md justify-end">
        <Link to="/user" className="text-center px-xl py-md rounded-xl border border-outline-variant text-body-md font-semibold text-on-surface no-underline hover:bg-surface-container-low transition-colors">
          Go to dashboard
        </Link>
        <Link to={`/user/complaints/${c.id}`} className="flex items-center justify-center gap-sm px-2xl py-md rounded-xl bg-primary text-on-primary text-body-md font-semibold no-underline hover:bg-primary-container transition-colors">
          View case <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default Review;
