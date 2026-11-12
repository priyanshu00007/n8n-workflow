import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Users, 
  MapPin, 
  Play, 
  Loader2, 
  Check, 
  Sparkles,
  CalendarPlus,
  Trash2
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const CalendarWidgetModal: React.FC = () => {
  const { isCalendarModalOpen, setIsCalendarModalOpen, runCurrentWorkflow, isExecuting } = useWorkflowStore();

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Event Form
  const [summary, setSummary] = useState('');
  const [startTime, setStartTime] = useState('Tomorrow 10:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [attendees, setAttendees] = useState('priyanshurathod518@gmail.com');
  const [location, setLocation] = useState('Google Meet');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calendar/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCalendarModalOpen) {
      fetchEvents();
    }
  }, [isCalendarModalOpen]);

  if (!isCalendarModalOpen) return null;

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary) return;

    setIsCreating(true);
    setCreateMsg(null);

    try {
      const res = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          startTime,
          durationMinutes,
          attendees,
          location,
          description
        })
      });

      const data = await res.json();
      if (data.status === 'created') {
        setCreateMsg('Event scheduled in Google Calendar!');
        setSummary('');
        fetchEvents();
      }
    } catch (err: any) {
      setCreateMsg('Error creating event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/calendar/delete/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0c0c0e] border border-white/10 rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Google Calendar Sync Playground</span>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                  Primary
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage live schedule and trigger automated workflows</p>
            </div>
          </div>
          <button
            onClick={() => setIsCalendarModalOpen(false)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1 overflow-y-auto">
          {/* Calendar Event Schedule List */}
          <div className="flex flex-col overflow-hidden bg-[#141418] border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Current Events</h4>
              <button
                onClick={runCurrentWorkflow}
                disabled={isExecuting}
                className="text-[11px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded border border-blue-500/30 transition-colors flex items-center gap-1.5"
              >
                {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Run Briefing Flow</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-80">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-slate-500 text-xs font-mono">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading Calendar...
                </div>
              ) : events.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs font-mono">No upcoming events found.</div>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="p-3 bg-[#18181b] border border-white/5 hover:border-white/10 rounded-md space-y-1.5 group transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{evt.summary}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Confirmed
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(evt.startTime).toLocaleString()}</span>
                    </div>
                    {evt.attendees?.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{evt.attendees.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Create Event Form */}
          <form onSubmit={handleCreateEvent} className="bg-[#141418] border border-white/10 rounded-lg p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Schedule New Event</span>
              </h4>

              {createMsg && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  {createMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Event Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Architecture Roadmap Sync"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 focus:border-blue-500/50 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 focus:border-blue-500/50 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Duration (Min)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-white/10 focus:border-blue-500/50 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Attendees</label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 focus:border-blue-500/50 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 focus:border-blue-500/50 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Agenda items & notes..."
                  className="w-full bg-[#09090b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating || !summary}
              className="mt-4 w-full py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add to Google Calendar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

