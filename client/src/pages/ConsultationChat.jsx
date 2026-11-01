import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ClipboardPlus, FileText, Paperclip, PhoneOff, Send } from 'lucide-react';
import { appointmentsAPI, chatAPI, uploadFile } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/Loaders';
import { cleanDoctorName } from '../utils/doctorUtils';
import { formatDate, formatTimeRange } from '../utils/format';
import { APPOINTMENT_STATUS, statusMeta } from '../utils/status';
import { cn } from '../utils/cn';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

const dayKey = (value) => new Date(value).toDateString();
const dayLabel = (value) => {
  const d = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function ConsultationChat() {
  const { id: appointmentId } = useParams();
  const { user, token } = useAuth();
  const { toast, confirm } = useUI();
  const [messages, setMessages] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [connection, setConnection] = useState('connecting');
  const [uploading, setUploading] = useState(false);
  const [ending, setEnding] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // Previous messages + appointment details (for the header)
    (async () => {
      try {
        const response = await chatAPI.getMessages(appointmentId);
        if (!cancelled) setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
      try {
        const response = await appointmentsAPI.getAppointmentById(appointmentId);
        if (!cancelled) setAppointment(response.data.appointment);
      } catch (error) {
        console.error('Error loading appointment:', error);
      }
    })();

    // Real-time connection
    const newSocket = io(SOCKET_URL, { auth: { token } });
    newSocket.on('connect', () => {
      setConnection('connected');
      newSocket.emit('join-room', appointmentId);
    });
    newSocket.on('disconnect', () => setConnection('disconnected'));
    newSocket.on('connect_error', () => setConnection('disconnected'));
    newSocket.on('receive-message', (msg) => setMessages((prev) => [...prev, msg]));
    newSocket.on('error', (error) => console.error('Socket error:', error));
    setSocket(newSocket);

    return () => {
      cancelled = true;
      newSocket.close();
    };
  }, [appointmentId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const sendMessage = () => {
    if (!message.trim() || !socket) return;
    socket.emit('send-message', { appointmentId, message: message.trim() });
    setMessage('');
    requestAnimationFrame(resizeInput);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file || !socket) return;

    setUploading(true);
    try {
      const response = await uploadFile(file);
      socket.emit('send-message', { appointmentId, message: '', fileUrl: response.data.fileUrl });
    } catch (error) {
      toast.error('File upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEndConsultation = async () => {
    const ok = await confirm({
      title: 'End this consultation?',
      message: 'The appointment will be marked as completed and you can then write the prescription.',
      confirmText: 'End consultation',
      tone: 'danger',
    });
    if (!ok) return;

    setEnding(true);
    try {
      await chatAPI.endConsultation(appointmentId);
      toast.success('Consultation ended successfully.');
      setAppointment((prev) => (prev ? { ...prev, status: 'COMPLETED' } : prev));
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setEnding(false);
    }
  };

  const isDoctor = user?.role === 'DOCTOR';
  const counterpart = appointment ? (isDoctor ? appointment.patientId : appointment.doctorId) : null;
  const counterpartName = counterpart?.name
    ? isDoctor
      ? counterpart.name
      : `Dr. ${cleanDoctorName(counterpart.name)}`
    : 'Consultation';
  const statusInfo = appointment ? statusMeta(APPOINTMENT_STATUS, appointment.status) : null;

  const connectionDot = {
    connected: { cls: 'bg-emerald-500', label: 'Live' },
    connecting: { cls: 'bg-amber-500 animate-pulse', label: 'Connecting…' },
    disconnected: { cls: 'bg-rose-500', label: 'Offline' },
  }[connection];

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] min-h-[30rem] max-w-4xl flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <Avatar name={counterpart?.name || '?'} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-lg font-semibold text-fg">{counterpartName}</h1>
            {statusInfo && (
              <Badge tone={statusInfo.tone} size="sm" dot>
                {statusInfo.label}
              </Badge>
            )}
          </div>
          <p className="flex items-center gap-2 truncate text-xs text-muted">
            <span className={cn('inline-block h-2 w-2 rounded-full', connectionDot.cls)} aria-hidden="true" />
            {connectionDot.label}
            {appointment?.slotId && (
              <span className="hidden sm:inline">
                · {formatDate(appointment.slotId.date)}, {formatTimeRange(appointment.slotId.startTime, appointment.slotId.endTime)}
              </span>
            )}
          </p>
        </div>

        {isDoctor && appointment?.status === 'COMPLETED' && (
          <Button as={Link} to={`/doctor/prescriptions/create/${appointmentId}`} size="sm" variant="soft" icon={ClipboardPlus}>
            <span className="hidden sm:inline">Write prescription</span>
          </Button>
        )}
        {isDoctor && appointment?.status !== 'COMPLETED' && (
          <Button size="sm" variant="danger-soft" icon={PhoneOff} loading={ending} onClick={handleEndConsultation}>
            <span className="hidden sm:inline">End consultation</span>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto bg-surface-2/30 px-4 py-5 sm:px-6" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-text">
              <Send className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-medium text-fg">Start the conversation</p>
            <p className="mt-1 text-sm text-muted">Messages and files are shared securely with your {isDoctor ? 'patient' : 'doctor'}.</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const mine = msg.senderId?._id === user?._id;
          const prev = messages[index - 1];
          const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
          const sameSender = prev && prev.senderId?._id === msg.senderId?._id && !newDay;
          const isImage = msg.fileUrl && IMAGE_EXT.test(msg.fileUrl);

          return (
            <div key={msg._id || index}>
              {newDay && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full bg-fg/[0.06] px-3 py-1 text-[11px] font-medium text-muted">{dayLabel(msg.createdAt)}</span>
                </div>
              )}
              <div className={cn('flex', mine ? 'justify-end' : 'justify-start', sameSender ? 'mt-1' : 'mt-3')}>
                <div className={cn('max-w-[82%] sm:max-w-[70%]', mine && 'items-end')}>
                  {!mine && !sameSender && <p className="mb-1 ml-1 text-xs font-medium text-muted">{msg.senderId?.name}</p>}
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                      mine
                        ? 'rounded-br-md bg-gradient-to-br from-brand-400 to-brand-500 text-ink-950'
                        : 'rounded-bl-md border border-line bg-surface text-fg'
                    )}
                  >
                    {msg.message && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>}
                    {msg.fileUrl && (
                      <a
                        href={SOCKET_URL + msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('block', msg.message && 'mt-2')}
                      >
                        {isImage ? (
                          <img
                            src={SOCKET_URL + msg.fileUrl}
                            alt="Shared attachment"
                            className="max-h-56 rounded-xl object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className={cn(
                              'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium underline-offset-2 hover:underline',
                              mine ? 'bg-ink-950/10' : 'bg-fg/[0.06]'
                            )}
                          >
                            <FileText className="h-4 w-4" aria-hidden="true" /> View attachment
                          </span>
                        )}
                      </a>
                    )}
                    <p className={cn('mt-1 text-right text-[10px]', mine ? 'text-ink-950/60' : 'text-subtle')}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-line bg-surface p-3 sm:p-4">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <Button
          variant="secondary"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !socket}
          aria-label="Attach a file"
          title="Attach a file"
        >
          {uploading ? <Spinner className="h-4 w-4" /> : <Paperclip className="h-[18px] w-[18px]" />}
        </Button>
        <textarea
          ref={inputRef}
          rows={1}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            resizeInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          aria-label="Message"
          className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-line bg-surface-2/60 px-4 py-2.5 text-sm text-fg placeholder:text-subtle focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={!message.trim() || !socket} aria-label="Send message">
          <Send className="h-[18px] w-[18px]" />
        </Button>
      </form>
    </div>
  );
}
