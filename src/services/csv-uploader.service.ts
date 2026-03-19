import { Csv, CsvUploadResponse, CsvUploadRecord, UpdateCsvPayload } from "@/types/csv";
import api from "./api.service";

const csvUploaderService = {
  uploadCsv: async (file: File): Promise<CsvUploadResponse['data']> => {
    const response = await api.uploadFile('/csv-uploader/upload-file', file);
    if (!response.data) {
      throw new Error(response.message);
    }
    return response.data;
  },
  getAllCsvs: async (): Promise<Csv[]> => {
    const response = await api.get('/csv-uploader');
    if (!response.data) {
      throw new Error(response.message);
    }
    return response.data;
  },
  getFailedUploads: async (): Promise<CsvUploadRecord[]> => {
    const response = await api.get('/csv-uploader/failed-uploads');
    if (!response.data) {
      throw new Error(response.message);
    }
    return response.data;
  },
  updateCsv: async (csvId: string, payload: UpdateCsvPayload): Promise<Csv> => {
    const response = await api.patch(`/csv-uploader/${csvId}`, payload);
    if (!response.data) {
      throw new Error(response.message);
    }
    return response.data;
  },
  deleteCsv: async (csvId: string): Promise<void> => {
    const response = await api.delete(`/csv-uploader/${csvId}`);
    if (!response.data) {
      throw new Error(response.message);
    }
    return response.data;
  }
}

export default csvUploaderService;
