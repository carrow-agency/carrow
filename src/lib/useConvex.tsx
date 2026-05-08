import { useQuery, useMutation } from "convex/react";
import { api } from "./generated/api";
import { useState } from "react";

export function usePlans() {
  const plans = useQuery(api.plans.list);
  if (!plans) return null;
  return plans.map(p => ({
    id: p._id,
    name: p.name,
    price: p.price ?? "",
    features: p.features,
    isPopular: p.isPopular ?? false,
    visibility: p.visibility ?? true,
    tagline: p.tagline ?? "",
  }));
}

export function useWorks() {
  const works = useQuery(api.works.list);
  if (!works) return null;
  return works.map(w => ({
    id: w._id,
    url: w.url,
    title: w.title,
    category: w.category,
    client: w.client ?? "",
    published: w.published ?? true,
  }));
}

export function useWorksAll() {
  const works = useQuery(api.works.listAll);
  if (!works) return null;
  return works.map(w => ({
    id: w._id,
    url: w.url,
    title: w.title,
    category: w.category,
    client: w.client ?? "",
    clientId: w.clientId ?? null,
    published: w.published ?? true,
  }));
}

export function useOrders() {
  const orders = useQuery(api.orders.list);
  if (!orders) return null;
  return orders.map(o => ({
    id: o._id,
    clientId: o.clientId,
    clientName: o.clientName,
    clientEmail: o.clientEmail,
    plan: o.plan,
    date: o.date,
    status: o.status as "Pending" | "Active" | "Cancelled",
  }));
}

export function useUsers() {
  const users = useQuery(api.users.list);
  if (!users) return null;
  return users.map(u => ({
    id: u._id,
    name: u.name ?? "",
    email: u.email ?? "",
    phone: u.phone ?? "",
    planId: u.planId ?? null,
    planStatus: (u.planStatus ?? "none") as "none" | "pending" | "active",
    registered: u.registered ?? "",
    role: u.role ?? "user",
  }));
}

export function useSettings() {
  return useQuery(api.settings.get);
}

export function useUpdateSettings() {
  return useMutation(api.settings.update);
}

export function useClientFiles(userId?: string) {
  const files = useQuery(api.files.getClientFiles, userId ? { userId: userId as any } : "skip");
  if (!files) return null;
  return files;
}

export function useAllFiles() {
  const files = useQuery(api.files.getAllFiles);
  if (!files) return null;
  return files;
}

export function useGenerateUploadUrl() {
  return useMutation(api.files.generateUploadUrl);
}

export function useSaveClientFile() {
  return useMutation(api.files.saveClientFile);
}

export function useDeleteClientFile() {
  return useMutation(api.files.deleteClientFile);
}

export function useCreatePlan() {
  return useMutation(api.plans.create);
}

export function useUpdatePlan() {
  return useMutation(api.plans.update);
}

export function useDeletePlan() {
  return useMutation(api.plans.remove);
}

export function useCreateWork() {
  return useMutation(api.works.create);
}

export function useUpdateWork() {
  return useMutation(api.works.update);
}

export function useDeleteWork() {
  return useMutation(api.works.remove);
}

export function useCreateOrder() {
  return useMutation(api.orders.create);
}

export function useUpdateOrderStatus() {
  return useMutation(api.orders.updateStatus);
}

export function useDeleteOrder() {
  return useMutation(api.orders.remove);
}

export function useOrdersStats() {
  return useQuery(api.orders.getStats);
}


export function useUpdateUser() {
  return useMutation(api.users.update);
}

export function useDeleteUser() {
  return useMutation(api.users.remove);
}

export function useContracts() {
  return useQuery(api.contracts.list);
}

export function useContractsByClient(clientId?: string) {
  return useQuery(api.contracts.getByClient, clientId ? { clientId: clientId as any } : "skip");
}

export function useCreateContract() {
  return useMutation(api.contracts.create);
}

export function useUpdateContract() {
  return useMutation(api.contracts.update);
}

export function useDeleteContract() {
  return useMutation(api.contracts.remove);
}

export function useReports() {
  return useQuery(api.reports.list);
}

export function useReportsByClient(clientId: string) {
  return useQuery(api.reports.getByClient, { clientId: clientId as any });
}

export function useCreateReport() {
  return useMutation(api.reports.create);
}

export function useUpdateReport() {
  return useMutation(api.reports.update);
}

export function useDeleteReport() {
  return useMutation(api.reports.remove);
}

export function usePlanRequests() {
  return useQuery(api.planRequests.list);
}

export function usePendingPlanRequests() {
  return useQuery(api.planRequests.getPending);
}

export function useCreatePlanRequest() {
  return useMutation(api.planRequests.create);
}

export function useUpdatePlanRequestStatus() {
  return useMutation(api.planRequests.updateStatus);
}

export function useDeletePlanRequest() {
  return useMutation(api.planRequests.remove);
}

export const useAuthFunctions = () => {
  const signInMutation = useMutation(api.auth.signIn);
  const signUpMutation = useMutation(api.auth.signUp);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation({ email, password });
      if (result.success) {
        localStorage.setItem("carrow_user_id", result.userId);
        setCurrentUser(result.userId);
        return { success: true, error: undefined };
      }
      return { success: false, error: "Invalid credentials" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Sign in failed" };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await signUpMutation({ email, password, name });
      if (result.success) {
        localStorage.setItem("carrow_user_id", result.userId);
        setCurrentUser(result.userId);
        return { success: true, error: undefined };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Sign up failed" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("carrow_user_id");
    setCurrentUser(null);
    window.location.reload();
  };

  return { signIn, signUp, signOut };
};

export const useCurrentUser = () => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem("carrow_user_id") : null;
  return { 
    isAuthenticated: !!userId, 
    isLoading: false 
  };
};

export function useWorksByClient(clientId?: string) {
  return useQuery(api.works.getByClient, clientId ? { clientId: clientId as any } : "skip");
}

export function useCurrentUserFromConvex() {
  const users = useQuery(api.users.list);
  const userId = typeof window !== 'undefined' ? localStorage.getItem("carrow_user_id") : null;
  
  if (!users || !userId) return null;
  
  const user = users.find(u => u._id === userId);
  if (!user) return null;
  
  return {
    id: user._id,
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    planId: user.planId ?? null,
    planStatus: (user.planStatus ?? "none") as "none" | "pending" | "active",
    planExpiry: user.planExpiry ?? null,
    registered: user.registered ?? "",
    role: user.role ?? "user",
  };
}

export function useErrorLogs() {
  const logs = useQuery(api.errorLogs.listErrorLogs);
  if (!logs) return null;
  return logs.map(l => ({
    id: l._id,
    message: l.message,
    stack: l.stack ?? "",
    source: l.source,
    url: l.url ?? "",
    timestamp: l.timestamp,
    resolved: l.resolved ?? false,
  }));
}

export function useErrorStats() {
  return useQuery(api.errorLogs.getErrorStats);
}

export function useLogError() {
  return useMutation(api.errorLogs.logError);
}

export function useResolveError() {
  return useMutation(api.errorLogs.resolveError);
}

export function useDeleteError() {
  return useMutation(api.errorLogs.deleteError);
}