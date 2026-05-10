import React from "react";
import { format } from "date-fns";
import { PageHeader } from "./components/PageHeader";
import { useAuditLogs } from "../../lib/useConvex";
import { Activity, Shield, User, FileText, Settings, CreditCard } from "lucide-react";

export default function AuditLogsPanel() {
  const auditLogs = useAuditLogs(500);

  const getActionIcon = (action: string) => {
    if (action.includes("user")) return <User size={16} className="text-blue-400" />;
    if (action.includes("order") || action.includes("plan")) return <CreditCard size={16} className="text-green-400" />;
    if (action.includes("work") || action.includes("portfolio")) return <FileText size={16} className="text-purple-400" />;
    if (action.includes("settings")) return <Settings size={16} className="text-orange-400" />;
    return <Shield size={16} className="text-admin-muted" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes("delete") || action.includes("remove") || action.includes("clear")) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (action.includes("create") || action.includes("add")) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (action.includes("update") || action.includes("resolve")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-admin-surface border-admin-border text-admin-muted";
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Immutable record of administrative actions across the platform."
      />

      <div className="flex-1 min-h-0 bg-admin-surface border border-admin-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex-1 overflow-auto">
          {auditLogs === undefined ? (
            <div className="flex items-center justify-center h-64">
              <Activity className="animate-spin text-admin-muted" size={24} />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full bg-admin-surface2 flex items-center justify-center mb-3">
                <Shield size={20} className="text-admin-muted" />
              </div>
              <p className="text-white font-medium">No audit logs found</p>
              <p className="text-sm text-admin-muted mt-1">Actions taken by administrators will appear here.</p>
            </div>
          ) : (
            <div className="min-w-[800px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-admin-surface2/50 border-b border-admin-border sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-medium text-admin-muted">Action</th>
                    <th className="px-6 py-4 font-medium text-admin-muted">Admin</th>
                    <th className="px-6 py-4 font-medium text-admin-muted">Target</th>
                    <th className="px-6 py-4 font-medium text-admin-muted">Details</th>
                    <th className="px-6 py-4 font-medium text-admin-muted">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-admin-surface2/30 transition-colors group">
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-admin-surface2 flex items-center justify-center shrink-0 border border-admin-border">
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-admin-border flex items-center justify-center text-xs font-medium text-white">
                            {log.adminName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{log.adminName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {log.targetType ? (
                          <div>
                            <span className="text-admin-muted text-xs uppercase tracking-wider block mb-0.5">{log.targetType}</span>
                            <span className="text-white font-mono text-xs bg-admin-surface2 px-1.5 py-0.5 rounded border border-admin-border">
                              {log.targetId || "N/A"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-admin-muted text-xs italic">System</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="text-admin-muted max-w-xs block truncate" title={log.metadata}>
                          {log.metadata || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-admin-muted">
                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
