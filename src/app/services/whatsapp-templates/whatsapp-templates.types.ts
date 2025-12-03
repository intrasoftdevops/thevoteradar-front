// Types WhatsApp Templates

export interface WhatsAppTemplatePending {
  template_id: string;
  template_name: string;
  template_content: string;
  parameters: string[];
  category: string;
  language: string;
  created_by: string;
  created_at: string;
  status: 'pending' | 'created' | 'failed';
  wati_template_id?: string;
  notes?: string;
  updated_at?: string;
  approved_by?: string;
}

export interface WhatsAppTemplatePendingCreate {
  template_name: string;
  template_content: string;
  parameters: string[];
  category?: string;
  language?: string;
  notes?: string;
}

export interface WhatsAppTemplateStatusResponse {
  template_id: string;
  template_name: string;
  status: 'pending' | 'created' | 'failed';
  created_at: string;
  updated_at?: string;
  approved_by?: string;
  wati_template_id?: string;
}

export interface WhatsAppTemplatesByCreatorResponse {
  templates: WhatsAppTemplatePending[];
  total: number;
}

export interface WhatsAppTemplateSummaryResponse {
  summary: {
    pending: number;
    created: number;
    failed: number;
    total: number;
  };
  recent_templates: {
    pending: Array<{
      template_id: string;
      template_name: string;
      created_at: string;
    }>;
    created: Array<{
      template_id: string;
      template_name: string;
      created_at: string;
    }>;
    failed: Array<{
      template_id: string;
      template_name: string;
      created_at: string;
    }>;
  };
}

export interface WhatsAppTemplateSendPendingRequest {
  template_id: string;
  recipients: string[];
  parameters_values: Record<string, string>[];
}

export interface WhatsAppTemplateSendPendingResponse {
  template_id: string;
  total_sent: number;
  total_failed: number;
  results: Array<{
    recipient: string;
    status: 'sent' | 'failed';
    error?: string;
    response?: string;
  }>;
}

export interface WhatsAppTemplateUpdateStatusRequest {
  status: 'pending' | 'created' | 'failed';
  wati_template_id?: string;
}

export interface WhatsAppTemplateUpdateStatusResponse {
  message: string;
  template: WhatsAppTemplatePending;
}

// Types for direct template sending
export interface WhatsAppTemplateParameter {
  name: string;
  value: string;
}

export interface WhatsAppTemplatePayload {
  to: string;
  template_name: string;
  parameters?: Record<string, string> | string[] | WhatsAppTemplateParameter[];
  broadcast_name?: string;
}

export interface BatchReceiver {
  whatsappNumber: string;
  customParams?: Record<string, string> | WhatsAppTemplateParameter[];
}

export interface SendTemplatesBatchRequest {
  template_name: string;
  receivers: BatchReceiver[];
  broadcast_name?: string;
  channel_number?: string;
}

export interface WhatsAppSendResponse {
  ok: boolean;
  status: number;
  response: string;
}

// Types for referrals
export interface UserDetails {
  name: string;
  lastname: string;
  phone: string;
  city?: string | null;
  state?: string | null;
}

export interface ReferralStateDetails {
  WAITING_NAME: UserDetails[];
  WAITING_LASTNAME: UserDetails[];
  WAITING_REFERRAL_CODE: UserDetails[];
  WAITING_TERMS_ACCEPTANCE: UserDetails[];
  WAITING_CITY: UserDetails[];
  CONFIRM_DATA: UserDetails[];
  COMPLETED: UserDetails[];
  OTROS: UserDetails[];
}

export interface ReferralDetailsResponse {
  phone: string;
  directos: ReferralStateDetails;
  indirectos: ReferralStateDetails;
}


