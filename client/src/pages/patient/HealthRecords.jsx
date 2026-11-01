import { useEffect, useMemo, useState } from 'react';
import { HeartPulse, Plus, TrendingUp } from 'lucide-react';
import { healthRecordsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import HealthSnapshotCard from '../../components/HealthSnapshotCard';
import RecordCard from '../../components/health/RecordCard';
import Sparkline from '../../components/health/Sparkline';

const EMPTY_FORM = { systolic: '', diastolic: '', bloodSugar: '', weight: '', height: '', notes: '' };

const toNumber = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

function TrendTile({ label, unit, values }) {
  const latest = values[values.length - 1];
  const delta = values.length > 1 ? latest - values[values.length - 2] : 0;
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface-2/50 p-4">
      <div>
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-fg">
          {latest}
          <span className="ml-1 text-xs font-medium text-subtle">{unit}</span>
        </p>
        <p className="mt-0.5 text-xs text-subtle">
          {delta === 0 ? 'No change' : `${delta > 0 ? '+' : ''}${Math.round(delta * 10) / 10} since previous`}
        </p>
      </div>
      <Sparkline values={values} />
    </div>
  );
}

export default function HealthRecords() {
  const { toast } = useUI();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchRecords = async () => {
    try {
      const response = await healthRecordsAPI.getMyRecords();
      setRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Could not load your health records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      bloodPressure: { systolic: toNumber(form.systolic), diastolic: toNumber(form.diastolic) },
      bloodSugar: toNumber(form.bloodSugar),
      weight: toNumber(form.weight),
      height: toNumber(form.height),
      notes: form.notes.trim(),
    };

    const hasValue =
      payload.bloodPressure.systolic !== undefined ||
      payload.bloodPressure.diastolic !== undefined ||
      payload.bloodSugar !== undefined ||
      payload.weight !== undefined ||
      payload.height !== undefined ||
      payload.notes;

    if (!hasValue) {
      toast.warning('Enter at least one measurement or a note.');
      return;
    }

    setSaving(true);
    try {
      await healthRecordsAPI.createRecord(payload);
      toast.success('Health record added.');
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchRecords();
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Oldest → newest series for trend lines
  const trends = useMemo(() => {
    const ordered = [...records].reverse();
    const series = (pick) => ordered.map(pick).filter((v) => typeof v === 'number' && v > 0);
    return [
      { label: 'Systolic BP', unit: 'mmHg', values: series((r) => r.bloodPressure?.systolic) },
      { label: 'Blood sugar', unit: 'mg/dL', values: series((r) => r.bloodSugar) },
      { label: 'Weight', unit: 'kg', values: series((r) => r.weight) },
    ].filter((t) => t.values.length >= 2);
  }, [records]);

  return (
    <div>
      <PageHeader
        eyebrow="Health"
        title="Health records"
        subtitle="Track your vitals over time. Your doctors can view these during consultations."
        actions={
          <Button icon={Plus} onClick={() => setShowForm(true)}>
            Add record
          </Button>
        }
      />

      <HealthSnapshotCard latestRecord={records[0] || null} loading={loading} />

      {trends.length > 0 && (
        <Card className="mt-6">
          <CardHeader icon={TrendingUp} title="Trends" subtitle="Based on your recorded measurements" />
          <div className="grid gap-4 md:grid-cols-3">
            {trends.map((t) => (
              <TrendTile key={t.label} {...t} />
            ))}
          </div>
        </Card>
      )}

      <h2 className="mb-4 mt-8 font-display text-xl font-semibold text-fg">History</h2>
      {loading ? (
        <CardListSkeleton rows={2} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No health records yet"
          description="Add your first measurement to start tracking your health."
          action={<Button icon={Plus} onClick={() => setShowForm(true)}>Add record</Button>}
        />
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <RecordCard key={record._id} record={record} />
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => !saving && setShowForm(false)}
        title="Add health record"
        description="Fill in whatever you measured — every field is optional."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="health-record-form" loading={saving}>
              Save record
            </Button>
          </>
        }
      >
        <form id="health-record-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Systolic BP (mmHg)" type="number" min="0" inputMode="numeric" placeholder="120" value={form.systolic} onChange={set('systolic')} />
            <Input label="Diastolic BP (mmHg)" type="number" min="0" inputMode="numeric" placeholder="80" value={form.diastolic} onChange={set('diastolic')} />
            <Input label="Blood sugar (mg/dL)" type="number" min="0" step="any" inputMode="decimal" placeholder="95" value={form.bloodSugar} onChange={set('bloodSugar')} />
            <Input label="Weight (kg)" type="number" min="0" step="any" inputMode="decimal" placeholder="68" value={form.weight} onChange={set('weight')} />
            <Input wrapperClassName="col-span-2 sm:col-span-1" label="Height (cm)" type="number" min="0" step="any" inputMode="decimal" placeholder="172" value={form.height} onChange={set('height')} />
          </div>
          <Textarea label="Notes" rows={3} placeholder="Symptoms, medication taken, how you feel…" value={form.notes} onChange={set('notes')} />
        </form>
      </Modal>
    </div>
  );
}
