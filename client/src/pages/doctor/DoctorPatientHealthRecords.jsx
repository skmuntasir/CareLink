import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { healthRecordsAPI } from '../../api/api';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import HealthSnapshotCard from '../../components/HealthSnapshotCard';
import RecordCard from '../../components/health/RecordCard';

export default function DoctorPatientHealthRecords() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const response = await healthRecordsAPI.getPatientRecords(patientId);
        if (!cancelled) setRecords(response.data.records || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load health records');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return (
    <div>
      <PageHeader
        eyebrow="Patient"
        title="Patient health records"
        subtitle="Vitals and notes recorded by the patient."
        back="/doctor/appointments"
        backLabel="Back to appointments"
        actions={!loading && <Badge tone="info" size="lg">{records.length} records</Badge>}
      />

      {error && <Alert tone="danger" className="mb-6">{error}</Alert>}

      <HealthSnapshotCard latestRecord={records[0] || null} loading={loading} title="Latest vitals" />

      <h2 className="mb-4 mt-8 font-display text-xl font-semibold text-fg">History</h2>
      {loading ? (
        <CardListSkeleton rows={2} />
      ) : records.length === 0 ? (
        <EmptyState icon={HeartPulse} title="No health records found" description="This patient hasn’t added any records yet." />
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <RecordCard key={record._id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
