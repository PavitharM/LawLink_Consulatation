import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Scale, FileText, Briefcase, FileQuestion,
  Bell, PlusCircle, BarChart3, Package, MessageSquare, User, X
} from 'lucide-react';
import { getAdminStats } from '../services/admin.service';
import { getComplaints } from '../services/complaint.service';

const sectionTitles = {
  admin: 'Administration',
  user: 'My Account',
  lawyer: 'Lawyer Portal',
};

const Sidebar = ({ role, onClose }) => {
  const [adminStats, setAdminStats] = useState(null);
  const [lawyerPending, setLawyerPending] = useState(0);

  useEffect(() => {
    if (role === 'admin') {
      getAdminStats()
        .then(r => { if (r.success) setAdminStats(r.data); })
        .catch(() => {});
    } else if (role === 'lawyer') {
      getComplaints()
        .then(r => {
          if (r.success) {
            const pending = r.data.filter(c => c.status === 'OPEN').length;
            setLawyerPending(pending);
          }
        })
        .catch(() => {});
    }
  }, [role]);

  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users', badge: adminStats ? `${adminStats.totalUsers}` : null },
    {
      to: '/admin/lawyers',
      icon: <Scale size={18} />,
      label: 'Lawyers',
      badge: adminStats ? `${adminStats.totalLawyers}` : null,
    },
    {
      to: '/admin/complaints',
      icon: <Briefcase size={18} />,
      label: 'Complaints',
      badge: adminStats && adminStats.unassignedComplaints > 0 ? `${adminStats.unassignedComplaints} unassigned` : adminStats ? `${adminStats.totalComplaints}` : null,
      badgeColor: adminStats && adminStats.unassignedComplaints > 0 ? 'bg-red-100 text-red-700' : null,
    },
    { to: '/admin/packages', icon: <Package size={18} />, label: 'Packages' },
    { to: '/admin/articles', icon: <FileText size={18} />, label: 'Articles', badge: adminStats ? `${adminStats.totalArticles}` : null },
    { to: '/admin/report', icon: <BarChart3 size={18} />, label: 'Reports' },
    { to: '/admin/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/admin/profile', icon: <User size={18} />, label: 'My Profile' },
  ];

  const userLinks = [
    { to: '/user', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/user/complaints/new', icon: <PlusCircle size={18} />, label: 'New Complaint', highlight: true },
    { to: '/user/complaints', icon: <FileQuestion size={18} />, label: 'My Complaints' },
    { to: '/user/lawyers/search', icon: <Users size={18} />, label: 'Find a Lawyer' },
    { to: '/user/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/user/consultation', icon: <MessageSquare size={18} />, label: 'Consultation' },
    { to: '/user/profile', icon: <User size={18} />, label: 'My Profile' },
  ];

  const lawyerLinks = [
    { to: '/lawyer', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    {
      to: '/lawyer/assigned-complaints',
      icon: <Briefcase size={18} />,
      label: 'Assigned Cases',
      badge: lawyerPending > 0 ? `${lawyerPending} new` : null,
      badgeColor: lawyerPending > 0 ? 'bg-orange-100 text-orange-700' : null,
    },
    { to: '/lawyer/packages', icon: <Package size={18} />, label: 'My Packages' },
    { to: '/lawyer/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/lawyer/profile', icon: <User size={18} />, label: 'My Profile' },
  ];

  let links = [];
  if (role === 'admin') links = adminLinks;
  else if (role === 'lawyer') links = lawyerLinks;
  else if (role === 'user') links = userLinks;

  const title = sectionTitles[role] || '';

  return (
    <aside className="w-[240px] h-full shrink-0 bg-white border-r border-surface-container-high flex flex-col py-lg overflow-y-auto shadow-lg lg:shadow-none">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-lg mb-md lg:hidden">
        <div className="flex items-center gap-sm text-primary">
          <Scale size={20} />
          <span className="text-headline-sm font-bold">LawLink</span>
        </div>
        <button
          onClick={onClose}
          className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Section Title */}
      <p className="text-label-sm text-on-surface-variant px-lg mb-md uppercase tracking-widest">{title}</p>

      <nav className="flex flex-col gap-xs flex-1">
        {links.map((link, index) => (
          <NavLink
            key={index}
            to={link.to}
            end={link.to === '/admin' || link.to === '/user' || link.to === '/lawyer'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-lg py-sm text-body-md no-underline transition-all duration-150 rounded-none border-l-[3px] group ` +
              (isActive
                ? 'bg-primary/5 text-primary border-primary font-semibold'
                : 'text-on-surface-variant border-transparent hover:bg-surface-container-low hover:text-on-surface')
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-md">
                  <span className={`transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                    {link.icon}
                  </span>
                  <span className={link.highlight && !isActive ? 'text-primary font-semibold' : ''}>{link.label}</span>
                </div>
                <div className="flex items-center gap-xs">
                  {link.badge && (
                    <span className={`text-label-sm px-xs py-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold text-xs ${link.badgeColor || 'bg-surface-container-high text-on-surface-variant'}`}>
                      {link.badge}
                    </span>
                  )}
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Status */}
      <div className="mt-auto px-lg pt-lg border-t border-surface-container-high">
        <div className={`flex items-center gap-sm p-md rounded-xl ${role === 'admin' ? 'bg-red-50' : role === 'lawyer' ? 'bg-blue-50' : 'bg-green-50'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${role === 'admin' ? 'bg-red-500' : role === 'lawyer' ? 'bg-blue-500' : 'bg-green-500'}`} />
          <div>
            <p className="text-label-sm font-semibold text-on-surface capitalize">{role}</p>
            <p className="text-body-sm text-on-surface-variant">Active session</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
