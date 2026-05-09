import React, { useEffect } from "react";
import {
  X, Eye, Users, TrendingUp, MousePointerClick, FileImage,
  Heart, MessageCircle, Share2, Bookmark, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── types ────────────────────────────────────────────────────────────────────
interface ReelItem {
  thumbnailUrl?: string | null;
  views: string;
  date: string;
  caption?: string;
}

interface PostItem {
  thumbnailUrl?: string | null;
  viewsOrReach: string;
  date: string;
  caption?: string;
}

interface ReportData {
  _id: string;
  monthYear: string;
  _creationTime: number;
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
  topReels: ReelItem[];
  topPosts: PostItem[];
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
}

interface Props {
  report: ReportData;
  onClose: () => void;
}

// ─── component ────────────────────────────────────────────────────────────────
export function MonthlyReportViewer({ report, onClose }: Props) {
  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const kpis = [
    { label: "Total Views",       value: report.kpiCards.totalViews,         icon: Eye,               color: "bg-blue-50 text-blue-600" },
    { label: "Accounts Reached",  value: report.kpiCards.accountsReached,     icon: Users,             color: "bg-indigo-50 text-indigo-600" },
    { label: "Interactions",      value: report.kpiCards.totalInteractions,   icon: TrendingUp,        color: "bg-emerald-50 text-emerald-600" },
    { label: "Profile Visits",    value: report.kpiCards.profileVisits,       icon: MousePointerClick, color: "bg-orange-50 text-orange-600" },
    { label: "Content Posted",    value: report.kpiCards.totalContentPosted,  icon: FileImage,         color: "bg-gray-100 text-gray-600" },
  ];

  const engagementItems = [
    { label: "Likes",    value: report.engagement.likes,    icon: Heart,         color: "text-rose-500" },
    { label: "Comments", value: report.engagement.comments, icon: MessageCircle, color: "text-blue-500" },
    { label: "Shares",   value: report.engagement.shares,   icon: Share2,        color: "text-green-500" },
    { label: "Saves",    value: report.engagement.saves,    icon: Bookmark,      color: "text-purple-500" },
  ];

  const contentRows = [
    { label: "Reels",   percent: report.contentType.reels,   color: "bg-violet-500" },
    { label: "Stories", percent: report.contentType.stories, color: "bg-pink-500" },
    { label: "Posts",   percent: report.contentType.posts,   color: "bg-blue-500" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#f5f5f5] overflow-y-auto"
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Performance Report</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm font-bold text-gray-900">{report.monthYear}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">

          {/* KPI Cards */}
          <section>
            <SectionLabel>Overview</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${kpi.color}`}>
                    <kpi.icon size={17} />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{kpi.value}</p>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Previous month comparison */}
            {report.previousMonth && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Prev. Views",        value: report.previousMonth.views },
                  { label: "Prev. Reach",         value: report.previousMonth.reach },
                  { label: "Prev. Interactions",  value: report.previousMonth.interactions },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                    <ChevronUp size={14} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-700">{item.value}</p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Engagement + Content Breakdown */}
          <section className="grid md:grid-cols-2 gap-6">
            {/* Engagement */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
              <SectionLabel>Engagement</SectionLabel>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {engagementItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                    <item.icon size={22} className={item.color} />
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">{item.value}</p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
              <SectionLabel>Content Breakdown</SectionLabel>
              <div className="space-y-5 mt-4">
                {contentRows.map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                      <span>{row.label}</span>
                      <span>{row.percent}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.percent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${row.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Strategic Insights */}
          <section className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/3 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <SectionLabel light>Strategic Insights</SectionLabel>
              <div className="grid md:grid-cols-3 gap-8 mt-6">
                <InsightBlock label="Performance Summary" text={report.strategicInsights.performanceSummary} />
                <InsightBlock label="Best Content Type"   text={report.strategicInsights.bestContentType} large />
                <InsightBlock label="Growth Opportunity"  text={report.strategicInsights.growthOpportunity} />
              </div>
            </div>
          </section>

          {/* Top Reels */}
          {report.topReels.length > 0 && (
            <section>
              <SectionLabel>Top Reels</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-4">
                {report.topReels.map((reel, i) => (
                  <ContentCard
                    key={i}
                    thumbnailUrl={reel.thumbnailUrl ?? null}
                    primaryStat={reel.views}
                    primaryLabel="Views"
                    date={reel.date}
                    caption={reel.caption}
                    aspectRatio="9/16"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Top Posts */}
          {report.topPosts.length > 0 && (
            <section>
              <SectionLabel>Top Posts</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-4">
                {report.topPosts.map((post, i) => (
                  <ContentCard
                    key={i}
                    thumbnailUrl={post.thumbnailUrl ?? null}
                    primaryStat={post.viewsOrReach}
                    primaryLabel="Views / Reach"
                    date={post.date}
                    caption={post.caption}
                    aspectRatio="1/1"
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${light ? "text-gray-400" : "text-gray-400"}`}>
      {children}
    </p>
  );
}

function InsightBlock({ label, text, large }: { label: string; text: string; large?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      {large ? (
        <p className="text-2xl font-extrabold text-white">{text}</p>
      ) : (
        <p className="text-sm leading-relaxed text-gray-300">{text}</p>
      )}
    </div>
  );
}

function ContentCard({
  thumbnailUrl, primaryStat, primaryLabel, date, caption, aspectRatio,
}: {
  thumbnailUrl: string | null;
  primaryStat: string;
  primaryLabel: string;
  date: string;
  caption?: string;
  aspectRatio: "9/16" | "1/1";
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div
        className="relative bg-gray-100 overflow-hidden"
        style={{ aspectRatio }}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Content" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FileImage size={28} />
          </div>
        )}
        {caption && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p className="text-xs text-white line-clamp-3 leading-relaxed">{caption}</p>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-extrabold text-gray-900">{primaryStat}</p>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{primaryLabel}</p>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">{date}</span>
      </div>
    </div>
  );
}
