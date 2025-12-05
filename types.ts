
export interface Source {
  id: string;
  display_name: string;
  technical_name: string;
  logo_color?: string;
}

export interface ManualField {
  name: string; // Label displayed to user (e.g., "Report Date")
  target: string; // Column name in DB (e.g., "report_date")
  type: 'text' | 'integer' | 'decimal' | 'date' | 'boolean';
  required: boolean;
  description?: string;
}

export type FileFormat = 'excel' | 'csv' | 'html' | 'json' | 'parquet';

export interface ResourceConfig {
  format: FileFormat;
  manual_fields: ManualField[];
}

export interface Resource {
  id: string;
  source_id: string;
  display_name: string;
  technical_name: string;
  category: string;
  config: ResourceConfig;
  active: boolean;
}

export interface IngestionLog {
  id: string;
  resource_id: string;
  source_name?: string; // Joined for display
  resource_name?: string; // Joined for display
  file_name: string;
  row_count: number;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
  ingested_at: string;
}

export interface IngestStepProps {
  onNext: () => void;
  onBack: () => void;
  data: IngestState;
  updateData: (data: Partial<IngestState>) => void;
}

export interface IngestState {
  sourceId: string | null;
  resourceId: string | null;
  file: File | null;
  previewData: any[] | null;
  uploadProgress: number;
  manualValues: Record<string, any>;
}