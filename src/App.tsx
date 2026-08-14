import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  RedirectIfAuthed,
  RequireAuth,
  RequireRole,
  RequireSuperadmin,
  RequireVenue,
} from "@/components/layout/route-guards";
import { MANAGEMENT_ROLES } from "@/components/layout/nav-config";
import { LoginPage } from "@/pages/auth/login-page";
import { StaffPage } from "@/pages/staff/staff-page";
import { VenuesPage } from "@/pages/admin/venues-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { BookingsPage } from "@/pages/bookings/bookings-page";
import { BookingDetailPage } from "@/pages/bookings/booking-detail-page";
import { HallsPage } from "@/pages/halls/halls-page";
import { PaymentsPage } from "@/pages/payments/payments-page";
import { DebtsPage } from "@/pages/debts/debts-page";
import { ReportsPage } from "@/pages/reports/reports-page";
import { MenusPage } from "@/pages/menus/menus-page";
import { RequisitionsPage } from "@/pages/requisitions/requisitions-page";
import { InventoryPage } from "@/pages/inventory/inventory-page";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route element={<RequireAuth />}>
        <Route element={<RequireSuperadmin />}>
          <Route element={<AdminShell />}>
            <Route path="admin" element={<VenuesPage />} />
          </Route>
        </Route>

        <Route element={<RequireVenue />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="halls" element={<HallsPage />} />

            <Route element={<RequireRole roles={MANAGEMENT_ROLES} />}>
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="debts" element={<DebtsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            <Route path="menus" element={<MenusPage />} />
            <Route path="requisitions" element={<RequisitionsPage />} />
            <Route path="inventory" element={<InventoryPage />} />

            <Route element={<RequireRole roles={["owner"]} />}>
              <Route path="staff" element={<StaffPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
