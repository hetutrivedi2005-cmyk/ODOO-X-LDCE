import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Compass,
  DollarSign,
  History,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [userDetail, setUserDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchUserDetail = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getUserDetails(userId);
      setUserDetail(data);
    } catch (err) {
      console.error('Failed to load user detail:', err);
      setError(err.message || 'Unable to load user profile details.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleStatus = async () => {
    if (!userDetail) return;
    const nextStatus = userDetail.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    if (userDetail.id === currentUser?.id && nextStatus === 'INACTIVE') {
      alert('You cannot deactivate your own active admin account.');
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await adminService.updateUserStatus(userDetail.id, {
        status: nextStatus,
        role: userDetail.role,
      });

      setUserDetail((prev) => ({ ...prev, ...updated }));
      showToast(`User status changed to ${updated.status}.`);
    } catch (err) {
      console.error('Status update failed:', err);
      alert(err.message || 'Failed to update user status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRole = async () => {
    if (!userDetail) return;
    const nextRole = userDetail.role === 'ADMIN' ? 'USER' : 'ADMIN';

    setIsUpdating(true);
    try {
      const updated = await adminService.updateUserStatus(userDetail.id, {
        status: userDetail.status,
        role: nextRole,
      });

      setUserDetail((prev) => ({ ...prev, ...updated }));
      showToast(`User role updated to ${updated.role}.`);
    } catch (err) {
      console.error('Role update failed:', err);
      alert(err.message || 'Failed to update user role.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Flexible';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading user details..." fullScreen={false} />;
  }

  if (error || !userDetail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate('/admin/users')}>
          Back to User Management
        </Button>
        <EmptyState
          icon={Users}
          title="User Not Available"
          description={error || 'The requested user profile was not found.'}
          actionLabel="Back to User List"
          onAction={() => navigate('/admin/users')}
        />
      </div>
    );
  }

  const isSelf = userDetail.id === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-2xl animate-slide-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-2">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate('/admin/users')}>
          Back to User Directory
        </Button>
      </div>

      {/* User Header Profile Card */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center font-black text-white text-xl shadow-lg">
              {userDetail.name ? userDetail.name[0].toUpperCase() : userDetail.email[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">{userDetail.name || 'Unnamed User'}</h1>
                {isSelf && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Current Account
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  {userDetail.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Joined {formatDate(userDetail.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
            <Button
              variant={userDetail.role === 'ADMIN' ? 'outline' : 'secondary'}
              size="sm"
              leftIcon={Shield}
              onClick={handleToggleRole}
              isLoading={isUpdating}
              disabled={isUpdating}
              className="text-xs"
            >
              {userDetail.role === 'ADMIN' ? 'Revoke Admin Role' : 'Grant Admin Privileges'}
            </Button>

            <Button
              variant={userDetail.status === 'ACTIVE' ? 'danger' : 'primary'}
              size="sm"
              leftIcon={userDetail.status === 'ACTIVE' ? UserX : UserCheck}
              onClick={handleToggleStatus}
              isLoading={isUpdating}
              disabled={isUpdating || (isSelf && userDetail.status === 'ACTIVE')}
              className="text-xs"
            >
              {userDetail.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
            </Button>
          </div>
        </div>

        {/* User Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400">Total Trips Created</p>
            <p className="text-2xl font-black text-white mt-1">{userDetail.trips?.length || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400">Activity Log Events</p>
            <p className="text-2xl font-black text-teal-400 mt-1">{userDetail._count?.activityLogs || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400">System Notifications</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{userDetail._count?.notifications || 0}</p>
          </div>
        </div>
      </Card>

      {/* User's Trips Section */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">User Trips ({userDetail.trips?.length || 0})</h3>
          </div>
        </div>

        {userDetail.trips && userDetail.trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userDetail.trips.map((tripItem) => (
              <div
                key={tripItem.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all"
              >
                <h4 className="text-sm font-bold text-white tracking-tight">{tripItem.name}</h4>
                <p className="text-xs text-slate-400">
                  {formatDate(tripItem.startDate)} — {formatDate(tripItem.endDate)}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>{tripItem._count?.stops || 0} Stops</span>
                  <span>•</span>
                  <span>{tripItem._count?.expenses || 0} Expenses</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">This user has not created any trips yet.</div>
        )}
      </Card>
    </div>
  );
};

export default AdminUserDetailPage;
