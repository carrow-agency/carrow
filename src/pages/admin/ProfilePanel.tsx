import { PageHeader } from "./components/PageHeader";
import { Input } from "./components/Input";
import { Button } from "./components/Button";

export default function ProfilePanel() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your administrator identity inside the Carrow workspace."
        actions={<Button>Save changes</Button>}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-xl border border-admin-border bg-admin-surface p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Identity</p>
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-admin-border bg-admin-surface2 text-3xl font-display font-semibold">AK</div>
            <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">Adrian Kovac</h3>
            <p className="text-sm text-admin-muted">Founder · Admin</p>
            <Button variant="secondary" size="sm" className="mt-5">Upload avatar</Button>
          </div>
          <div className="mt-8 space-y-3 border-t border-admin-border pt-6 text-sm">
            <Row label="Last sign-in" value="Today, 09:14" />
            <Row label="Two-factor"   value="Enabled" />
            <Row label="Role"         value="Owner" />
          </div>
        </section>

        <section className="space-y-8">
          <div className="rounded-xl border border-admin-border bg-admin-surface p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Personal information</p>
            <div className="mt-6 grid grid-cols-2 gap-5">
              <Input label="Full name" defaultValue="Adrian Kovac" />
              <Input label="Email" defaultValue="adrian@carrow.studio" disabled />
              <Input label="Display title" defaultValue="Founder, Carrow Studio" />
              <Input label="Timezone" defaultValue="Europe / Lisbon" />
            </div>
          </div>

          <div className="rounded-xl border border-admin-border bg-admin-surface p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Change password</p>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              <Input label="Current password" type="password" placeholder="••••••••" />
              <Input label="New password" type="password" placeholder="••••••••" />
              <Input label="Confirm new" type="password" placeholder="••••••••" />
            </div>
            <div className="mt-6 flex justify-end"><Button>Update password</Button></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-admin-muted">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
