export interface BrandingConfig {
  candidate_name?: string;
  contact_name?: string;
  privacy_url?: string;
  privacy_video_url?: string;
  volunteer_welcome_message?: string;
  welcome_message?: string;
  // Colores del tema
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  surface_color?: string;
  text_primary_color?: string;
  text_secondary_color?: string;
  success_color?: string;
  warning_color?: string;
  error_color?: string;
  // Branding visual
  logo_url?: string;
  logo_size?: 'small' | 'medium' | 'large';
  title?: string;
  description?: string;
}

export interface AIConfig {
  documentation_bucket_url?: string;
}

export interface TenantConfigPublic {
  tenant_id: string;
  branding?: BrandingConfig;
  ai_config?: AIConfig;
  subdomain?: string;
  // Campos públicos de contacto e integración
  link_calendly?: string;  // URL de Calendly
  link_forms?: string;  // URL de formularios
  numero_whatsapp?: string;  // Número de WhatsApp para contacto
  agent_emails?: string[];  // Emails de contacto público
}

export interface TenantConfigResponse {
  tenant_id: string;
  client_project_id: string;
  client_database_id?: string;
  branding?: any;
  ai_config?: any;
  agent_emails?: string[];
  subdomain?: string;
  manychatApiToken?: string;
  numero_whatsapp?: string;
  link_calendly?: string;
  link_forms?: string;
  client_credentials_secret?: string;
  tenant_type?: string;  // 'prod', 'dev', 'test', etc.
  use_adc?: boolean;  // Application Default Credentials
  status?: string;  // 'active', 'inactive', 'suspended'
  wati_api_endpoint?: string;  // Wati API endpoint URL
  wati_api_token?: string;  // Wati API token
  wati_tenant_id?: string;  // Wati tenant ID
  created_at?: string;
}

export interface TenantListItem {
  tenant_id: string;
  candidate_name?: string;
  contact_name?: string;
  subdomain?: string;
  client_project_id?: string;
  status?: string;
}

export interface TenantListResponse {
  tenants: TenantListItem[];
  total: number;
}

export interface TenantConfigUpdate {
  client_project_id?: string;
  client_database_id?: string;
  branding?: any;
  ai_config?: any;
  agent_emails?: string[];
  subdomain?: string;
  manychatApiToken?: string;
  numero_whatsapp?: string;
  link_calendly?: string;
  link_forms?: string;
  client_credentials_secret?: string;
  tenant_type?: string;  // 'prod', 'dev', 'test', etc.
  use_adc?: boolean;  // Application Default Credentials
  status?: string;  // 'active', 'inactive', 'suspended'
  wati_api_endpoint?: string;
  wati_api_token?: string;
  wati_tenant_id?: string;
}

export interface TenantCreate {
  tenant_id: string;
  client_project_id: string;
  client_database_id?: string;
  branding?: any;
  ai_config?: any;
  agent_emails?: string[];
  subdomain?: string;
  manychatApiToken?: string;
  numero_whatsapp?: string;
  link_calendly?: string;
  link_forms?: string;
  client_credentials_secret?: string;
  tenant_type?: string;  // 'prod', 'dev', 'test', etc.
  use_adc?: boolean;  // Application Default Credentials
  status?: string;  // 'active', 'inactive', 'suspended'
  wati_api_endpoint?: string;
  wati_api_token?: string;
  wati_tenant_id?: string;
}

