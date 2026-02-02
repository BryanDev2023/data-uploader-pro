import { Csv, CsvUploadResponse, CsvUploadRecord } from "@/types/csv";
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
  
}

export default csvUploaderService;
