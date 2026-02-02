export interface Csv {
  id: string;
  name: string;
  email: string;
  age: number;
}

export interface CsvError {
  row: number;
  details: CsvDetails;
}

export type CsvDetails = Record<string, string>;

export interface CsvUploadRecord {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: CsvError[];
  created_at: string;
  updated_at: string;
}

export interface CsvUploadResponse {
  message: string;
  data: {
    success: Csv[];
    errors: CsvError[];
  }
}
