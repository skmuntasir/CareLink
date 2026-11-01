import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CalendarPlus, Clock, Trash2 } from 'lucide-react';
import { slotsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { formatDate, formatTimeRange, todayStr } from '../../utils/format';
import { cn } from '../../utils/cn';

export default function ManageSlots() {
  const { toast, confirm } = useUI();
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchSlots = async () => {
    try {
      const response = await slotsAPI.getMySlots();
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Could not load your slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await slotsAPI.createSlot(formData);
      toast.success('Slot created successfully!');
      setFormData({ date: '', startTime: '', endTime: '' });
      fetchSlots();
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteSlot = async (slotId) => {
    const ok = await confirm({
      title: 'Delete this slot?',
      message: 'Patients will no longer be able to book this time.',
      confirmText: 'Delete slot',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await slotsAPI.deleteSlot(slotId);
      toast.success('Slot deleted.');
      fetchSlots();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const { groups, available, booked } = useMemo(() => {
    const sorted = [...slots].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
    const map = new Map();
    sorted.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date).push(s);
    });
    return {
      groups: Array.from(map.entries()),
      available: slots.filter((s) => !s.isBooked).length,
      booked: slots.filter((s) => s.isBooked).length,
    };
  }, [slots]);

  const today = todayStr();

  return (
    <div>
      <PageHeader
        eyebrow="Availability"
        title="Manage slots"
        subtitle="Publish the times you are available. Patients can only book open slots."
        actions={
          !loading && (
            <>
              <Badge tone="success" dot size="lg">{available} available</Badge>
              <Badge tone="danger" dot size="lg">{booked} booked</Badge>
            </>
          )
        }
      />

      <Card className="mb-8">
        <CardHeader icon={CalendarPlus} title="Create a new slot" />
        <form onSubmit={handleSubmit} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Date" type="date" required min={today} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          <Input label="Start time" type="time" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
          <Input label="End time" type="time" required value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
          <Button type="submit" size="lg" loading={creating} icon={CalendarPlus} className="w-full">
            {creating ? 'Creating…' : 'Create slot'}
          </Button>
        </form>
      </Card>

      <h2 className="mb-4 font-display text-xl font-semibold text-fg">Your slots</h2>
      {loading ? (
        <CardListSkeleton rows={2} />
      ) : groups.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No slots created yet" description="Create your first slot above to open your calendar for bookings." />
      ) : (
        <div className="space-y-5">
          {groups.map(([day, daySlots]) => (
            <Card key={day} padding="sm" className={cn('sm:p-5', day < today && 'opacity-60')}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display font-semibold text-fg">{formatDate(day)}</h3>
                {day === today && <Badge tone="brand">Today</Badge>}
                {day < today && <Badge tone="neutral">Past</Badge>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {daySlots.map((slot) => (
                  <div
                    key={slot._id}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-xl border px-4 py-3',
                      slot.isBooked ? 'border-rose-500/20 bg-rose-500/5' : 'border-line bg-surface-2/50'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium tabular-nums text-fg">{formatTimeRange(slot.startTime, slot.endTime)}</p>
                        <Badge tone={slot.isBooked ? 'danger' : 'success'} size="sm" dot className="mt-1">
                          {slot.isBooked ? 'Booked' : 'Available'}
                        </Badge>
                      </div>
                    </div>
                    {!slot.isBooked && (
                      <Button variant="danger-soft" size="icon" className="h-8 w-8" onClick={() => deleteSlot(slot._id)} aria-label="Delete slot" title="Delete slot">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
