import { useState, useCallback } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import csvUploaderService from '@/services/csv-uploader.service';
import type { Csv, CsvError } from '@/types/csv';

const Upload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successRecords, setSuccessRecords] = useState<Csv[]>([]);
  const [errorRecords, setErrorRecords] = useState<CsvError[]>([]);
  const [isProcessed, setIsProcessed] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
    } else {
      toast({
        title: 'Archivo no válido',
        description: 'Por favor, selecciona un archivo CSV',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const response = await csvUploaderService.uploadCsv(file);
      setUploadProgress(90);
      setSuccessRecords(response.success);
      setErrorRecords(response.errors);
      setIsProcessed(true);
      setUploadProgress(100);
      toast({
        title: 'Archivo procesado',
        description: `Exitosos: ${response.success.length}, con errores: ${response.errors.length}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo procesar el archivo';
      toast({
        title: 'Error al procesar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setSuccessRecords([]);
    setErrorRecords([]);
    setIsProcessed(false);
    setUploadProgress(0);
  };

  const validCount = successRecords.length;
  const invalidCount = errorRecords.length;
  const totalCount = validCount + invalidCount;

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Cargar Archivo CSV</h2>
          <p className="text-muted-foreground mt-1">
            Sube un archivo CSV para validar y cargar registros al sistema
          </p>
        </div>

        <div className="grid gap-6">
          {/* Upload Zone */}
          {!isProcessed && (
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Archivo</CardTitle>
                <CardDescription>
                  Arrastra y suelta un archivo CSV o haz clic para seleccionar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }
                  `}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-muted">
                      <UploadIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo CSV aquí'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        o haz clic para seleccionar desde tu dispositivo
                      </p>
                    </div>
                  </div>
                </div>

                {file && !isUploading && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleUpload}>
                        Procesar Archivo
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleClear}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Procesando archivo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {isProcessed && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Registros</p>
                        <p className="text-2xl font-bold">{totalCount}</p>
                      </div>
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Válidos</p>
                        <p className="text-2xl font-bold text-green-600">{validCount}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Con Errores</p>
                        <p className="text-2xl font-bold text-amber-600">{invalidCount}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resultados */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Resultados del Procesamiento</CardTitle>
                      <CardDescription>
                        Revisa los registros cargados y los errores encontrados
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleClear} disabled={isUploading}>
                        Cargar otro archivo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Registros exitosos</h3>
                      {successRecords.length === 0 ? (
                        <p className="text-sm text-muted-foreground mt-2">No hay registros exitosos.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Edad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {successRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{record.name}</TableCell>
                                <TableCell>{record.email}</TableCell>
                                <TableCell>{record.age}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Registros con errores</h3>
                      {errorRecords.length === 0 ? (
                        <p className="text-sm text-muted-foreground mt-2">No hay errores en el archivo.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-24">Fila</TableHead>
                              <TableHead>Detalles</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {errorRecords.map((error, index) => (
                              <TableRow key={`${error.row}-${index}`} className="bg-destructive/5">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <span>{error.row}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {Object.entries(error.details).map(([field, message]) => (
                                      <p key={`${error.row}-${field}`} className="text-sm text-destructive">
                                        {field}: {message}
                                      </p>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;
