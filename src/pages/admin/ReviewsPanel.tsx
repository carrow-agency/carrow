import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function ReviewsPanel() {
  const reviews = useQuery(api.planReviews.listAllAdmin);
  const updateStatus = useMutation(api.planReviews.updateStatus);

  const handleUpdate = async (id: any, status: "approved" | "rejected") => {
    try {
      await updateStatus({ id, status });
      toast.success(`Review ${status} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update review status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
            Plan Reviews
          </h2>
          <p className="text-sm text-admin-muted mt-1">
            Manage client reviews for subscription plans.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-admin-border bg-admin-surface overflow-hidden">
        {reviews === undefined ? (
          <div className="p-8 text-center text-admin-muted text-sm">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-admin-muted text-sm">
            No reviews found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-bg/50 border-b border-admin-border text-admin-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {reviews.map((rev) => (
                    <motion.tr
                      key={rev._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-admin-border/50 hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {rev.userName}
                      </td>
                      <td className="px-4 py-3 text-admin-muted">
                        {rev.planName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 text-white">
                          {[...Array(rev.rating)].map((_, j) => (
                            <span key={j}>★</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-admin-muted max-w-xs truncate">
                        {rev.reviewText}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            rev.status === "approved"
                              ? "bg-green-500/10 text-green-500"
                              : rev.status === "rejected"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {rev.status.charAt(0).toUpperCase() + rev.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(rev._id, "approved")}
                            disabled={rev.status === "approved"}
                            className="p-1.5 text-admin-muted hover:text-green-500 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdate(rev._id, "rejected")}
                            disabled={rev.status === "rejected"}
                            className="p-1.5 text-admin-muted hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
