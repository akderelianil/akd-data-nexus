import { Source, Resource, IngestionLog, ResourceConfig } from '../types';

// Mock Data Stores
const MOCK_SOURCES: Source[] = [
  { id: 'src-1', display_name: 'Trendyol', technical_name: 'trendyol', logo_color: 'bg-orange-500' },
  { id: 'src-2', display_name: 'Hepsiburada', technical_name: 'hepsiburada', logo_color: 'bg-orange-600' },
  { id: 'src-3', display_name: 'Amazon TR', technical_name: 'amazon_tr', logo_color: 'bg-yellow-500' },
  { id: 'src-4', display_name: 'Local ERP', technical_name: 'local_erp', logo_color: 'bg-blue-600' },
];

const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    source_id: 'src-1',
    display_name: 'Order List',
    technical_name: 'orders',
    category: 'portal',
    active: true,
    config: {
      format: 'excel',
      manual_fields: [
        { name: 'Report Date', target: 'report_date', type: 'date', required: true }
      ]
    }
  },
  {
    id: 'res-2',
    source_id: 'src-1',
    display_name: 'Product Catalog',
    technical_name: 'products',
    category: 'api',
    active: true,
    config: {
      format: 'csv',
      manual_fields: []
    }
  },
  {
    id: 'res-3',
    source_id: 'src-2',
    display_name: 'Settlement Reports',
    technical_name: 'settlements',
    category: 'other',
    active: true,
    config: {
      format: 'excel',
      manual_fields: [
        { name: 'Settlement Month', target: 'settlement_month', type: 'text', required: true },
        { name: 'Exchange Rate', target: 'exchange_rate', type: 'decimal', required: false }
      ]
    }
  }
];

export const EMPTY_CONFIG: ResourceConfig = { format: 'excel', manual_fields: [] };

const MOCK_LOGS: IngestionLog[] = [
  { id: 'log-1', resource_id: 'res-1', source_name: 'Trendyol', resource_name: 'Order List', file_name: 'weekly_orders.xlsx', row_count: 1420, status: 'SUCCESS', ingested_at: '2023-10-27T10:30:00Z' },
  { id: 'log-2', resource_id: 'res-3', source_name: 'Hepsiburada', resource_name: 'Settlement Reports', file_name: 'settlement_oct.csv', row_count: 502, status: 'FAILED', ingested_at: '2023-10-26T15:45:00Z' },
  { id: 'log-3', resource_id: 'res-1', source_name: 'Trendyol', resource_name: 'Order List', file_name: 'daily_dump.xlsx', row_count: 120, status: 'SUCCESS', ingested_at: '2023-10-26T09:00:00Z' },
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// TDD 4.2 Sanitizer Logic Implementation (Client-side mirror)
export const sanitizeHeader = (header: string): string => {
  const map: Record<string, string> = {
    'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
    'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'
  };
  
  let normalized = header.replace(/[ığüşöçİĞÜŞÖÇ]/g, (char) => map[char] || char);
  normalized = normalized.toLowerCase();
  normalized = normalized.replace(/[^a-z0-9]/g, '_'); // Replace non-alphanumeric with _
  normalized = normalized.replace(/_+/g, '_'); // Collapse multiple underscores
  normalized = normalized.replace(/^_+|_+$/g, ''); // Trim leading/trailing
  
  return normalized;
};

export const api = {
  getSources: async (): Promise<Source[]> => {
    await delay(500);
    return MOCK_SOURCES;
  },

  getResources: async (sourceId: string): Promise<Resource[]> => {
    await delay(400);
    return MOCK_RESOURCES.filter(r => r.source_id === sourceId);
  },

  getRecentLogs: async (): Promise<IngestionLog[]> => {
    await delay(600);
    return MOCK_LOGS;
  },

  // Simulates the POST /api/preview
  uploadPreview: async (file: File): Promise<any[]> => {
    await delay(1500);
    // Return dummy sanitized data to demonstrate the TDD "Bronze Layer" requirement
    return [
      { siparis_numarasi: "TY-29384", musteri_adi: "Ahmet Yılmaz", tutar: "150.50", tarih: "2023-10-27" },
      { siparis_numarasi: "TY-99283", musteri_adi: "Ayşe Demir", tutar: "920.00", tarih: "2023-10-27" },
      { siparis_numarasi: "TY-11234", musteri_adi: "Mehmet Öz", tutar: "45.00", tarih: "2023-10-26" },
      { siparis_numarasi: "TY-55432", musteri_adi: "Canan Kara", tutar: "1250.90", tarih: "2023-10-26" },
      { siparis_numarasi: "TY-76543", musteri_adi: "Zeynep Su", tutar: "300.00", tarih: "2023-10-25" },
    ];
  },

  // Simulates POST /api/ingest
  ingestFile: async (resourceId: string, file: File): Promise<{ success: boolean }> => {
    // Simulate streaming upload progress
    return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 3000);
    });
  }
};