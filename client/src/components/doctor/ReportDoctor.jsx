import { useState } from 'react';
import { reportsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Alert from '../ui/Alert';

const REASONS = [
  { value: 'PROFESSIONALISM', label: 'Professionalism issues' },
  { value: 'COMMUNICATION', label: 'Communication problems' },
  { value: 'APPOINTMENT_ISSUES', label: 'Appointment-related issues' },
  { value: 'OTHER', label: 'Other' },
];

export default function ReportDoctor({ doctorId, appointmentId, onClose, onReportSubmitted }) {
  const { toast } = useUI();
  const [formData, setFormData] = useState({ reason: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await reportsAPI.createReport({
        doctorId,
        appointmentId,
        reason: formData.reason,
        description: formData.description,
      });
      toast.success('Report submitted. Our team will review it shortly.');
      onReportSubmitted?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Report this doctor"
      description="Tell us what went wrong. Reports are reviewed by an administrator and are not shared with the doctor."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="report-doctor-form" loading={loading} variant="danger">
            Submit report
          </Button>
        </>
      }
    >
      <form id="report-doctor-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}

        <Select
          label="Reason for report"
          required
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        >
          <option value="">Select a reason</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Description"
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Please provide details about the issue…"
        />
      </form>
    </Modal>
  );
}
