import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Edit2, Trash2, CheckCircle, X,
  Save, Star, Zap, Shield, Crown, Eye, EyeOff,
  AlertCircle, Check, DollarSign, Users, TrendingUp, Loader2
} from 'lucide-react';
import { getAllPackagesAdmin, createPackage, updatePackage, deletePackage } from '../../services/package.service';

const ICON_OPTIONS = [
  { value: 'shield', icon: Shield, label: 'Shield' },
  { value: 'zap',    icon: Zap,    label: 'Lightning' },
  { value: 'crown',  icon: Crown,  label: 'Crown' },
  { value: 'star',   icon: Star,   label: 'Star' },
];

function PackageIcon({ name, size = 28, className = '' }) {
  const map = { shield: Shield, zap: Zap, crown: Crown, star: Star };
  const Icon = map[name] || Package;
  return <Icon size={size} className={className} />;
}

/* ─── Package card ───────────────────────────────────────────── */
function PkgCard({ pkg, onEdit, onToggle, onDelete }) {
  return (
    <div className={`bg-white border-2 rounded-2xl p-xl shadow-card transition-all duration-200 ${pkg.active ? 'border-surface-container-high hover:border-primary/30' : 'border-red-200 opacity-70'}`}>
      <div className="flex items-start justify-between mb-lg">
        <div className="flex items-center gap-md">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            pkg.icon === 'shield' ? 'bg-primary/10' :
            pkg.icon === 'zap'   ? 'bg-yellow-50'  :
            pkg.icon === 'crown' ? 'bg-purple-50'  : 'bg-blue-50'}`}>
            <PackageIcon name={pkg.icon} size={24} className={
              pkg.icon === 'shield' ? 'text-primary' :
              pkg.icon === 'zap'    ? 'text-yellow-600' :
              pkg.icon === 'crown'  ? 'text-purple-600' : 'text-blue-600'} />
          </div>
          <div>
            <h3 className="text-headline-sm text-on-surface">{pkg.name}</h3>
            {pkg.badge && (
              <span className="text-label-sm bg-primary text-on-primary px-sm py-xs rounded-full font-semibold">{pkg.badge}</span>
            )}
          </div>
        </div>
        <div className={`text-label-sm px-sm py-xs rounded-full font-semibold ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {pkg.active ? 'Active' : 'Hidden'}
        </div>
      </div>

      <p className="text-body-sm text-on-surface-variant mb-lg leading-relaxed">{pkg.description}</p>

      <div className="flex items-baseline gap-xs mb-lg">
        <span className="text-display font-bold text-primary">₹{pkg.price.toLocaleString('en-IN')}</span>
        <span className="text-body-sm text-on-surface-variant">{pkg.period}</span>
      </div>

      {/* Stats row */}
      <div className="flex gap-md mb-lg">
        <div className="flex-1 bg-surface-container-low rounded-xl p-sm text-center">
          <p className="text-body-md font-bold text-on-surface">{pkg._count?.complaints || 0}</p>
          <p className="text-label-sm text-on-surface-variant">Usage (Cases)</p>
        </div>
        <div className="flex-1 bg-surface-container-low rounded-xl p-sm text-center">
          <p className="text-body-md font-bold text-green-600">₹{((pkg._count?.complaints || 0) * pkg.price).toLocaleString('en-IN')}</p>
          <p className="text-label-sm text-on-surface-variant">Est. Revenue</p>
        </div>
      </div>

      {/* Features preview */}
      <ul className="space-y-xs mb-lg">
        {pkg.features.slice(0, 3).map((f, i) => (
          <li key={i} className="flex items-start gap-xs text-body-sm text-on-surface">
            <Check size={14} className="text-green-500 mt-xs shrink-0" /> {f}
          </li>
        ))}
        {pkg.features.length > 3 && (
          <li className="text-body-sm text-on-surface-variant pl-md">+{pkg.features.length - 3} more features</li>
        )}
      </ul>

      {/* Action buttons */}
      <div className="flex gap-sm">
        <button onClick={() => onEdit(pkg)}
          className="flex-1 flex items-center justify-center gap-xs px-md py-sm rounded-xl border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
          <Edit2 size={14} /> Edit
        </button>
        <button onClick={() => onToggle(pkg.id)}
          className={`flex items-center gap-xs px-md py-sm rounded-xl text-body-sm transition-colors ${pkg.active ? 'border border-yellow-300 text-yellow-700 hover:bg-yellow-50' : 'border border-green-300 text-green-700 hover:bg-green-50'}`}>
          {pkg.active ? <EyeOff size={14} /> : <Eye size={14} />}
          {pkg.active ? 'Hide' : 'Show'}
        </button>
        <button onClick={() => onDelete(pkg.id)}
          className="p-sm rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Edit / Create Modal ────────────────────────────────────── */
function PackageModal({ pkg, onSave, onClose }) {
  const isNew = !pkg?.id;
  const [form, setForm] = useState(pkg || {
    name: '', price: '', period: 'per case',
    description: '', icon: 'shield', badge: '', active: true, features: [''],
  });
  const [featureInput, setFeatureInput] = useState('');
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addFeature = () => {
    if (!featureInput.trim()) return;
    set('features', [...form.features.filter(f => f), featureInput.trim()]);
    setFeatureInput('');
  };

  const removeFeature = (i) => set('features', form.features.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = 'Name is required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.features.filter(f => f).length === 0) e.features = 'Add at least one feature';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...form,
      price: Number(form.price),
      features: form.features.filter(f => f),
    });
    onClose();
  };

  const inputCls = "w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-lg" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-xl border-b border-surface-container-high sticky top-0 bg-white">
          <h2 className="text-headline-sm text-on-surface">{isNew ? 'Create New Package' : 'Edit Package'}</h2>
          <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container text-on-surface-variant"><X size={18} /></button>
        </div>

        <div className="p-xl space-y-lg">
          {/* Name */}
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Package Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g., Premium Full Service" className={inputCls} />
            {errors.name && <p className="text-body-sm text-red-500 mt-xs">{errors.name}</p>}
          </div>

          {/* Price + period */}
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g., 1999" className={inputCls} />
              {errors.price && <p className="text-body-sm text-red-500 mt-xs">{errors.price}</p>}
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Period</label>
              <select value={form.period} onChange={e => set('period', e.target.value)} className={`${inputCls} bg-white`}>
                <option>per case</option>
                <option>per month</option>
                <option>per year</option>
                <option>one-time</option>
              </select>
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Badge Label (optional)</label>
            <input value={form.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="e.g., Most Popular" className={inputCls} />
          </div>

          {/* Icon */}
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Icon</label>
            <div className="flex gap-sm">
              {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button key={value} type="button" onClick={() => set('icon', value)}
                  className={`flex-1 flex flex-col items-center gap-xs p-md rounded-xl border-2 transition-all
                    ${form.icon === value ? 'border-primary bg-primary/5' : 'border-surface-container-high hover:border-primary/30'}`}>
                  <Icon size={20} className="text-primary" />
                  <span className="text-label-sm text-on-surface-variant">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Description *</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Brief description of this package..." className={`${inputCls} resize-none`} />
            {errors.description && <p className="text-body-sm text-red-500 mt-xs">{errors.description}</p>}
          </div>

          {/* Features */}
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Features *</label>
            <div className="space-y-xs mb-sm">
              {form.features.filter(f => f).map((f, i) => (
                <div key={i} className="flex items-center gap-sm bg-surface-container-low rounded-lg px-md py-sm">
                  <Check size={14} className="text-green-500 shrink-0" />
                  <span className="flex-1 text-body-sm text-on-surface">{f}</span>
                  <button onClick={() => removeFeature(i)} className="text-red-500 hover:text-red-700 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-sm">
              <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                placeholder="Type a feature and press Enter or click Add"
                className={`${inputCls} flex-1`} />
              <button onClick={addFeature} className="px-md py-sm rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity">
                Add
              </button>
            </div>
            {errors.features && <p className="text-body-sm text-red-500 mt-xs">{errors.features}</p>}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-lg py-md">
            <div>
              <p className="text-body-md font-medium text-on-surface">Package Active</p>
              <p className="text-body-sm text-on-surface-variant">Show this package to users on the checkout page</p>
            </div>
            <button onClick={() => set('active', !form.active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-primary' : 'bg-surface-container-high'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-sm justify-end px-xl pb-xl">
          <button onClick={onClose} className="px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={handleSave}
            className="flex items-center gap-sm px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity">
            <Save size={16} /> {isNew ? 'Create Package' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const ManagePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,    setModal]    = useState(null); // null | 'new' | package object
  const [delConfirm, setDelConfirm] = useState(null);
  const [saved,    setSaved]    = useState(false);

  const fetchPackages = async () => {
    try {
      const response = await getAllPackagesAdmin();
      if (response.success) {
        setPackages(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSave = async (updated) => {
    try {
      let response;
      if (updated.id) {
        response = await updatePackage(updated.id, updated);
      } else {
        response = await createPackage(updated);
      }
      if (response.success) {
        fetchPackages();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      const pkg = packages.find(p => p.id === id);
      if (!pkg) return;
      const response = await updatePackage(id, { active: !pkg.active });
      if (response.success) {
        fetchPackages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deletePackage(id);
      if (response.success) {
        fetchPackages();
        setDelConfirm(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalSubs = packages.reduce((s, p) => s + (p._count?.complaints || 0), 0);
  const totalRevenueNum = packages.reduce((s, p) => s + ((p._count?.complaints || 0) * p.price), 0);
  const totalRevenue = `₹${totalRevenueNum.toLocaleString('en-IN')}`;

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Package Management</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Create, edit and manage legal service packages shown to clients.
          </p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-sm px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity shadow-md">
          <Plus size={18} /> Add New Package
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-sm bg-green-50 border border-green-200 rounded-xl px-lg py-md mb-lg">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-body-md text-green-700 font-medium">Package saved successfully!</p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Packages', value: packages.length,                             color: 'text-primary',    bg: 'bg-primary/5',   icon: <Package  size={20} className="text-primary" /> },
          { label: 'Active',         value: packages.filter(p => p.active).length,        color: 'text-green-600',  bg: 'bg-green-50',    icon: <Eye      size={20} className="text-green-600" /> },
          { label: 'Total Subscribers', value: totalSubs,                                color: 'text-blue-600',   bg: 'bg-blue-50',     icon: <Users    size={20} className="text-blue-600" /> },
          { label: 'Total Revenue',  value: totalRevenue,                                 color: 'text-purple-600', bg: 'bg-purple-50',   icon: <TrendingUp size={20} className="text-purple-600" /> },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-surface-container-high rounded-2xl p-lg shadow-card`}>
            <div className="flex items-center justify-between mb-sm">{s.icon}</div>
            <p className={`text-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Package cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-xl mb-xl">
        {packages.map(pkg => (
          <PkgCard
            key={pkg.id}
            pkg={pkg}
            onEdit={p => setModal(p)}
            onToggle={handleToggle}
            onDelete={id => setDelConfirm(id)}
          />
        ))}

        {/* Add new card */}
        <button onClick={() => setModal('new')}
          className="flex flex-col items-center justify-center gap-md bg-white border-2 border-dashed border-outline-variant rounded-2xl p-xl text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/[0.02] transition-all duration-200 min-h-[300px]">
          <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center">
            <Plus size={28} />
          </div>
          <p className="text-body-md font-medium">Add New Package</p>
          <p className="text-body-sm opacity-60">Create a custom legal service package</p>
        </button>
      </div>

      {/* Edit / Create modal */}
      {modal !== null && (
        <PackageModal
          pkg={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-lg">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-xl">
            <div className="flex items-center gap-md mb-lg">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-headline-sm text-on-surface">Delete Package?</h3>
                <p className="text-body-sm text-on-surface-variant">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDelConfirm(null)} className="px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={() => handleDelete(delConfirm)} className="px-lg py-sm rounded-xl bg-red-600 text-white text-body-md font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePackages;
