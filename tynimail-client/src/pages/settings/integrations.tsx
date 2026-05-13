import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Check, Sparkles } from 'lucide-react';
import axiosInstance from '@/api/axios-instance';
import { ALL_API_ENDPOINT } from '@/api/api-endpoint';
import SettingsWrapper from './settings-wrapper';

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return { copied, copy };
}

const GHOST_SITE_ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
const GHOST_SNIPPET = `<!-- TyniMail Tracker -->
<script>
  window.TyniMail = window.TyniMail || {
    _q: [],
    push: function(args) { this._q.push(args); }
  };
</script>
<script src="https://app.tynimail.com/t/js?siteId=${GHOST_SITE_ID}" async></script>`;

const Integrations = () => {
  const { copied, copy } = useCopy();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await axiosInstance.get(ALL_API_ENDPOINT.USERS.PROFILE);
      return res.data?.user ?? res.data?.data?.user ?? res.data?.data ?? res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: updateTracking, isPending: isUpdatingTracking } = useMutation({
    mutationFn: async (enabled: boolean) => {
      await axiosInstance.patch(ALL_API_ENDPOINT.USERS.TRACKING, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const { mutate: updateElementTracking, isPending: isUpdatingElementTracking } = useMutation({
    mutationFn: async (enabled: boolean) => {
      await axiosInstance.patch(ALL_API_ENDPOINT.USERS.ELEMENT_TRACKING, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const { mutate: revealScript, isPending: isRevealing } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(ALL_API_ENDPOINT.USERS.GENERATE_SITE_ID);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const siteId: string | null = profile?.site_id ?? null;
  const trackingEnabled: boolean = profile?.tracking_enabled ?? false;
  const elementTrackingEnabled: boolean = profile?.element_tracking_enabled ?? false;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? '';

  const snippet = siteId
    ? `<!-- TyniMail Tracker -->
<script>
  window.TyniMail = window.TyniMail || {
    _q: [],
    push: function(args) { this._q.push(args); }
  };
</script>
<script src="${baseUrl}/t/js?siteId=${siteId}" async></script>`
    : '';

  const usageExample = `TyniMail.push(["track", "purchase_completed",
  { email: "user@example.com", FIRSTNAME: "John" },
  { amount: 99.99, plan: "Pro" }
]);`;

  const content = (
    <div className="space-y-6">
      {/* Site ID */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Your Site ID
        </label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-muted rounded-md px-3 py-2 text-sm font-mono border border-border select-all">
            {siteId || GHOST_SITE_ID}
          </code>
          <button
            onClick={() => siteId && copy(siteId, 'siteId')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md border border-border hover:bg-muted transition-colors shrink-0"
          >
            {copied === 'siteId' ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied === 'siteId' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Installation snippet */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Installation Snippet
        </label>
        <p className="text-xs text-muted-foreground">
          Add this to the <code className="bg-muted px-1 rounded text-xs">&lt;head&gt;</code> of your website:
        </p>
        <div className="relative">
          <pre className="bg-muted rounded-md p-4 text-xs font-mono overflow-x-auto border border-border leading-relaxed whitespace-pre-wrap break-all">
            {siteId ? snippet : GHOST_SNIPPET}
          </pre>
          {siteId && (
            <button
              onClick={() => copy(snippet, 'snippet')}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              {copied === 'snippet' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied === 'snippet' ? 'Copied!' : 'Copy snippet'}
            </button>
          )}
        </div>
      </div>

      {/* Usage example */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Usage Example
        </label>
        <p className="text-xs text-muted-foreground">
          Call <code className="bg-muted px-1 rounded text-xs">TyniMail.push</code> anywhere on your page after installing the snippet:
        </p>
        <pre className="bg-muted rounded-md p-4 text-xs font-mono overflow-x-auto border border-border leading-relaxed">
          {usageExample}
        </pre>
        <p className="text-xs text-muted-foreground">
          The <code className="bg-muted px-1 rounded text-xs">email</code> field in properties is required — it identifies the contact.
          The third argument is your event payload (any JSON).
        </p>
      </div>
    </div>
  );

  return (
    <SettingsWrapper>
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-base font-semibold">JS Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track custom events on your website to trigger automations.
          </p>
        </div>

        {/* Tracking toggles — always visible */}
        {!isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Page view tracking</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track page visits to trigger <span className="font-mono">webpage_visited</span> automations.
                </p>
              </div>
              <Toggle
                enabled={trackingEnabled}
                onChange={(v) => updateTracking(v)}
                disabled={isUpdatingTracking}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Element click tracking</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detect element clicks matching rules configured inside <span className="font-mono">custom_event</span> triggers.
                </p>
              </div>
              <Toggle
                enabled={elementTrackingEnabled}
                onChange={(v) => updateElementTracking(v)}
                disabled={isUpdatingElementTracking}
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !siteId ? (
          <div className="relative">
            {/* Blurred ghost content */}
            <div className="blur-sm pointer-events-none select-none opacity-60">
              {content}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => revealScript()}
                disabled={isRevealing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Sparkles size={15} />
                {isRevealing ? 'Generating…' : 'Reveal Script'}
              </button>
              <p className="text-xs text-muted-foreground">
                Generate your unique tracking snippet
              </p>
            </div>
          </div>
        ) : (
          content
        )}
      </div>
    </SettingsWrapper>
  );
};

export default Integrations;
