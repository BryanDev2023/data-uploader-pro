import { FileSpreadsheet, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

const stats = [
  {
    title: 'Registros Cargados',
    value: '1,248',
    description: 'Total de registros en el sistema',
    icon: FileSpreadsheet,
    color: 'text-primary',
  },
  {
    title: 'Registros Válidos',
    value: '1,180',
    description: '94.5% de tasa de éxito',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  {
    title: 'Registros con Errores',
    value: '68',
    description: 'Pendientes de corrección',
    icon: AlertTriangle,
    color: 'text-amber-600',
  },
  {
    title: 'Última Carga',
    value: 'Hace 2h',
    description: '21 de enero, 2026',
    icon: Clock,
    color: 'text-muted-foreground',
  },
];

const recentUploads = [
  { id: 1, filename: 'clientes_enero.csv', records: 245, status: 'success', date: '21 Ene 2026' },
  { id: 2, filename: 'productos_lote3.csv', records: 89, status: 'partial', date: '20 Ene 2026' },
  { id: 3, filename: 'inventario_2026.csv', records: 512, status: 'success', date: '19 Ene 2026' },
  { id: 4, filename: 'ventas_q1.csv', records: 402, status: 'success', date: '18 Ene 2026' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
              <Button variant="outline" className="w-full justify-start gap-2">
                <AlertTriangle className="h-4 w-4" />
                Ver registros con errores
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Cargas Recientes</CardTitle>
              <CardDescription>Últimos archivos procesados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUploads.map((upload) => (
                  <div 
                    key={upload.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{upload.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {upload.records} registros • {upload.date}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      upload.status === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {upload.status === 'success' ? 'Completado' : 'Parcial'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
