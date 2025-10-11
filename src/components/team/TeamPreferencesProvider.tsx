"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import SelectDropdown from "@/components/ui/SelectDropdown";
import { ORGANIZATION_STORAGE_KEY, TEAM_STORAGE_KEY } from "@/lib/constants";

type OrganizationOption = {
  id: string;
  name: string;
};

type TeamOption = {
  id: string;
  name: string;
  organizationId: string;
};

type TeamSelection = {
  organizationId: string | null;
  teamId: string | null;
};

type TeamPreferencesContextValue = {
  ready: boolean;
  loading: boolean;
  selection: TeamSelection;
  organizations: OrganizationOption[];
  teams: TeamOption[];
  openSelector: () => void;
  refresh: () => Promise<void>;
};

const TeamPreferencesContext = createContext<TeamPreferencesContextValue | undefined>(undefined);

type PreferencesResponse = {
  organizations?: OrganizationOption[];
  organizationId?: string | null;
  selectedOrganizationId?: string | null;
  teams?: TeamOption[];
  selectedTeamId?: string | null;
  teamId?: string | null;
  needsSelection?: boolean;
};

function sortTeams(teams: TeamOption[]): TeamOption[] {
  return [...teams].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

async function fetchPreferences(organizationId?: string | null): Promise<PreferencesResponse> {
  const params = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
  const response = await fetch(`/api/user/preferences${params}`, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load preferences");
  }
  return response.json() as Promise<PreferencesResponse>;
}

async function savePreferences(organizationId: string, teamId: string | null) {
  const response = await fetch("/api/user/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, teamId }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Failed to update preferences");
  }
}

type ProviderProps = {
  children: ReactNode;
};

type PreferencesCache = {
  selection: TeamSelection;
  organizations: OrganizationOption[];
  teams: TeamOption[];
};

let preferencesCache: PreferencesCache | null = null;

export default function TeamPreferencesProvider({ children }: ProviderProps) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selection, setSelection] = useState<TeamSelection>({ organizationId: null, teamId: null });
  const [formSelection, setFormSelection] = useState<TeamSelection>({ organizationId: null, teamId: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLocalStorage = useCallback((organizationId: string | null, teamId: string | null) => {
    if (typeof window === "undefined") return;
    try {
      if (organizationId) {
        localStorage.setItem(ORGANIZATION_STORAGE_KEY, organizationId);
      } else {
        localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
      }

      if (teamId) {
        localStorage.setItem(TEAM_STORAGE_KEY, teamId);
      } else {
        localStorage.removeItem(TEAM_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    if (preferencesCache) {
      const cached = preferencesCache;
      setOrganizations(cached.organizations);
      setTeams(cached.teams);
      setSelection(cached.selection);
      setFormSelection(cached.selection);
      setIsModalOpen(!(cached.selection.organizationId && cached.selection.teamId));
      setReady(true);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchPreferences();
      const orgs = data.organizations ?? [];
      const teamsForOrg = sortTeams(data.teams ?? []);

      const persistedOrgId = data.selectedOrganizationId ?? data.organizationId ?? null;
      const persistedTeamId = data.selectedTeamId ?? data.teamId ?? null;

      setOrganizations(orgs);
      setTeams(teamsForOrg);

      const hasPersistedSelection = Boolean(persistedOrgId && persistedTeamId);

      if (hasPersistedSelection) {
        setSelection({ organizationId: persistedOrgId, teamId: persistedTeamId });
        setFormSelection({ organizationId: persistedOrgId, teamId: persistedTeamId });
        updateLocalStorage(persistedOrgId, persistedTeamId);
        setIsModalOpen(false);
        preferencesCache = {
          selection: { organizationId: persistedOrgId, teamId: persistedTeamId },
          organizations: orgs,
          teams: teamsForOrg,
        };
      } else {
        const defaultOrg = persistedOrgId ?? orgs[0]?.id ?? null;
        const defaultTeam = null;
        setSelection({ organizationId: null, teamId: null });
        setFormSelection({ organizationId: defaultOrg, teamId: defaultTeam });
        setIsModalOpen(true);
        preferencesCache = {
          selection: { organizationId: null, teamId: null },
          organizations: orgs,
          teams: teamsForOrg,
        };
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load preferences");
      setIsModalOpen(true);
    } finally {
      setReady(true);
      setLoading(false);
    }
  }, [updateLocalStorage]);

  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) {
      return;
    }
    hasBootstrapped.current = true;
    bootstrap();
  }, [bootstrap]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPreferences(selection.organizationId);
      const orgs = data.organizations ?? [];
      const teamsForOrg = sortTeams(data.teams ?? []);

      setOrganizations(orgs);
      setTeams(teamsForOrg);

      const persistedOrgId = data.selectedOrganizationId
        ?? data.organizationId
        ?? selection.organizationId
        ?? null;

      const persistedTeamId = data.selectedTeamId
        ?? data.teamId
        ?? selection.teamId
        ?? null;

      const hasPersistedSelection = Boolean(persistedOrgId && persistedTeamId);

      if (hasPersistedSelection) {
        setSelection({ organizationId: persistedOrgId, teamId: persistedTeamId });
        setFormSelection({ organizationId: persistedOrgId, teamId: persistedTeamId });
        updateLocalStorage(persistedOrgId, persistedTeamId);
        setIsModalOpen(false);
        preferencesCache = {
          selection: { organizationId: persistedOrgId, teamId: persistedTeamId },
          organizations: orgs,
          teams: teamsForOrg,
        };
      } else {
        setSelection({ organizationId: null, teamId: null });
        setFormSelection({ organizationId: persistedOrgId ?? orgs[0]?.id ?? null, teamId: null });
        setIsModalOpen(true);
        preferencesCache = {
          selection: { organizationId: null, teamId: null },
          organizations: orgs,
          teams: teamsForOrg,
        };
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load preferences");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selection.organizationId, selection.teamId, updateLocalStorage]);

  const handleOrganizationChange = useCallback(
    async (value: string | null) => {
      setFormSelection({ organizationId: value, teamId: null });
      setAddingNew(false);
      setNewTeamName("");
      if (!value) {
        setTeams([]);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPreferences(value);
        setOrganizations(data.organizations ?? []);
        const teamsForOrg = sortTeams(data.teams ?? []);
        setTeams(teamsForOrg);

        const resolvedTeam = data.selectedTeamId ?? data.teamId ?? teamsForOrg[0]?.id ?? null;
        setFormSelection({ organizationId: value, teamId: resolvedTeam });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load teams");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleTeamChange = useCallback((value: string | null) => {
    setFormSelection((prev) => ({ ...prev, teamId: value }));
  }, []);

  const formOrgId = formSelection.organizationId;
  const formTeamId = formSelection.teamId;

  const persistSelection = useCallback(
    async (organizationId: string, teamId: string | null) => {
      await savePreferences(organizationId, teamId);
      setSelection({ organizationId, teamId });
      setIsModalOpen(false);
      setAddingNew(false);
      setNewTeamName("");
      setError(null);
      updateLocalStorage(organizationId, teamId);
      preferencesCache = {
        selection: { organizationId, teamId },
        organizations,
        teams,
      };
      window.dispatchEvent(new CustomEvent("user-preferences-updated", {
        detail: { organizationId, teamId },
      }));
    },
    [updateLocalStorage, organizations, teams],
  );

  const handleContinue = useCallback(async () => {
    if (!formOrgId) {
      setError("Select an organization to continue.");
      return;
    }
    if (!formTeamId) {
      setError("Select a team to continue.");
      return;
    }

    setIsSaving(true);
    try {
      await persistSelection(formOrgId, formTeamId);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save selection");
    } finally {
      setIsSaving(false);
    }
  }, [persistSelection, formOrgId, formTeamId]);

  const handleCreateTeam = useCallback(async () => {
    const trimmedName = newTeamName.trim();
    if (!trimmedName) {
      setError("Team name cannot be empty.");
      return;
    }

    if (!formOrgId) {
      setError("Select an organization before adding a team.");
      return;
    }

    setIsCreatingTeam(true);
    setIsSaving(true);
    try {
      const response = await fetch("/api/checkins/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, organizationId: formOrgId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to create team");
      }

      const payload = await response.json() as { team?: TeamOption };
      const team = payload.team;
      if (!team) {
        throw new Error("Team creation response missing data");
      }

      const normalizedTeam: TeamOption = {
        id: team.id,
        name: team.name,
        organizationId: team.organizationId ?? formOrgId,
      };

      const updatedTeams = sortTeams([...teams.filter((item) => item.id !== normalizedTeam.id), normalizedTeam]);
      setTeams(updatedTeams);
      setFormSelection({ organizationId: formOrgId, teamId: normalizedTeam.id });
      setAddingNew(false);
      setNewTeamName("");

      await persistSelection(formOrgId, normalizedTeam.id);
      preferencesCache = {
        selection: { organizationId: formOrgId, teamId: normalizedTeam.id },
        organizations,
        teams: updatedTeams,
      };
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsCreatingTeam(false);
      setIsSaving(false);
    }
  }, [newTeamName, organizations, persistSelection, formOrgId, teams]);

  const contextValue = useMemo<TeamPreferencesContextValue>(() => ({
    ready,
    loading,
    selection,
    organizations,
    teams,
    openSelector: () => {
      setIsModalOpen(true);
    },
    refresh,
  }), [ready, loading, selection, organizations, teams, refresh]);

  const teamOptions = useMemo(() => sortTeams(teams).map((team) => ({
    value: team.id,
    label: team.name,
  })), [teams]);

  const organizationOptions = useMemo(() => organizations.map((org) => ({
    value: org.id,
    label: org.name,
  })), [organizations]);

  const shouldRenderChildren = ready && selection.organizationId && selection.teamId;

  return (
    <TeamPreferencesContext.Provider value={contextValue}>
      {shouldRenderChildren ? (
        children
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-[#fb7185]" />
            <p className="text-sm text-foreground/70">Preparing your workspace…</p>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur">
          <div className="relative w-full max-w-lg rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/75 p-8 shadow-xl supports-[backdrop-filter]:bg-background/40 dark:from-[#1a1a2e]/92 dark:to-[#232136]/70">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
              Choose your team to start
            </h1>
            <p className="mt-2 text-sm text-foreground/70 text-center">
              We&apos;ll remember your choice on this device.
            </p>

            {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="team-selector-org" className="text-sm font-medium text-foreground/90">
                  Select your organization
                </label>
                <SelectDropdown
                  value={formSelection.organizationId}
                  options={organizationOptions}
                  onChange={(value) => handleOrganizationChange(value)}
                  placeholder={organizationOptions.length ? "Select" : "No organizations available"}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="team-selector-team" className="text-sm font-medium text-foreground/90">
                  Select your team
                </label>
                <SelectDropdown
                  value={formSelection.teamId}
                  options={teamOptions}
                  onChange={(value) => handleTeamChange(value)}
                  placeholder={formSelection.organizationId ? "Select" : "Select an organization first"}
                  disabled={!formSelection.organizationId || addingNew || loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAddingNew((state) => !state)}
                disabled={!formSelection.organizationId}
                className={`text-sm font-semibold ${
                  !formSelection.organizationId
                    ? "cursor-not-allowed text-foreground/40"
                    : "text-foreground hover:text-[#fb7185]"
                }`}
              >
                {addingNew ? "Cancel" : "➕ Add a new team"}
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={addingNew || isSaving || !formSelection.organizationId || !formSelection.teamId}
                  className={`rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-sm font-semibold text-white transition ${
                    addingNew || isSaving || !formSelection.organizationId || !formSelection.teamId
                      ? "cursor-not-allowed opacity-50"
                      : "hover:opacity-95"
                  }`}
                >
                  {isSaving ? "Saving…" : "Continue"}
                </button>
              </div>

              {addingNew && (
                <div className="mt-3 space-y-3">
                  <label htmlFor="team-selector-new" className="text-sm font-medium text-foreground/90">
                    New team name
                  </label>
                  <input
                    id="team-selector-new"
                    value={newTeamName}
                    onChange={(event) => setNewTeamName(event.target.value)}
                    placeholder="e.g. Platform Tribe"
                    className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-transparent focus:ring-2 focus:ring-[#fb7185] dark:bg-foreground/5"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCreateTeam}
                      disabled={isCreatingTeam || !newTeamName.trim()}
                      className={`rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-sm font-semibold text-white transition ${
                        isCreatingTeam || !newTeamName.trim()
                          ? "cursor-not-allowed opacity-50"
                          : "hover:opacity-95"
                      }`}
                    >
                      {isCreatingTeam ? "Saving…" : "Save & continue"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TeamPreferencesContext.Provider>
  );
}

export function useTeamPreferences() {
  const context = useContext(TeamPreferencesContext);
  if (!context) {
    throw new Error("useTeamPreferences must be used within a TeamPreferencesProvider");
  }
  return context;
}
