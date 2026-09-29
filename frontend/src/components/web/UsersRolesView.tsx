import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { UserRole } from '@shared/types';

export const UsersRolesView: React.FC = () => {
  const { usersList, showNotificationToast } = useSimulation();
  const [users, setUsers] = useState(usersList);

  const roles: Record<UserRole, { role: UserRole; desc: string; permissions: string }> = {
    'System Admin': {
      role: 'System Admin',
      desc: 'Full administrative control over tenant, models, audit logs, and security policies.',
      permissions: 'All permissions (Read, Write, Execute, Configure, Audit)',
    },
    'Organization Admin': {
      role: 'Organization Admin',
      desc: 'Manages municipal department users, assigns permissions, exports official data.',
      permissions: 'Manage users, run simulations, export reports, view org audit',
    },
    'Traffic Analyst': {
      role: 'Traffic Analyst',
      desc: 'Creates corridor studies, changes density/alert assumptions, compares outcomes.',
      permissions: 'Create/run scenarios, analyze KPIs, replay, export data',
    },
    'Emergency Planner': {
      role: 'Emergency Planner',
      desc: 'Evaluates ambulance routes and clearance assumptions without controlling live traffic.',
      permissions: 'Configure routes, inspect ETA, replay, generate reports',
    },
    'Transportation Researcher': {
      role: 'Transportation Researcher',
      desc: 'Runs controlled experiments with reproducible seeds and parameter iterations.',
      permissions: 'Deterministic runs, parameter snapshots, machine-readable export',
    },
    'Decision Maker / Viewer': {
      role: 'Decision Maker / Viewer',
      desc: 'Inspects high-level KPI summaries, verifies disclaimers, views reports.',
      permissions: 'Read-only access to completed scenarios and published reports',
    },
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = u.status === 'Active' ? 'Suspended' : 'Active';
          showNotificationToast(`User ${u.name} status updated to ${next}. (FR-ADM-04)`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      <div>
        <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs">
          <span className="material-symbols-outlined text-[16px]">group</span>
          <span className="font-bold uppercase tracking-wider">Access Governance</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Users & Role-Based Access Control (RBAC)
        </h1>
        <p className="text-sm text-slate-600">
          Enforce institutional access policies, manage authenticated accounts, and audit operational permissions.
        </p>
      </div>

      {/* Users Management Table */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Authorized Municipal Operators</h2>
          <span className="text-xs bg-[#eff4ff] text-slate-700 font-semibold px-2.5 py-1 rounded-lg border border-[#dce9ff]">
            {users.filter((u) => u.status === 'Active').length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff] text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-5">Name & Email</th>
                <th className="py-3 px-5">Assigned Role</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Last Activity</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-slate-400 text-[11px]">{u.email}</p>
                  </td>
                  <td className="py-3 px-5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-600">{u.department}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-400">{u.lastActive}</td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        u.status === 'Active'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Matrix Guide */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Institutional Role Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(roles).map(([roleKey, data]) => (
            <div key={roleKey} className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#dce9ff] text-xs">
              <span className="font-bold text-slate-900 block text-sm">{data.role}</span>
              <p className="text-slate-600 mt-1">{data.desc}</p>
              <div className="mt-2 pt-2 border-t border-[#dce9ff] text-[11px] text-slate-500 font-medium">
                <span className="font-bold text-slate-700">Scope:</span> {data.permissions}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
