import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { DataTable, Column } from "./components/DataTable";
import { StatusBadge } from "./components/StatusBadge";
import { Button } from "./components/Button";
import { Modal } from "./components/Modal";
import { Input, Select } from "./components/Input";
import { useUsers, usePlans, useUpdateUser, useDeleteUser } from "../../lib/useConvex";
import { Plus, Filter } from "lucide-react";

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
  const users = useUsers();
  const plans = usePlans();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", planId: "", planStatus: "" });
  const [saving, setSaving] = useState(false);

  const usersWithPlans: UserData[] = useMemo(() => {
    if (!users) return [];
    return users.map(u => ({
      ...u,
      planName: plans?.find(p => p.id === u.planId)?.name ?? "—",
      status: u.planStatus === "active" ? "Active" : u.planStatus === "pending" ? "Pending" : "None"
    }));
  }, [users, plans]);

  const filtered = useMemo(
    () => usersWithPlans.filter((u) => filter === "All" || u.status === filter),
    [usersWithPlans, filter]
  );

  const handleView = (u: UserData) => {
    setFormData({
      name: u.name,
      phone: u.phone,
      planId: u.planId || "",
      planStatus: u.planStatus,
    });
    setOpen(u);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!open) return;
    setSaving(true);
    try {
      await updateUser({
        id: open.id as any,
        name: formData.name,
        phone: formData.phone,
        planId: formData.planId || undefined,
        planStatus: formData.planStatus as any,
      });
      setEditing(false);
      setOpen(null);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
    setSaving(false);
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser({ id: userId as any });
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const cols: Column<UserData>[] = [
    { key: "user", header: "User", render: (u) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-admin-border bg-admin-surface2 text-xs font-semibold uppercase">
          {u.name.split(" ").map(p => p[0]).slice(0,2).join("")}
        </div>
        <div>
          <p className="font-medium text-white">{u.name}</p>
          <p className="text-xs text-admin-muted">{u.email}</p>
        </div>
      </div>
    )},
    { key: "phone", header: "Phone", render: (u) => <span className="font-mono text-xs text-admin-muted">{u.phone || "—"}</span> },
    { key: "plan",  header: "Plan",  render: (u) => <span className="text-white/90">{u.planName}</span> },
    { key: "status",header: "Status",render: (u) => <StatusBadge status={u.status as "Active" | "Pending" | "Cancelled"} /> },
    { key: "date",  header: "Joined",render: (u) => <span className="text-admin-muted">{u.registered || "—"}</span> },
    { key: "actions", header: "", align: "right", render: (u) => (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={() => handleView(u)}>View</Button>
        <Button size="sm" variant="ghost" onClick={() => { handleView(u); setEditing(true); }}>Edit</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Every individual with access to the Carrow client space — clients, collaborators and admins."
        actions={<Button><Plus size={14} /> Invite user</Button>}
      />

      <div className="flex flex-wrap items-center gap-3">
        {["All", "Active", "Pending", "None"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors ${
              filter === f
                ? "border-white bg-white text-black"
                : "border-admin-border bg-admin-surface text-admin-muted hover:text-white"
            }`}
          >
            {f === "None" ? "No plan" : f}
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-2 text-xs text-admin-muted">
          <Filter size={12} /> {filtered.length} of {users?.length ?? 0} shown
        </span>
      </div>

      <DataTable columns={cols} data={filtered} />

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.name ?? ""}
        subtitle={open?.email}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(null)}>Close</Button>
            {editing ? (
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
            ) : (
              <Button onClick={handleEdit}>Edit profile</Button>
            )}
          </>
        }
      >
        <div className="grid grid-cols-2 gap-6">
          <Input 
            label="Full name" 
            value={editing ? formData.name : open?.name || ""} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            disabled={!editing}
          />
          <Input 
            label="Phone" 
            value={editing ? formData.phone : open?.phone || ""} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            disabled={!editing}
          />
          <Select 
            label="Plan" 
            value={editing ? formData.planId : open?.planId || ""}
            onChange={(e) => setFormData({...formData, planId: e.target.value})}
            disabled={!editing}
          >
            <option value="">— No Plan —</option>
            {plans?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <Select 
            label="Status" 
            value={editing ? formData.planStatus : open?.planStatus || ""}
            onChange={(e) => setFormData({...formData, planStatus: e.target.value})}
            disabled={!editing}
          >
            <option value="none">None</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
          </Select>
        </div>
        <div className="mt-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">User ID</p>
          <div className="rounded-md border border-admin-border bg-admin-surface2 px-4 py-3 text-sm font-mono text-admin-muted">
            {open?.id}
          </div>
        </div>
      </Modal>
    </div>
  );
}
