import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Search, Clock, CheckCircle, XCircle, FileText, X, Save, Loader2 } from 'lucide-react';
import { getAllArticlesAdmin, createArticle, updateArticle, deleteArticle } from '../../services/article.service';

const statusConfig = {
  PUBLISHED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DRAFT: { color: 'bg-gray-100 text-gray-600', icon: Clock },
};

const ManageArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null, 'new', or article object
  const [toast, setToast] = useState(null);

  const fetchArticles = async () => {
    try {
      const response = await getAllArticlesAdmin();
      if (response.success) {
        setArticles(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      const response = await deleteArticle(id);
      if (response.success) {
        fetchArticles();
        setToast('Article deleted successfully.');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (form, status) => {
    try {
      let response;
      const data = { ...form, status };
      if (form.id) {
        response = await updateArticle(form.id, data);
      } else {
        response = await createArticle(data);
      }
      if (response.success) {
        fetchArticles();
        setModal(null);
        setToast(`Article ${status === 'PUBLISHED' ? 'published' : 'saved as draft'}.`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Manage Articles</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Create and manage legal knowledge articles for users.</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-sm px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity shadow-md"
        >
          <PlusCircle size={18} /> New Article
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-sm bg-green-50 border border-green-200 rounded-xl px-lg py-md mb-lg">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-body-md text-green-700 font-medium">{toast}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Articles', value: articles.length, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Published', value: articles.filter(a => a.status === 'PUBLISHED').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Drafts', value: articles.filter(a => a.status === 'DRAFT').length, color: 'text-gray-600', bg: 'bg-surface-container' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-surface-container-high rounded-2xl p-lg shadow-card text-center`}>
            <p className={`text-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card mb-lg">
        <div className="relative">
          <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text" placeholder="Search articles by title or category..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-md py-sm border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
        {filtered.map(article => {
          const StatusIcon = statusConfig[article.status]?.icon || statusConfig['DRAFT'].icon;
          const statusColor = statusConfig[article.status]?.color || statusConfig['DRAFT'].color;
          return (
            <div key={article.id} className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-md">
                <div className="flex items-center gap-sm flex-wrap">
                  <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{article.category}</span>
                  <span className={`text-label-sm px-sm py-xs rounded-full font-semibold flex items-center gap-xs ${statusColor}`}>
                    <StatusIcon size={12} /> {article.status}
                  </span>
                </div>
                <div className="flex items-center gap-xs">
                  <button onClick={() => setModal(article)} className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(article.id)} className="p-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              
              <h3 className="text-headline-sm text-on-surface mb-sm line-clamp-2 leading-snug">{article.title}</h3>
              <p className="text-body-md text-on-surface-variant mb-lg line-clamp-3 flex-1">{article.excerpt}</p>
              
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant border-t border-surface-container-high pt-md mt-auto">
                <span className="font-medium">✍️ {article.author?.name || 'Admin'}</span>
                <span className="flex gap-md">
                  <span>📅 {new Date(article.createdAt).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                  {article.status === 'PUBLISHED' && <span>👁️ {article.views || 0}</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Editor Modal */}
      {modal !== null && (
        <ArticleModal
          article={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

/* ─── Editor Modal ───────────────────────────────────────────── */
function ArticleModal({ article, onSave, onClose }) {
  const isNew = !article;
  const [form, setForm] = useState(article || { title: '', category: 'Civil Law', excerpt: '' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-xl border-b border-surface-container-high sticky top-0 bg-white">
          <h2 className="text-headline-sm text-on-surface">{isNew ? 'Create New Article' : 'Edit Article'}</h2>
          <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container text-on-surface-variant"><X size={18} /></button>
        </div>

        <div className="p-xl space-y-lg">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Article Title *</label>
            <input
              type="text" placeholder="Enter article title..."
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-outline-variant rounded-xl p-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Category *</label>
            <select
              value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-outline-variant rounded-xl p-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white transition-all"
            >
              {['Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Consumer Law', 'Property Law', 'Corporate Law'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Excerpt / Content Summary *</label>
            <textarea
              rows={4} placeholder="Write the article content or summary here..."
              value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
              className="w-full border border-outline-variant rounded-xl p-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-all"
            />
          </div>
          
          <div className="bg-surface-container-low border-l-4 border-primary p-md rounded-r-xl">
            <p className="text-body-sm text-on-surface-variant">
              In a full implementation, a rich text editor (like Draft.js or Quill) would be integrated here for complete article authoring.
            </p>
          </div>
        </div>

        <div className="flex gap-md justify-end p-xl border-t border-surface-container-high bg-surface-container-low/50">
          <button onClick={onClose} className="px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={() => onSave(form, 'DRAFT')} className="px-lg py-sm rounded-xl border border-primary text-primary text-body-md font-medium hover:bg-primary/5 transition-colors">Save as Draft</button>
          <button onClick={() => onSave(form, 'PUBLISHED')} disabled={!form.title || !form.excerpt} className="flex items-center gap-xs px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            <Save size={16} /> Publish Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageArticles;
