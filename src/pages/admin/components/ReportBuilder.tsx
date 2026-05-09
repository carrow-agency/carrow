import { useState } from "react";
import { X, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { useCreateMonthlyReport, useGenerateUploadUrl } from "../../../lib/useConvex";

type Props = {
  clientId: string;
  onClose: () => void;
};

export function ReportBuilder({ clientId, onClose }: Props) {
  const createReport = useCreateMonthlyReport();
  const generateUploadUrl = useGenerateUploadUrl();
  const [loading, setLoading] = useState(false);

  const [monthYear, setMonthYear] = useState("");
  const [kpiCards, setKpiCards] = useState({
    totalViews: "",
    accountsReached: "",
    totalInteractions: "",
    profileVisits: "",
    totalContentPosted: "",
  });
  const [contentType, setContentType] = useState({
    reels: 0,
    stories: 0,
    posts: 0,
  });
  const [engagement, setEngagement] = useState({
    likes: "",
    comments: "",
    shares: "",
    saves: "",
  });
  const [strategicInsights, setStrategicInsights] = useState({
    performanceSummary: "",
    bestContentType: "",
    growthOpportunity: "",
  });
  
  const [topReels, setTopReels] = useState([{ thumbnailUrl: "", views: "", date: "", caption: "" }]);
  const [topPosts, setTopPosts] = useState([{ thumbnailUrl: "", viewsOrReach: "", date: "", caption: "" }]);

  const [hasPrevMonth, setHasPrevMonth] = useState(false);
  const [previousMonth, setPreviousMonth] = useState({ views: "", reach: "", interactions: "" });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, type: 'reel' | 'post') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a temporary object URL for immediate preview
      const tempUrl = URL.createObjectURL(file);
      
      // We simulate upload for now - in reality you would upload to storage and get a public URL
      // Since `monthlyReports` schema takes a string URL, we should upload to Convex storage and get the url.
      // Wait, we need an endpoint to get public URL. For now, let's use Data URL or require external URL.
      // Using Data URL for simplicity if it's small, or just a text input for URL to avoid huge documents.
      // Let's read as Data URL.
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (type === 'reel') {
          const newReels = [...topReels];
          newReels[index].thumbnailUrl = base64data;
          setTopReels(newReels);
        } else {
          const newPosts = [...topPosts];
          newPosts[index].thumbnailUrl = base64data;
          setTopPosts(newPosts);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to process image", err);
    }
  };

  const handleSave = async () => {
    if (!monthYear) {
      alert("Month/Year is required");
      return;
    }

    setLoading(true);
    try {
      await createReport({
        clientId: clientId as any,
        monthYear,
        kpiCards,
        contentType,
        engagement,
        topReels,
        topPosts,
        strategicInsights,
        previousMonth: hasPrevMonth ? previousMonth : undefined,
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-admin-surface border-l border-admin-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right-full">
        <div className="flex items-center justify-between p-6 border-b border-admin-border bg-admin-surface2">
          <div>
            <h2 className="text-xl font-bold text-white">Generate Monthly Analysis</h2>
            <p className="text-sm text-admin-muted mt-1">Create a powerful performance report.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-admin-muted hover:bg-white/5 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Report Info</h3>
            <div>
              <label className="block text-xs font-medium text-admin-muted mb-1.5">Month & Year (e.g., Jan-26)</label>
              <input 
                type="text" 
                value={monthYear}
                onChange={e => setMonthYear(e.target.value)}
                className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors" 
                placeholder="Jan-26" 
              />
            </div>
          </div>

          <hr className="border-admin-border" />

          {/* KPI Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">KPI Cards</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(kpiCards).map((k) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-admin-muted mb-1.5 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input 
                    type="text" 
                    value={kpiCards[k as keyof typeof kpiCards]}
                    onChange={e => setKpiCards({ ...kpiCards, [k]: e.target.value })}
                    className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white" 
                    placeholder="e.g. 1.2M" 
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-admin-border" />

          {/* Content Type & Engagement */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Content Type (%)</h3>
              {Object.keys(contentType).map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <label className="w-16 text-xs font-medium text-admin-muted capitalize">{k}</label>
                  <input 
                    type="number" 
                    value={contentType[k as keyof typeof contentType]}
                    onChange={e => setContentType({ ...contentType, [k]: parseInt(e.target.value) || 0 })}
                    className="flex-1 bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white" 
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Engagement</h3>
              {Object.keys(engagement).map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <label className="w-20 text-xs font-medium text-admin-muted capitalize">{k}</label>
                  <input 
                    type="text" 
                    value={engagement[k as keyof typeof engagement]}
                    onChange={e => setEngagement({ ...engagement, [k]: e.target.value })}
                    className="flex-1 bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white" 
                    placeholder="e.g. 45K"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-admin-border" />

          {/* Top Reels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Top Reels</h3>
              <Button size="sm" variant="outline" onClick={() => setTopReels([...topReels, { thumbnailUrl: "", views: "", date: "", caption: "" }])}>
                <Plus size={14} /> Add Reel
              </Button>
            </div>
            
            <div className="space-y-4">
              {topReels.map((reel, i) => (
                <div key={i} className="p-4 border border-admin-border rounded-xl bg-admin-surface2 flex gap-4">
                  <div className="w-24 h-32 rounded-lg bg-admin-surface border border-admin-border shrink-0 overflow-hidden flex items-center justify-center relative group">
                    {reel.thumbnailUrl ? (
                      <img src={reel.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={20} className="text-admin-muted" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, i, 'reel')}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <input type="text" placeholder="Views (e.g. 1.5M)" value={reel.views} onChange={e => {
                        const newReels = [...topReels]; newReels[i].views = e.target.value; setTopReels(newReels);
                      }} className="flex-1 bg-admin-surface border border-admin-border rounded-lg px-3 py-1.5 text-sm text-white" />
                      <input type="text" placeholder="Date (e.g. Jan 12)" value={reel.date} onChange={e => {
                        const newReels = [...topReels]; newReels[i].date = e.target.value; setTopReels(newReels);
                      }} className="w-1/3 bg-admin-surface border border-admin-border rounded-lg px-3 py-1.5 text-sm text-white" />
                    </div>
                    <input type="text" placeholder="Caption (optional)" value={reel.caption} onChange={e => {
                      const newReels = [...topReels]; newReels[i].caption = e.target.value; setTopReels(newReels);
                    }} className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-1.5 text-sm text-white" />
                  </div>
                  <button onClick={() => setTopReels(topReels.filter((_, idx) => idx !== i))} className="text-admin-muted hover:text-admin-danger shrink-0 h-fit p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-admin-border" />

          {/* Top Posts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Top Posts</h3>
              <Button size="sm" variant="outline" onClick={() => setTopPosts([...topPosts, { thumbnailUrl: "", viewsOrReach: "", date: "", caption: "" }])}>
                <Plus size={14} /> Add Post
              </Button>
            </div>
            
            <div className="space-y-4">
              {topPosts.map((post, i) => (
                <div key={i} className="p-4 border border-admin-border rounded-xl bg-admin-surface2 flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-admin-surface border border-admin-border shrink-0 overflow-hidden flex items-center justify-center relative group">
                    {post.thumbnailUrl ? (
                      <img src={post.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={20} className="text-admin-muted" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, i, 'post')}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <input type="text" placeholder="Views/Reach" value={post.viewsOrReach} onChange={e => {
                        const newPosts = [...topPosts]; newPosts[i].viewsOrReach = e.target.value; setTopPosts(newPosts);
                      }} className="flex-1 bg-admin-surface border border-admin-border rounded-lg px-3 py-1.5 text-sm text-white" />
                      <input type="text" placeholder="Date" value={post.date} onChange={e => {
                        const newPosts = [...topPosts]; newPosts[i].date = e.target.value; setTopPosts(newPosts);
                      }} className="w-1/3 bg-admin-surface border border-admin-border rounded-lg px-3 py-1.5 text-sm text-white" />
                    </div>
                    <input type="text" placeholder="Caption (optional)" value={post.caption} onChange={e => {
                      const newPosts = [...topPosts]; newPosts[i].caption = e.target.value; setTopPosts(newPosts);
                    }} className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-1.5 text-sm text-white" />
                  </div>
                  <button onClick={() => setTopPosts(topPosts.filter((_, idx) => idx !== i))} className="text-admin-muted hover:text-admin-danger shrink-0 h-fit p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-admin-border" />

          {/* Strategic Insights */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Strategic Insights</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-admin-muted mb-1.5">Performance Summary</label>
                <textarea 
                  value={strategicInsights.performanceSummary}
                  onChange={e => setStrategicInsights({ ...strategicInsights, performanceSummary: e.target.value })}
                  rows={3} 
                  className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-admin-muted mb-1.5">Best Content Type</label>
                <input 
                  type="text" 
                  value={strategicInsights.bestContentType}
                  onChange={e => setStrategicInsights({ ...strategicInsights, bestContentType: e.target.value })}
                  className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-admin-muted mb-1.5">Growth Opportunity</label>
                <textarea 
                  value={strategicInsights.growthOpportunity}
                  onChange={e => setStrategicInsights({ ...strategicInsights, growthOpportunity: e.target.value })}
                  rows={3} 
                  className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white" 
                />
              </div>
            </div>
          </div>

          <hr className="border-admin-border" />

          {/* Previous Month (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Previous Month (Optional)</h3>
              <input type="checkbox" checked={hasPrevMonth} onChange={e => setHasPrevMonth(e.target.checked)} className="rounded bg-admin-surface border-admin-border" />
            </div>
            
            {hasPrevMonth && (
              <div className="grid grid-cols-3 gap-4">
                {Object.keys(previousMonth).map((k) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-admin-muted mb-1.5 capitalize">{k}</label>
                    <input 
                      type="text" 
                      value={previousMonth[k as keyof typeof previousMonth]}
                      onChange={e => setPreviousMonth({ ...previousMonth, [k]: e.target.value })}
                      className="w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-admin-border bg-admin-surface2 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Generate Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}
