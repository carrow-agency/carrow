import React from "react";
import { X, TrendingUp, Users, Eye, BarChart3, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

type ReportData = {
  monthYear: string;
  kpiCards: {
    totalViews: string;
    accountsReached: string;
    totalInteractions: string;
    profileVisits: string;
    totalContentPosted: string;
  };
  contentType: {
    reels: number;
    stories: number;
    posts: number;
  };
  engagement: {
    likes: string;
    comments: string;
    shares: string;
    saves: string;
  };
  topReels: Array<{
    thumbnailUrl: string;
    views: string;
    date: string;
    caption?: string;
  }>;
  topPosts: Array<{
    thumbnailUrl: string;
    viewsOrReach: string;
    date: string;
    caption?: string;
  }>;
  strategicInsights: {
    performanceSummary: string;
    bestContentType: string;
    growthOpportunity: string;
  };
  previousMonth?: {
    views: string;
    reach: string;
    interactions: string;
  };
};

export function MonthlyReportViewer({ report, onClose }: { report: ReportData; onClose: () => void }) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#f8f8f8] overflow-y-auto">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-6">
        <div>
          <h2 className="font-serif font-bold text-xl text-gray-900">Performance Report</h2>
          <p className="text-xs text-gray-500 font-sans uppercase tracking-wider">{report.monthYear}</p>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="w-full max-w-5xl mx-auto pt-24 pb-24 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-12">
          
          {/* Section: KPIs */}
          <section>
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Views", value: report.kpiCards.totalViews, icon: Eye, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Reached", value: report.kpiCards.accountsReached, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                { label: "Interactions", value: report.kpiCards.totalInteractions, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Profile Visits", value: report.kpiCards.profileVisits, icon: BarChart3, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "Content Posted", value: report.kpiCards.totalContentPosted, icon: BarChart3, color: "text-gray-500", bg: "bg-gray-100" }
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:border-gray-300 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${kpi.bg} ${kpi.color}`}>
                    <kpi.icon size={18} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Content & Engagement */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">Content Breakdown</h3>
              <div className="space-y-6">
                {[
                  { label: "Reels", percent: report.contentType.reels, color: "bg-purple-500" },
                  { label: "Stories", percent: report.contentType.stories, color: "bg-pink-500" },
                  { label: "Posts", percent: report.contentType.posts, color: "bg-blue-500" }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                      <span>{item.label}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">Engagement Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Likes", value: report.engagement.likes, icon: Heart, color: "text-red-500" },
                  { label: "Comments", value: report.engagement.comments, icon: MessageCircle, color: "text-blue-500" },
                  { label: "Shares", value: report.engagement.shares, icon: Share2, color: "text-green-500" },
                  { label: "Saves", value: report.engagement.saves, icon: Bookmark, color: "text-purple-500" }
                ].map(stat => (
                  <div key={stat.label} className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                    <stat.icon size={24} className={stat.color} />
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Strategic Insights */}
          <section className="bg-gray-900 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-serif text-3xl font-bold mb-8">Strategic Insights</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Performance Summary</p>
                  <p className="text-sm leading-relaxed text-gray-200">{report.strategicInsights.performanceSummary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Best Content Type</p>
                  <p className="text-lg font-bold text-white mb-2">{report.strategicInsights.bestContentType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Growth Opportunity</p>
                  <p className="text-sm leading-relaxed text-gray-200">{report.strategicInsights.growthOpportunity}</p>
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          </section>

          {/* Section: Top Content */}
          <section className="space-y-12">
            <div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">Top Performing Reels</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {report.topReels.map((reel, i) => (
                  <div key={i} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-[9/16] bg-gray-100 relative">
                      {reel.thumbnailUrl ? (
                        <img src={reel.thumbnailUrl} alt="Reel Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                        <p className="text-sm line-clamp-3">{reel.caption}</p>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center bg-white">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{reel.views}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Views</p>
                      </div>
                      <span className="text-xs font-medium text-gray-400">{reel.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">Top Performing Posts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {report.topPosts.map((post, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 relative group">
                      {post.thumbnailUrl ? (
                        <img src={post.thumbnailUrl} alt="Post Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                        <p className="text-sm line-clamp-3">{post.caption}</p>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{post.viewsOrReach}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Views / Reach</p>
                      </div>
                      <span className="text-xs font-medium text-gray-400">{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
