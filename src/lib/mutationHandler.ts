import { toast } from "sonner";

/**
 * Standardized wrapper for mutations to handle loading states and errors.
 * 
 * @param action The async mutation action to execute
 * @param setLoading Optional state setter for loading state
 * @param options Optional success/error message overrides
 * @returns boolean indicating success
 */
export async function withErrorHandler(
  action: () => Promise<void>,
  setLoading?: (loading: boolean) => void,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  }
): Promise<boolean> {
  if (setLoading) setLoading(true);
  try {
    await action();
    if (options?.showSuccessToast && options?.successMessage) {
      toast.success(options.successMessage);
    }
    return true;
  } catch (error: any) {
    console.error("Mutation Error:", error);
    if (options?.showErrorToast !== false) {
      toast.error(options?.errorMessage || error.message || "An unexpected error occurred");
    }
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
}
