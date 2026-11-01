import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Plus, Save, Trash2 } from 'lucide-react';
import { appointmentsAPI, prescriptionsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { PageLoader } from '../../components/ui/Loaders';
import { formatDate, formatTime } from '../../utils/format';

const EMPTY_MEDICINE = { drugName: '', dosage: '', frequency: '', duration: '' };

export default function CreatePrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useUI();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  // Load errors replace the page; form errors are shown inline so input is never lost
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await appointmentsAPI.getAppointmentById(appointmentId);
        setAppointment(response.data.appointment);
      } catch (err) {
        setLoadError('Failed to load appointment: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  const handleAddMedicine = () => setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }]);

  const handleRemoveMedicine = (index) => {
    setMedicines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const isValid = medicines.every(
      (med) => med.drugName.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );
    if (!isValid) {
      setFormError('Please fill in all medicine fields.');
      return;
    }

    const payload = {
      appointmentId,
      patientId: appointment?.patientId?._id || appointment?.patientId,
      items: medicines,
      additionalNotes,
    };

    try {
      setSubmitting(true);
      await prescriptionsAPI.createPrescription(payload);
      toast.success('Prescription created successfully!');
      navigate('/doctor/prescriptions');
    } catch (err) {
      console.error('Prescription creation error:', err);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading appointment details…" />;

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Create prescription" back="/doctor/prescriptions" backLabel="Back to prescriptions" />
        <Alert tone="danger">{loadError}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Prescriptions"
        title="Create prescription"
        back="/doctor/prescriptions"
        backLabel="Back to prescriptions"
      />

      {appointment && (
        <Card variant="flat" padding="sm" className="mb-6 flex items-center gap-4">
          <Avatar name={appointment.patientId?.name} size="lg" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">Patient</p>
            <h2 className="font-display text-lg font-semibold text-fg">{appointment.patientId?.name}</h2>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(appointment.slotId?.date)} at {formatTime(appointment.slotId?.startTime)}
            </p>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && <Alert tone="danger" onClose={() => setFormError('')}>{formError}</Alert>}

        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-fg">Medicines</h2>
          <Button variant="soft" size="sm" icon={Plus} onClick={handleAddMedicine}>
            Add medicine
          </Button>
        </div>

        {medicines.map((medicine, index) => (
          <Card key={index}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2.5 font-medium text-fg">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-semibold text-brand-text">
                  {index + 1}
                </span>
                Medicine
              </h3>
              {medicines.length > 1 && (
                <Button variant="danger-soft" size="sm" icon={Trash2} onClick={() => handleRemoveMedicine(index)}>
                  Remove
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Drug name" required value={medicine.drugName} onChange={(e) => handleMedicineChange(index, 'drugName', e.target.value)} placeholder="e.g. Paracetamol" />
              <Input label="Dosage" required value={medicine.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} placeholder="e.g. 500mg" />
              <Input label="Frequency" required value={medicine.frequency} onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)} placeholder="e.g. Twice daily" />
              <Input label="Duration" required value={medicine.duration} onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)} placeholder="e.g. 7 days" />
            </div>
          </Card>
        ))}

        <Card>
          <Textarea
            label="Additional notes"
            rows={4}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any additional instructions, diet advice or follow-up notes…"
          />
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate('/doctor/prescriptions')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" icon={Save} loading={submitting}>
            {submitting ? 'Creating…' : 'Create prescription'}
          </Button>
        </div>
      </form>
    </div>
  );
}
