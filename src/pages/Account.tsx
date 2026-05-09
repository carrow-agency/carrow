import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCurrentUserFromConvex, useAuthFunctions, usePlans, useSettings, useMyOrders, useMyWorks, useMyFiles, useCreatePlanRequest, useMonthlyReportsByUser } from '../lib/useConvex';
import { useAppStore } from '../lib/store';
import { User, FileText, BarChart3, Settings, LogOut, Clock, CheckCircle2, Download, Package, FolderOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MonthlyReportViewer } from '../components/reports/MonthlyReportViewer';


function ExpiryCountdown({ expiryDate }: { expiryDate: string | null }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!expiryDate) return;

    const calculateTimeLeft = () => {
      const diff = new Date(expiryDate).getTime() - new Date().getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!expiryDate) return null;

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;
  const isExpiringSoon = !isExpired && timeLeft.days <= 7;

  return (
    <div className={`px-4 py-2 rounded-lg ${isExpired ? 'bg-red-100 text-red-700' : isExpiringSoon ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
      <div className="flex items-center gap-2">
        <Clock size={16} />
        <span className="font-mono font-semibold">
          {isExpired ? 'Expired' : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
        </span>
      </div>
    </div>
  );
}

export default function Account() {
  const { setAuthOpen, whatsappNumber: storeWhatsapp } = useAppStore();
  const currentUser = useCurrentUserFromConvex();
  const plans = usePlans() ?? [];
  const settings = useSettings();
  const orders = useMyOrders();
  const { signOut } = useAuthFunctions();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [requestType, setRequestType] = useState<'renewal' | 'upgrade' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const myWorks = useMyWorks();
  const myFiles = useMyFiles();
  const monthlyReports = useMonthlyReportsByUser(currentUser?.id ?? null);
  const createPlanRequest = useCreatePlanRequest();

  const filesLoading = myFiles === null && currentUser !== null;
  const reportsLoading = monthlyReports === undefined;

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading account...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const activePlan = plans.find(p => p.id === currentUser.planId) || null;
  const waNumber = settings?.general?.whatsapp || storeWhatsapp;
  const userOrders = orders ?? [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'plan', label: 'My Plan', icon: Package },
    { id: 'works', label: 'My Works', icon: FolderOpen },
    { id: 'files', label: 'My Files', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRequest = async () => {
    if (!requestType || !currentUser) return;
    setRequesting(true);
    try {
      await createPlanRequest({
        type: requestType,
        planName: requestType === 'upgrade' ? selectedPlan : undefined,
        previousPlan: activePlan?.name,
      });
      setRequestType(null);
      setSelectedPlan('');
      alert('Request submitted! Admin will review it.');
    } catch (e) {
      alert('Failed to submit request');
    }
    setRequesting(false);
  };

  const otherPlans = plans?.filter(p => p.id !== currentUser.planId) || [];

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 fixed h-full left-0 top-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="font-serif text-2xl font-bold text-gray-900">Carrow</h1>
          <p className="text-xs text-gray-500 mt-1">Client Dashboard</p>
        </div>

        <nav className="p-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Tab Bar */}
      <div className="md:hidden">
        <div className="bg-white border-b border-gray-200 px-4 pt-16">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="font-serif text-xl font-bold text-gray-900">Carrow</h1>
              <p className="text-[11px] text-gray-500">Client Dashboard</p>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-1 pb-3 px-4 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-4 md:pt-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500 mt-1">Welcome back, {currentUser.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentUser.planStatus === 'active' ? 'bg-green-100 text-green-700' :
                currentUser.planStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {currentUser.planStatus === 'active' ? 'Active' : 
                 currentUser.planStatus === 'pending' ? 'Pending' : 'No Plan'}
              </span>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Package size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Current Plan</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {activePlan?.name || 'No Plan'}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Plan Expires In</span>
                  </div>
                  <ExpiryCountdown expiryDate={currentUser.planExpiry} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderOpen size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-500">My Works</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {myWorks?.length || 0}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Account Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{currentUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan Status</p>
                    <p className="font-medium text-gray-900 capitalize">{currentUser.planStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">{currentUser.registered || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MY PLAN TAB */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              {activePlan ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{activePlan.name}</h3>
                      <p className="text-gray-500">{activePlan.tagline}</p>
                    </div>
                    <ExpiryCountdown expiryDate={currentUser.planExpiry} />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Plan Features</h4>
                    <ul className="space-y-3">
                      {activePlan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 size={18} className="text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Request Buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</h4>
                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setRequestType('renewal')}
                        disabled={!currentUser.planExpiry}
                      >
                        Request Renewal
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setRequestType('upgrade')}
                      >
                        Request Upgrade
                      </Button>
                    </div>

                    {/* Request Form */}
                    {requestType && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                          {requestType === 'renewal' ? 'Request Plan Renewal' : 'Select Plan to Upgrade'}
                        </p>
                        {requestType === 'upgrade' && (
                          <select
                            value={selectedPlan}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Select a plan...</option>
                            {otherPlans.map(plan => (
                              <option key={plan.id} value={plan.name}>{plan.name}</option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleRequest} disabled={requesting}>
                            {requesting ? 'Submitting...' : 'Submit Request'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRequestType(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-500 mb-4">You don't have an active plan yet.</p>
                  <Button onClick={() => navigate('/#plans')}>View Plans</Button>
                </div>
              )}
            </div>
          )}

          {/* MY WORKS TAB */}
          {activeTab === 'works' && (
            <div>
              {myWorks && myWorks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myWorks.map(work => (
                    <div key={work._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-video bg-gray-100">
                        <img src={work.url} alt={work.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900">{work.title}</h4>
                        <p className="text-sm text-gray-500">{work.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-500">No works uploaded yet.</p>
                </div>
              )}
            </div>
          )}

          {/* FILES TAB */}
          {activeTab === 'files' && (
            <div className="space-y-10">

              {/* Monthly Analysis Reports */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Analysis</h3>
                {reportsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-36 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : monthlyReports && monthlyReports.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {monthlyReports.map(report => (
                      <button
                        key={report._id}
                        onClick={() => setSelectedReport(report)}
                        className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-900 hover:shadow-md transition-all text-left flex flex-col items-center gap-3 group"
                      >
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FolderOpen size={26} />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900 text-sm">{report.monthYear}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(report._creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <BarChart3 size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-500">No analysis reports yet</p>
                    <p className="text-xs text-gray-400 mt-1">Reports will appear here once your account manager generates them.</p>
                  </div>
                )}
              </div>

              {/* Documents & Media */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Documents & Media</h3>
                {filesLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-16 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : myFiles && myFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myFiles.map(file => {
                      const isImage = file.type.startsWith('image/');
                      const label = (file as any).fileLabel ?? (isImage ? 'Media' : 'Document');
                      return (
                        <div key={file._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {isImage && file.url ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : label === 'Contract' ? (
                              <FileText size={20} className="text-blue-500" />
                            ) : label === 'Report' ? (
                              <BarChart3 size={20} className="text-green-500" />
                            ) : (
                              <FolderOpen size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">{file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{label}</span>
                              {file.size && <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>}
                              <span className="text-xs text-gray-300">·</span>
                              <span className="text-xs text-gray-400">{new Date(file._creationTime).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={file.name}
                              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
                            >
                              <Download size={13} />
                              Download
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <FolderOpen size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-500">No files uploaded yet</p>
                    <p className="text-xs text-gray-400 mt-1">Files shared by your account manager will appear here.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-xl">
              <h3 className="font-semibold text-lg text-gray-900 mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <Button className="mt-4">Save Changes</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedReport && (
        <MonthlyReportViewer 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
}
