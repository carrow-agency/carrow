import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { DataTable, Column } from "./components/DataTable";
import { StatusBadge } from "./components/StatusBadge";
import { Button } from "./components/Button";
import { Modal } from "./components/Modal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Input, Select } from "./components/Input";
import { useUsers, usePlans, useUpdateUser, useDeleteUser } from "../../lib/useConvex";
import { withErrorHandler } from "../../lib/mutationHandler";
import { Id } from "../../../convex/_generated/dataModel";
import { Plus, Filter, Shield, User as UserIcon } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  planId: string | null;
  planStatus: "none" | "pending" | "active";
  registered: string;
  role: string;
  planName: string;
  status: string;
}

export default function UsersPanel() {
  const { users, status, loadMore } = useUsers();
  const plans = usePlans();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [filter, setFilter]   = useState("All");
  const [open, setOpen]       = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [saving, setSaving]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const usersWithPlans: UserData[] = useMemo(() => {
    if (!users) return [];
    return users.map(u => ({
      ...u,
      planName: plans?.find(p => p.id === u.planId)?.name ?? "—",
      status: u.planStatus === "active" ? "Active" : u.planStatus === "pending" ? "Pending" : "None",
    }));
  }, [users, plans]);

  const filtered = useMemo(
    () => usersWithPlans.filter(u => filter === "All" || u.status === filter || (filter === "Admin" && u.role === "admin")),
    [usersWithPlans, filter]
  );

  const handleView = (u: UserData) => {
    setFormData({ name: u.name, phone: u.phone });
    setOpen(u);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!open) return;
    await withErrorHandler(async () => {
      await updateUser({
        id: open.id as Id<"users">,
        name: formData.name,
        phone: formData.phone,
      });
      setEditing(false);
      setOpen(null);
    }, setSaving, { showSuccessToast: true, successMessage: "User updated successfully" });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await withErrorHandler(async () => {
      await deleteUser({ id: deleteTarget.id as Id<"users"> });
      setDeleteTarget(null);
    }, setDeleting, { showSuccessToast: true, successMessage: "User deleted successfully" });
  };

  const cols: Column<UserData>[] = [
    {
      key: "user", header: "User",
      render: u => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white uppercase">
            {u.name ? u.name.split(" ").map(p => p[0]).slice(0,2).join("") : "?"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-white leading-tight">{u.name || "Unknown"}</p>
              {u.role === "admin" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/70">
                  <Shield size={10} /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-admin-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone",  header: "Phone",  render: u => <span className="font-mono text-xs text-admin-muted">{u.phone || "—"}</span> },
    { key: "plan",   header: "Plan",   render: u => <span className="text-sm text-white/80">{u.planName}</span> },
    { key: "status", header: "Status", render: u => <StatusBadge status={u.status as "Active" | "Pending" | "None" | "Cancelled"} /> },
    { key: "joined", header: "Joined", render: u => <span className="text-xs text-admin-muted">{u.registered || "—"}</span> },
    {
      key: "actions", header: "", align: "right",
      render: u => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => handleView(u)}>View</Button>
          <Button size="sm" variant="ghost"     onClick={() => { handleView(u); setEditing(true); }}>Edit</Button>
          {u.role !== "admin" && (
            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(u)}>Delete</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Every individual with access to the Carrow client space."
        actions={
          <Button onClick={() => window.alert("Invite user: share the signup link with your client.")}>
            <Plus size={14} /> Invite user
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {["All", "Active", "Pending", "None", "Admin"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === f
                ? "border-white bg-white text-admin-bg"
                : "border-admin-border bg-admin-surface text-admin-muted hover:text-white hover:border-white/20"
            }`}
          >
            {f === "None" ? "No plan" : f}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-admin-muted">
          <Filter size={12} /> {filtered.length} of {users?.length ?? 0}
        </span>
      </div>

      <DataTable columns={cols} data={filtered} rowKey={u => u.id} />

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => loadMore(50)}>Load more</Button>
        </div>
      )}
      {status === "LoadingMore" && (
        <p className="text-center text-sm text-admin-muted">Loading…</p>
      )}

      {/* View / Edit modal */}
      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.name ?? ""}
        subtitle={open?.email}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(null)}>Close</Button>
            {editing
              ? <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              : <Button onClick={() => setEditing(true)}>Edit profile</Button>
            }
          </>
        }
      >
        <div className="grid grid-cols-2 gap-5">
          <Input
            label="Full name"
            value={editing ? formData.name : open?.name || ""}
            onChange={e => setFormData({...formData, name: e.target.value})}
            disabled={!editing}
          />
          <Input
            label="Phone"
            value={editing ? formData.phone : open?.phone || ""}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            disabled={!editing}
          />
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Plan</p>
            <div className="flex items-center h-10 px-3.5 rounded-lg border border-admin-border bg-admin-surface2 text-sm text-white/80">
              {open?.planName || "—"}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Plan Status</p>
            <div className="flex items-center h-10 px-3.5 rounded-lg border border-admin-border bg-admin-surface2 text-sm text-white/80 capitalize">
              {open?.planStatus || "none"}
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Role</p>
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-lg border border-admin-border bg-admin-surface2 text-sm text-white/80">
              {open?.role === "admin" ? <Shield size={14} className="text-white/50" /> : <UserIcon size={14} className="text-white/50" />}
              <span className="capitalize">{open?.role ?? "user"}</span>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Member Since</p>
            <div className="flex items-center h-10 px-3.5 rounded-lg border border-admin-border bg-admin-surface2 text-sm text-white/80">
              {open?.registered || "—"}
            </div>
          </div>
        </div>
        <div className="mt-5">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">User ID</p>
          <div className="rounded-lg border border-admin-border bg-admin-surface2 px-3.5 py-2.5 text-xs font-mono text-admin-muted break-all">
            {open?.id}
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${deleteTarget?.name || "user"}?`}
        description="This action is permanent and cannot be undone."
        scope={[
          "User account and profile",
          "All their orders",
          "All uploaded files",
          "All plan requests",
          "All contracts",
          "All reports",
          "All works linked to this client",
        ]}
      />
    </div>
  );
}
