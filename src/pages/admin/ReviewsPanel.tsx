import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

export function ReviewsPanel() {
  const reviews = useQuery(api.planReviews.listAllAdmin);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
            Plan Reviews
          </h2>
          <p className="text-sm text-admin-muted mt-1">
            View client reviews for subscription plans.
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
