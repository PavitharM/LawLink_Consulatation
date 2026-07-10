import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, CheckCircle, Clock, Star, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { getAllPackagesAdmin, createPackage, updatePackage, deletePackage } from '../../services/package.service';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', period: 'per case', description: '', features: '' });

  const fetchPackages = async () => {
    try {
      const response = await getAllPackagesAdmin();
      if (response.success) {
        setPackages(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const toggleActive = async (id) => {
    try {
      const pkg = packages.find(p => p.id === id);
      const res = await updatePackage(id, { active: !pkg.active });
      if (res.success) fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (pkg) => {
    setEditItem(pkg);
    setForm({ 
      name: pkg.name, 
      price: pkg.price, 
      period: pkg.period, 
      description: pkg.description || '',
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      const res = await deletePackage(id);
      if (res.success) fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        period: form.period,
        description: form.description || 'No description provided',
        features: form.features.split('\n').filter(f => f.trim() !== '')
      };

      if (editItem) {
        await updatePackage(editItem.id, payload);
      } else {
        await createPackage(payload);
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ name: '', price: '', period: 'per case', description: '', features: '' });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = packages.reduce((acc, p) => acc + p.price * (p._count?.complaints || 0), 0);
  const totalBookings = packages.reduce((acc, p) => acc + (p._count?.complaints || 0), 0);

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;



  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Package Management</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Create and manage the service packages you offer to clients.</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ name: '', price: '', period: 'per case', description: '', features: '' }); setShowForm(true); }}
          className="flex items-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity">
          <PlusCircle size={18} /> Add Package
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Packages', value: packages.length, icon: <Star size={20} className="text-primary" />, bg: 'bg-primary/5' },
          { label: 'Active', value: packages.filter(p => p.active).length, icon: <CheckCircle size={20} className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'Total Bookings', value: totalBookings, icon: <TrendingUp size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} className="text-yellow-600" />, bg: 'bg-yellow-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-md`}>{s.icon}</div>
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className="text-headline-md font-bold text-on-surface mt-xs">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
        {packages.map(pkg => (
          <div key={pkg.id} className={`bg-white border-2 rounded-2xl p-xl shadow-card transition-all
            ${pkg.active ? 'border-surface-container-high hover:border-primary/40' : 'border-dashed border-surface-container-high opacity-60'}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-lg">
              <div>
                <h3 className="text-headline-sm text-on-surface">{pkg.name}</h3>
                <div className="flex items-baseline gap-xs mt-xs">
                  <span className="text-display font-bold text-primary">₹{pkg.price.toLocaleString()}</span>
                  <span className="text-body-sm text-on-surface-variant">{pkg.period}</span>
                </div>
              </div>
              <span className={`text-label-sm px-sm py-xs rounded-full font-semibold ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {pkg.active ? '● Active' : '○ Inactive'}
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-sm mb-xl">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-start gap-sm text-body-sm text-on-surface">
                  <CheckCircle size={14} className="text-green-500 mt-xs shrink-0" /> {f}
                </li>
              ))}
            </ul>

            {/* Bookings */}
            <div className="bg-surface-container-low rounded-xl p-md mb-lg flex items-center justify-between">
              <div>
                <p className="text-label-sm text-on-surface-variant">Bookings</p>
                <p className="text-headline-sm font-bold text-on-surface">{pkg._count?.complaints || 0}</p>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Revenue</p>
                <p className="text-headline-sm font-bold text-primary">₹{(pkg.price * (pkg._count?.complaints || 0)).toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-sm">
              <button onClick={() => openEdit(pkg)} className="flex-1 flex items-center justify-center gap-xs py-sm rounded-xl border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => toggleActive(pkg.id)}
                className={`flex-1 flex items-center justify-center gap-xs py-sm rounded-xl text-body-sm transition-colors border
                  ${pkg.active ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : 'bg-green-600 text-white border-transparent hover:bg-green-700'}`}>
                {pkg.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => handleDelete(pkg.id)} className="p-sm rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button onClick={() => { setEditItem(null); setForm({ name: '', price: '', period: 'per case', description: '', features: '' }); setShowForm(true); }}
          className="border-2 border-dashed border-surface-container-high rounded-2xl p-xl flex flex-col items-center justify-center gap-md hover:border-primary hover:bg-primary/5 transition-all group min-h-[200px]">
          <PlusCircle size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          <p className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors font-medium">Add New Package</p>
        </button>
      </div>

      {/* Edit / Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-lg" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-headline-md text-on-surface mb-xl">{editItem ? 'Edit Package' : 'Create New Package'}</h2>
            <div className="space-y-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Package Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Standard Representation"
                  className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g., 1999"
                    className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Duration *</label>
                  <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary">
                    <option>per session</option>
                    <option>per case</option>
                    <option>per month</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., Best for standard matters"
                  className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Features (one per line) *</label>
                <textarea rows={5} value={form.features} onChange={e => setForm({ ...form, features: e.target.value })}
                  placeholder={"30-minute consultation call\nFull document review\nCourt representation"}
                  className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="flex gap-md justify-end mt-xl">
              <button onClick={() => setShowForm(false)} className="px-lg py-sm rounded-lg border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-lg py-sm rounded-lg bg-primary text-on-primary text-body-md hover:opacity-90 transition-opacity">
                {editItem ? 'Save Changes' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;
