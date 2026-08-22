import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation Modal state
  const [targetUserForStatus, setTargetUserForStatus] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState('');
  const [newRoleValue, setNewRoleValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchUsersData = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminService.getUsers({
          page: pageToLoad,
          limit: 15,
          search: searchTerm,
          role: roleFilter,
          status: statusFilter,
        });

        setUsers(data.users || []);
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      } catch (err) {
        console.error('Failed to load users:', err);
        setError(err.message || 'Unable to load user accounts.');
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, roleFilter, statusFilter]
  );

  useEffect(() => {
    fetchUsersData(1);
  }, [fetchUsersData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenStatusModal = (userItem, nextStatus, nextRole = '') => {
    setTargetUserForStatus(userItem);
    setNewStatusValue(nextStatus);
    setNewRoleValue(nextRole || userItem.role);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetUserForStatus) return;

    if (targetUserForStatus.id === currentUser?.id && newStatusValue === 'INACTIVE') {
      alert('You cannot deactivate your own active admin account.');
      setTargetUserForStatus(null);
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await adminService.updateUserStatus(targetUserForStatus.id, {
        status: newStatusValue,
        role: newRoleValue,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserForStatus.id ? { ...u, ...updated } : u))
      );

      showToast(`User ${updated.name || updated.email} status updated to ${updated.status} (${updated.role}).`);
      setTargetUserForStatus(null);
    } catch (err) {
      console.error('Status update failed:', err);
      alert(err.message || 'Failed to update user status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-2xl animate-slide-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="primary" icon={Users}>
              Platform User Directory
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">User Management</h1>
            <p className="text-xs text-slate-400">
              Inspect user accounts, manage active/inactive status, assign admin permissions, and view account metrics.
            </p>
          </div>

          <Badge variant="success" className="text-xs">
            {pagination.total} Registered User{pagination.total === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search users by name or email address..."
            leftIcon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins Only</option>
            <option value="USER">Users Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      {isLoading ? (
        <LoadingState message="Loading user directory..." fullScreen={false} />
      ) : error ? (
        <EmptyState
          icon={Users}
          title="Unable to load users"
          description={error}
          actionLabel="Retry"
          onAction={() => fetchUsersData(1)}
        />
      ) : users.length > 0 ? (
        <Card className="bg-slate-900/80 border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Trips</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((item) => {
                  const isCurrentAdmin = item.id === currentUser?.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {item.name ? item.name[0].toUpperCase() : item.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs flex items-center gap-1.5">
                              {item.name || 'Unnamed User'}
                              {isCurrentAdmin && (
                                <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 font-medium text-slate-200">{item.email}</td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        {item.role === 'ADMIN' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            USER
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {item.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            INACTIVE
                          </span>
                        )}
                      </td>

                      {/* Trips Count */}
                      <td className="px-5 py-3.5 font-semibold text-slate-300">
                        {item._count?.trips || 0} trip{(item._count?.trips || 0) === 1 ? '' : 's'}
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-3.5 text-slate-400">{formatDate(item.createdAt)}</td>

                      {/* Action Buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${item.id}`)}
                            className="p-1.5 h-7 text-[11px]"
                            title="View User Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Toggle Status Action */}
                          {item.status === 'ACTIVE' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isCurrentAdmin}
                              onClick={() => handleOpenStatusModal(item, 'INACTIVE')}
                              className="p-1.5 h-7 text-[11px] hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400"
                              title={isCurrentAdmin ? 'Cannot deactivate self' : 'Deactivate User'}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenStatusModal(item, 'ACTIVE')}
                              className="p-1.5 h-7 text-[11px] hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-400"
                              title="Activate User"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
                <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total} total users)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsersData(pagination.page - 1)}
                  className="p-1.5 h-7"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsersData(pagination.page + 1)}
                  className="p-1.5 h-7"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={Users}
          title="No users match your criteria"
          description="Try adjusting your search query or role/status filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setRoleFilter('ALL');
            setStatusFilter('ALL');
          }}
        />
      )}

      {/* Confirmation Modal */}
      {targetUserForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setTargetUserForStatus(null)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button onClick={() => setTargetUserForStatus(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Confirm Status Change</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to change the status of <span className="font-semibold text-white">"{targetUserForStatus.name || targetUserForStatus.email}"</span> to{' '}
                <span className="font-bold text-rose-400 uppercase">{newStatusValue}</span>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setTargetUserForStatus(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmStatusChange} isLoading={isUpdating} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Confirm Change'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
