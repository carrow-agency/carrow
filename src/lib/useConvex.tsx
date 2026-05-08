import { useQuery, useMutation } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "./generated/api";

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

export function useMyOrders() {
  const orders = useQuery(api.orders.listMine);
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

export function useMyFiles() {
  const files = useQuery(api.files.getClientFiles, {});
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

export function useMyContracts() {
  return useQuery(api.contracts.getMine);
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

export function useMyReports() {
  return useQuery(api.reports.getMine);
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
  const { signIn: authSignIn, signOut: authSignOut } = useAuthActions();

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authSignIn("password", { flow: "signIn", email, password });
      if (!result.signingIn && !result.redirect) {
        return { success: false, error: "Unable to complete sign in" };
      }
      return { success: true, error: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await authSignIn("password", {
        flow: "signUp",
        email,
        password,
        name,
      });
      if (!result.signingIn && !result.redirect) {
        return { success: false, error: "Unable to complete sign up" };
      }
      return { success: true, error: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  };

  const signOut = async () => {
    await authSignOut();
  };

  return { signIn, signUp, signOut };
};

export const useCurrentUser = () => {
  const auth = useConvexAuth();
  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
  };
};

export function useWorksByClient(clientId?: string) {
  return useQuery(api.works.getByClient, clientId ? { clientId: clientId as any } : "skip");
}

export function useMyWorks() {
  return useQuery(api.works.getMine);
}

export function useCurrentUserFromConvex() {
  const auth = useConvexAuth();
  const user = useQuery(api.users.current);

  if (auth.isLoading || user === undefined) {
    return undefined;
  }

  if (!auth.isAuthenticated || !user) return null;

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
