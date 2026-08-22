import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <EmptyState
        icon={Compass}
        title="404 - Page Not Found"
        description="The travel destination or page you are looking for does not exist."
        actionLabel="Return to Dashboard"
        onAction={() => navigate('/dashboard')}
        className="max-w-md bg-slate-900 border-slate-800"
      />
    </div>
  );
};

export default NotFoundPage;
