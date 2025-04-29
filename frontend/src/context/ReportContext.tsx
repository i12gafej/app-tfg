import React, { createContext, useContext, useState, useEffect } from 'react';
import { SustainabilityReport, reportService } from '@/services/reportServices';
import { useAuth } from '@/hooks/useAuth';

interface ReportContextType {
  report: SustainabilityReport | null;
  updateReport: (field: keyof SustainabilityReport, value: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport debe ser usado dentro de un ReportProvider');
  }
  return context;
};

interface ReportProviderProps {
  children: React.ReactNode;
  reportId: number;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children, reportId }) => {
  const { token } = useAuth();
  const [report, setReport] = useState<SustainabilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        // Aquí necesitarás implementar un método en reportService para obtener un reporte por ID
        const reportData = await reportService.getReport(reportId, token);
        setReport(reportData);
      } catch (err) {
        setError('Error al cargar el reporte');
        console.error('Error al cargar el reporte:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, token]);

  const updateReport = async (field: keyof SustainabilityReport, value: any) => {
    if (!report || !token) return;

    try {
      setLoading(true);
      const updatedReport = await reportService.updateReport(
        report.id,
        { [field]: value },
        token
      );
      setReport(updatedReport);
    } catch (err) {
      setError('Error al actualizar el reporte');
      console.error('Error al actualizar el reporte:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportContext.Provider value={{ report, updateReport, loading, error }}>
      {children}
    </ReportContext.Provider>
  );
}; 