import { useState, useCallback } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2, Edit2, Save } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface CSVRecord {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  isValid: boolean;
  error?: string;
  isEditing?: boolean;
}

// Datos simulados para la maqueta
const mockCSVData: CSVRecord[] = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@ejemplo.com', telefono: '555-1234', isValid: true },
  { id: 2, nombre: 'María García', email: 'maria@ejemplo.com', telefono: '555-5678', isValid: true },
  { id: 3, nombre: 'Carlos López', email: 'carlos-invalido', telefono: '555-9012', isValid: false, error: 'Email inválido' },
  { id: 4, nombre: 'Ana Martínez', email: 'ana@ejemplo.com', telefono: '555-3456', isValid: true },
  { id: 5, nombre: '', email: 'sin-nombre@ejemplo.com', telefono: '555-7890', isValid: false, error: 'Nombre requerido' },
  { id: 6, nombre: 'Pedro Sánchez', email: 'pedro@ejemplo.com', telefono: '555-2345', isValid: true },
];

const Upload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [records, setRecords] = useState<CSVRecord[]>([]);
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
    setUploadProgress(0);

    // Simular progreso de carga
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setUploadProgress(i);
    }

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));
    setRecords(mockCSVData);
    setIsProcessed(true);
    setIsUploading(false);

    toast({
      title: 'Archivo procesado',
      description: `Se encontraron ${mockCSVData.length} registros`,
    });
  };

  const handleEdit = (id: number) => {
    setRecords(prev => prev.map(r => 
      r.id === id ? { ...r, isEditing: true } : r
    ));
  };

  const handleSaveEdit = (id: number, field: keyof CSVRecord, value: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value, isEditing: false };
        // Simulación de re-validación
        if (field === 'email' && value.includes('@')) {
          updated.isValid = true;
          updated.error = undefined;
        }
        if (field === 'nombre' && value.trim()) {
          updated.isValid = true;
          updated.error = undefined;
        }
        return updated;
      }
      return r;
    }));
    
    toast({
      title: 'Registro actualizado',
      description: 'El registro ha sido corregido correctamente',
    });
  };

  const handleConfirmUpload = async () => {
    const invalidCount = records.filter(r => !r.isValid).length;
    
    if (invalidCount > 0) {
      toast({
        title: 'Registros inválidos',
        description: `Aún hay ${invalidCount} registros con errores`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(false);

    toast({
      title: '¡Carga exitosa!',
      description: `${records.length} registros han sido guardados correctamente`,
    });

    // Reset state
    setFile(null);
    setRecords([]);
    setIsProcessed(false);
  };

  const handleClear = () => {
    setFile(null);
    setRecords([]);
    setIsProcessed(false);
    setUploadProgress(0);
  };

  const validCount = records.filter(r => r.isValid).length;
  const invalidCount = records.filter(r => !r.isValid).length;

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
                        <p className="text-2xl font-bold">{records.length}</p>
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

              {/* Data Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Vista Previa de Datos</CardTitle>
                      <CardDescription>
                        Revisa y corrige los registros antes de confirmar la carga
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleClear}>
                        Cancelar
                      </Button>
                      <Button onClick={handleConfirmUpload} disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Confirmar Carga'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Estado</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead className="w-24">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id} className={!record.isValid ? 'bg-destructive/5' : ''}>
                          <TableCell>
                            {record.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.isEditing ? (
                              <Input
                                defaultValue={record.nombre}
                                className="h-8"
                                onBlur={(e) => handleSaveEdit(record.id, 'nombre', e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div>
                                <span>{record.nombre || <span className="text-muted-foreground italic">Vacío</span>}</span>
                                {record.error?.includes('Nombre') && (
                                  <p className="text-xs text-destructive">{record.error}</p>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.isEditing ? (
                              <Input
                                defaultValue={record.email}
                                className="h-8"
                                onBlur={(e) => handleSaveEdit(record.id, 'email', e.target.value)}
                              />
                            ) : (
                              <div>
                                <span>{record.email}</span>
                                {record.error?.includes('Email') && (
                                  <p className="text-xs text-destructive">{record.error}</p>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{record.telefono}</TableCell>
                          <TableCell>
                            {!record.isValid && !record.isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(record.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {record.isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setRecords(prev => prev.map(r => 
                                  r.id === record.id ? { ...r, isEditing: false } : r
                                ))}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
