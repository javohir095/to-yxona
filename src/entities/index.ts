import type { Enums, Tables, TablesInsert, TablesUpdate } from "./database.types";

export type UserRole = Enums<"user_role">;
export type EventType = Enums<"event_type">;
export type BookingStatus = Enums<"booking_status">;
export type PaymentType = Enums<"payment_type">;
export type RequisitionType = Enums<"requisition_type">;

export type Venue = Tables<"venues">;
export type Profile = Tables<"profiles">;
export type Hall = Tables<"halls">;
export type HallInsert = TablesInsert<"halls">;
export type HallUpdate = TablesUpdate<"halls">;

export type MenuPackage = Tables<"menu_packages">;
export type MenuPackageInsert = TablesInsert<"menu_packages">;
export type MenuPackageUpdate = TablesUpdate<"menu_packages">;

export type MenuItem = Tables<"menu_items">;
export type MenuItemInsert = TablesInsert<"menu_items">;

export type MenuItemIngredient = Tables<"menu_item_ingredients">;
export type MenuItemIngredientInsert = TablesInsert<"menu_item_ingredients">;

export type Booking = Tables<"bookings">;
export type BookingInsert = TablesInsert<"bookings">;
export type BookingUpdate = TablesUpdate<"bookings">;

export type Payment = Tables<"payments">;
export type PaymentInsert = TablesInsert<"payments">;

export type Requisition = Tables<"requisitions">;
export type RequisitionItem = Tables<"requisition_items">;

export type InventoryItem = Tables<"inventory_items">;

export type BookingPaymentSummary = Tables<"booking_payment_summary">;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "To'y",
  circumcision: "Sunnat to'yi",
  celebration: "Nishonlash",
  corporate: "Korporativ",
  other: "Boshqa",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  booked: "Bron qilindi",
  deposit_paid: "Avans olindi",
  fully_paid: "To'liq to'landi",
  completed: "O'tkazildi",
  cancelled: "Bekor qilindi",
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  cash: "Naqd",
  card: "Karta",
  transfer: "O'tkazma",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  owner: "Egasi",
  manager: "Menejer",
  kitchen_staff: "Oshxona xodimi",
  superadmin: "Superadmin",
};

export const VENUE_ROLES: UserRole[] = ["owner", "manager", "kitchen_staff"];
