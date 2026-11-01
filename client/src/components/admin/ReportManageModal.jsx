import { useState } from 'react';
import { adminReportsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { formatDateTime } from '../../utils/format';
import { REPORT_REASON, statusMeta } from '../../utils/status';

/** Review a patient report: change its status and leave an internal note. */
export default function ReportManageModal({ report, onClose, onSaved }) {
  const { toast } = useUI();
  const [form, setForm] = useState({ status: report.status, internalNote: report.internalNote || '' });
  const [saving, setSaving] = useState(false);
  const reason = statusMeta(REPORT_REASON, report.reason);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminReportsAPI.updateReport(report._id, form);
      toast.success('Report updated successfully.');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error('Error updating report: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Manage report"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {report.doctorId?.name && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Doctor</p>
              <p className="mt-1 font-medium text-fg">{report.doctorId.name}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Reported by</p>
            <p className="mt-1 font-medium text-fg">{report.patientId?.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Reason</p>
            <Badge className="mt-1" tone={reason.tone}>{reason.label}</Badge>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Submitted</p>
            <p className="mt-1 text-sm text-fg">{formatDateTime(report.createdAt)}</p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-subtle">Description</p>
          <p className="whitespace-pre-line rounded-xl bg-surface-2/70 p-4 text-sm leading-relaxed text-muted">{report.description}</p>
        </div>

        <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="ACTIONED">Actioned</option>
          <option value="DISMISSED">Dismissed</option>
        </Select>

        <Textarea
          label="Internal note"
          rows={4}
          value={form.internalNote}
          onChange={(e) => setForm({ ...form, internalNote: e.target.value })}
          placeholder="Add internal notes (not visible to the doctor or patient)…"
        />
      </div>
    </Modal>
  );
}
