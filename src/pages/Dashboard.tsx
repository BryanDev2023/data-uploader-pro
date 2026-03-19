import { FileSpreadsheet, CheckCircle, AlertTriangle, Clock, Loader2, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Header from '@/components/layout/Header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import csvUploaderService from '@/services/csv-uploader.service';
import type { Csv, CsvUploadRecord } from '@/types/csv';

const Dashboard = () => {
  const PAGE_SIZE = 5;
  const FAILED_PAGE_SIZE = 2;
  const getCsvId = (record: Csv): string => record.id ?? record._id ?? '';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Csv[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [failedUploads, setFailedUploads] = useState<CsvUploadRecord[]>([]);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFailedPage, setCurrentFailedPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<Csv | null>(null);
  const [editingForm, setEditingForm] = useState({ name: '', email: '', age: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [expandedErrorBlocks, setExpandedErrorBlocks] = useState<Record<string, boolean>>({});

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
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const paginatedRecords = allRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalFailedPages = Math.max(1, Math.ceil(failedUploads.length / FAILED_PAGE_SIZE));
  const paginatedFailedUploads = failedUploads.slice(
    (currentFailedPage - 1) * FAILED_PAGE_SIZE,
    currentFailedPage * FAILED_PAGE_SIZE
  );
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

  const handleOpenEdit = useCallback((record: Csv) => {
    setEditingRecord(record);
    setEditingForm({
      name: record.name,
      email: record.email,
      age: String(record.age),
    });
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditingRecord(null);
    setEditingForm({ name: '', email: '', age: '' });
    setIsSavingEdit(false);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingRecord) return;
    const editingRecordId = getCsvId(editingRecord);
    if (!editingRecordId) {
      toast({
        title: 'Error al actualizar',
        description: 'El registro no tiene un identificador válido.',
        variant: 'destructive',
      });
      return;
    }
    const trimmedName = editingForm.name.trim();
    const trimmedEmail = editingForm.email.trim();
    const parsedAge = Number(editingForm.age);

    if (!trimmedName || !trimmedEmail || Number.isNaN(parsedAge) || parsedAge <= 0) {
      toast({
        title: 'Datos inválidos',
        description: 'Completa nombre, email y edad mayor a 0.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSavingEdit(true);
      const updated = await csvUploaderService.updateCsv(editingRecordId, {
        name: trimmedName,
        email: trimmedEmail,
        age: parsedAge,
      });
      const updatedId = getCsvId(updated);
      setAllRecords((prev) =>
        prev.map((item) => (getCsvId(item) === updatedId ? updated : item))
      );
      toast({
        title: 'Registro actualizado',
        description: 'Los datos se guardaron correctamente.',
      });
      handleCloseEdit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el registro';
      toast({
        title: 'Error al actualizar',
        description: message,
        variant: 'destructive',
      });
      setIsSavingEdit(false);
    }
  }, [editingForm, editingRecord, handleCloseEdit, toast]);

  const handleDelete = useCallback(async (record: Csv) => {
    const recordId = getCsvId(record);
    if (!recordId) {
      toast({
        title: 'Error al eliminar',
        description: 'El registro no tiene un identificador válido.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsDeletingId(recordId);
      await csvUploaderService.deleteCsv(recordId);
      setAllRecords((prev) => prev.filter((item) => getCsvId(item) !== recordId));
      toast({
        title: 'Registro eliminado',
        description: `Se eliminó a ${record.name} correctamente.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el registro';
      toast({
        title: 'Error al eliminar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingId(null);
    }
  }, [toast]);

  const toggleErrorBlock = useCallback((uploadId: string) => {
    setExpandedErrorBlocks((prev) => ({
      ...prev,
      [uploadId]: !prev[uploadId],
    }));
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (currentFailedPage > totalFailedPages) {
      setCurrentFailedPage(totalFailedPages);
    }
  }, [currentFailedPage, totalFailedPages]);

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
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Total de elementos: {totalRecords}</span>
                    <span>
                      Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-
                      {Math.min(currentPage * PAGE_SIZE, totalRecords)} de {totalRecords}
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Edad</TableHead>
                        <TableHead className="w-24 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record) => (
                        <TableRow key={getCsvId(record) || `${record.email}-${record.name}`}>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>{record.age}</TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={Boolean(isDeletingId)}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenEdit(record)}>
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDelete(record)}
                                    disabled={isDeletingId === getCsvId(record)}
                                  >
                                    {isDeletingId === getCsvId(record) ? 'Eliminando...' : 'Eliminar'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalRecords > PAGE_SIZE && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((prev) => Math.max(1, prev - 1));
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                          <PaginationItem key={`page-${page}`}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
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
                  {paginatedFailedUploads.map((record) => (
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
                        <Collapsible
                          open={Boolean(expandedErrorBlocks[record._id])}
                          onOpenChange={() => toggleErrorBlock(record._id)}
                        >
                          <div className="mt-3">
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                {expandedErrorBlocks[record._id] ? (
                                  <>
                                    <ChevronUp className="h-4 w-4" />
                                    Ocultar detalles ({record.errors.length})
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4" />
                                    Mostrar detalles ({record.errors.length})
                                  </>
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
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
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}
                    </div>
                  ))}
                  {failedUploads.length > FAILED_PAGE_SIZE && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentFailedPage((prev) => Math.max(1, prev - 1));
                            }}
                            className={currentFailedPage === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalFailedPages }, (_, index) => index + 1).map((page) => (
                          <PaginationItem key={`failed-page-${page}`}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentFailedPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentFailedPage(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentFailedPage((prev) => Math.min(totalFailedPages, prev + 1));
                            }}
                            className={currentFailedPage === totalFailedPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={Boolean(editingRecord)} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
            <DialogDescription>
              Actualiza los campos del registro seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Input
              placeholder="Nombre"
              value={editingForm.name}
              onChange={(e) => setEditingForm((prev) => ({ ...prev, name: e.target.value }))}
              disabled={isSavingEdit}
            />
            <Input
              type="email"
              placeholder="Email"
              value={editingForm.email}
              onChange={(e) => setEditingForm((prev) => ({ ...prev, email: e.target.value }))}
              disabled={isSavingEdit}
            />
            <Input
              type="number"
              min={1}
              placeholder="Edad"
              value={editingForm.age}
              onChange={(e) => setEditingForm((prev) => ({ ...prev, age: e.target.value }))}
              disabled={isSavingEdit}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEdit} disabled={isSavingEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
