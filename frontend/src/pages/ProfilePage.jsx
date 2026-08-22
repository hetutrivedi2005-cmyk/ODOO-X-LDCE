import React from 'react';
import { User, Mail, Globe, Shield, Bell, Settings } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const ProfilePage = () => {
  return (
    <PageContainer
      title="User Profile"
      subtitle="Manage your GlobeTrotter account details, travel preferences, and security settings."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="text-center p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-teal-500/20 mb-4 border-2 border-slate-700">
            JD
          </div>
          <h3 className="text-lg font-bold text-white">Jane Doe</h3>
          <p className="text-xs text-slate-400 mt-0.5">jane.doe@example.com</p>
          <div className="mt-3">
            <Badge variant="primary">Pro GlobeTrotter</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Avid explorer, photography enthusiast, and frequent traveler across Asia and Europe.
          </p>
        </Card>

        {/* Account Details Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and travel profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue="Jane Doe" leftIcon={User} />
              <Input label="Email Address" defaultValue="jane.doe@example.com" leftIcon={Mail} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Home Currency" defaultValue="USD ($)" leftIcon={Globe} />
              <Input label="Language" defaultValue="English (US)" leftIcon={Settings} />
            </div>
            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
