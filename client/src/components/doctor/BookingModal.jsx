import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarX2, Check, Clock } from 'lucide-react';
import { appointmentsAPI, doctorAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import { Skeleton } from '../ui/Loaders';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { cn } from '../../utils/cn';
import { formatDate, formatMoney, formatTime, todayStr } from '../../utils/format';

/**
 * Lets a patient pick one of a doctor's open slots and book it.
 * `doctor` is a DoctorProfile document with a populated `userId`.
 */
export default function BookingModal({ doctor, date = '', onClose, onBooked }) {
  const navigate = useNavigate();
  const { toast } = useUI();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selected, setSelected] = useState(null);

  const doctorUserId = doctor?.userId?._id;
  const doctorName = `Dr. ${cleanDoctorName(doctor?.userId?.name)}`;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await doctorAPI.getDoctorSlots(doctorUserId, date ? { date } : undefined);
        if (!cancelled) setSlots(response.data.slots || []);
      } catch (error) {
        console.error('Error fetching slots:', error);
        if (!cancelled) toast.error('Could not load available slots.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [doctorUserId, date, toast]);

  // Hide slots in the past and group the rest by day
  const groups = useMemo(() => {
    const today = todayStr();
    const map = new Map();
    slots
      .filter((s) => !s.date || s.date >= today)
      .forEach((s) => {
        if (!map.has(s.date)) map.set(s.date, []);
        map.get(s.date).push(s);
      });
    return Array.from(map.entries());
  }, [slots]);

  const selectedSlot = slots.find((s) => s._id === selected);

  const book = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await appointmentsAPI.bookAppointment({ doctorId: doctorUserId, slotId: selectedSlot._id });
      toast.success('Appointment booked! Complete the payment to confirm it.');
      onBooked?.();
      onClose();
      navigate('/appointments');
    } catch (error) {
      toast.error('Booking failed: ' + error.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Book an appointment"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={booking}>
            Cancel
          </Button>
          <Button onClick={book} disabled={!selectedSlot} loading={booking} icon={Check}>
            {selectedSlot ? `Confirm · ${formatMoney(doctor.fee)}` : 'Select a time slot'}
          </Button>
        </>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3.5">
        <Avatar name={doctor?.userId?.name} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{doctorName}</p>
          <p className="truncate text-sm text-muted">
            {doctor.specialization} · {formatMoney(doctor.fee)} per consultation
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-5" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i}>
              <Skeleton className="mb-3 h-4 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 !rounded-xl" />
                <Skeleton className="h-10 w-28 !rounded-xl" />
                <Skeleton className="h-10 w-28 !rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          compact
          icon={CalendarX2}
          title="No available slots"
          description={date ? 'This doctor has no open slots on the selected date. Try clearing the date filter.' : 'This doctor has no open slots right now. Please check back later.'}
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([day, daySlots]) => (
            <section key={day}>
              <h3 className="mb-2.5 text-sm font-semibold text-fg">{formatDate(day)}</h3>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => {
                  const active = slot._id === selected;
                  return (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => setSelected(slot._id)}
                      aria-pressed={active}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all',
                        active
                          ? 'border-brand-500 bg-brand-500/15 text-brand-text ring-2 ring-brand-500/25'
                          : 'border-line bg-surface-2/50 text-fg hover:border-brand-500/50'
                      )}
                    >
                      <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </Modal>
  );
}
