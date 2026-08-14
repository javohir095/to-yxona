import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";
import { FullscreenLoader } from "@/components/shared/fullscreen-loader";
import { NoVenuePage } from "@/pages/auth/no-venue-page";
import type { UserRole } from "@/entities";

export function RequireAuth() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullscreenLoader />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RequireVenue() {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <FullscreenLoader />;
  if (profile?.role === "superadmin") return <Navigate to="/admin" replace />;
  if (!profile?.venue_id) return <NoVenuePage />;
  return <Outlet />;
}

export function RequireSuperadmin() {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <FullscreenLoader />;
  if (profile?.role !== "superadmin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <FullscreenLoader />;
  if (profile && !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) return <FullscreenLoader />;
  if (session) return <Navigate to={profile?.role === "superadmin" ? "/admin" : "/"} replace />;
  return <>{children}</>;
}
