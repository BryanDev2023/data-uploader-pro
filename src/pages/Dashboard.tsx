import { FileSpreadsheet, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import csvUploaderService from '@/services/csv-uploader.service';
import type { Csv, CsvUploadRecord } from '@/types/csv';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allRecords, setAllRecords] = useState<Csv[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [failedUploads, setFailedUploads] = useState<CsvUploadRecord[]>([]);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAllCsvs = async () => {
      setIsLoadingAll(true);
      try {
        const data = await csvUploaderService.getAllCsvs();
        if (isMounted) {
          setAllRecords(data);
        }
      } catch (error) {
        if (isMounted) {
          setAllRecords([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAll(false);
        }
      }
    };
    const loadFailedUploads = async () => {
      setIsLoadingFailed(true);
      try {
        const data = await csvUploaderService.getFailedUploads();
        if (isMounted) {
          setFailedUploads(data);
        }
      } catch (error) {
        if (isMounted) {
          setFailedUploads([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFailed(false);
        }
      }
    };
    loadAllCsvs();
    loadFailedUploads();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalRecords = allRecords.length;
  const validRecords = totalRecords;
  const errorRecords = failedUploads.reduce((acc, record) => acc + record.errorCount, 0);
  const successRate = totalRecords > 0 ? ((validRecords / totalRecords) * 100).toFixed(1) : '0.0';
  const lastFailedUpload = failedUploads
    .map((record) => new Date(record.created_at))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const lastUploadLabel = lastFailedUpload
    ? lastFailedUpload.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Sin datos';

  const handleScrollToErrors = useCallback(() => {
    const target = document.getElementById('errores-dashboard');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const stats = [
    {
      title: 'Registros Cargados',
      value: totalRecords.toLocaleString(),
      description: 'Total de registros en el sistema',
      icon: FileSpreadsheet,
      color: 'text-primary',
    },
    {
      title: 'Registros Válidos',
      value: validRecords.toLocaleString(),
      description: `${successRate}% de tasa de éxito`,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Registros con Errores',
      value: errorRecords.toLocaleString(),
      description: 'Pendientes de corrección',
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
    {
      title: 'Última Carga',
      value: lastUploadLabel,
      description: failedUploads.length > 0 ? 'Fecha de la última carga con error' : 'Aún no hay cargas con error',
      icon: Clock,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Bienvenido, {user?.fullName}
          </h2>
          <p className="text-muted-foreground mt-1">
            Aquí tienes un resumen de la actividad del sistema
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Operaciones frecuentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start gap-2" 
                onClick={() => navigate('/upload')}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Cargar nuevo archivo CSV
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleScrollToErrors}
                disabled={isLoadingFailed || failedUploads.length === 0}
              >
                <AlertTriangle className="h-4 w-4" />
                Ver registros con errores
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Registros Cargados</CardTitle>
              <CardDescription>Listado de registros procesados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAll ? (
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando registros...
                </div>
              ) : allRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay registros cargados aún.</p>
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
                    {allRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.email}</TableCell>
                        <TableCell>{record.age}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6" id="errores-dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Archivos con errores</CardTitle>
              <CardDescription>
                Detalle completo de los archivos que fallaron o están incompletos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFailed ? (
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando errores...
                </div>
              ) : failedUploads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay archivos con errores.</p>
              ) : (
                <div className="space-y-6">
                  {failedUploads.map((record) => (
                    <div key={record._id} className="rounded-lg border border-destructive/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{record.originalName}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.errorCount} errores • {record.totalRows} filas • {record.successCount} exitosos
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Tipo: {record.mimeType} • Tamaño: {(record.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Creado: {new Date(record.created_at).toLocaleString('es-ES')}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">
                          {record.status}
                        </span>
                      </div>
                      {record.errors.length > 0 && (
                        <Table className="mt-3">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-24">Fila</TableHead>
                              <TableHead>Detalles</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {record.errors.map((error, index) => (
                              <TableRow key={`${record._id}-${error.row}-${index}`} className="bg-destructive/5">
                                <TableCell>{error.row}</TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {Object.entries(error.details).map(([field, message]) => (
                                      <p key={`${record._id}-${error.row}-${field}`} className="text-sm text-destructive">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
