export type AppRole = "user" | "admin" | "employee";

export type PriceType = "fixed" | "custom";
export type UserServiceStatus = "pending" | "active" | "completed";
export type DocumentType = "upload" | "output";
export type TicketStatus = "open" | "resolved";
export type CallbackStatus = "pending" | "contacted";

export type Profile = {
  id: string;
  full_name: string | null;
  phone_country_code?: string | null;
  phone_number?: string | null;
  alternate_phone?: string | null;
  country_of_residence?: string | null;
  time_zone?: string | null;
  preferred_contact_method?: "email" | "whatsapp" | "phone" | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  passport_number?: string | null;
  india_address?: string | null;
  property_location?: string | null;
  service_purpose?: "property" | "legal" | "documentation" | "other" | null;
  profile_completed_at?: string | null;
  role: AppRole;
  created_at: string;
};

export type Service = {
  id: string;
  title: string;
  description: string | null;
  detailed_description: string | null;
  thumbnail_url: string | null;
  required_documents: string[];
  timeline_estimate: string | null;
  price_type: PriceType;
  created_at: string;
};

export type UserService = {
  id: string;
  user_id: string;
  service_id: string;
  status: UserServiceStatus;
  assigned_employee: string | null;
  whatsapp_country_code?: string | null;
  whatsapp_number?: string | null;
  preferred_call_time?: string | null;
  preferred_call_timezone?: string | null;
  call_completed?: boolean;
  payment_status?: "not_paid" | "paid";
  created_at: string;
};

export type DocumentRow = {
  id: string;
  user_id: string;
  service_id: string;
  request_id?: string | null;
  type: DocumentType;
  file_url: string;
  created_at: string;
};

export type TicketRow = {
  id: string;
  user_id: string;
  message: string;
  status: TicketStatus;
  created_at: string;
};

export type TicketMessageRow = {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
};

export type CallbackRow = {
  id: string;
  user_id: string;
  message: string;
  status: CallbackStatus;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  read_at: string | null;
  created_at: string;
};
