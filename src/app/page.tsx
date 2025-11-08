'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, useMotionValue, animate } from 'framer-motion';

// 🕒 Format times like "08:00:00" → "08:00"
function formatTime(time: string) {
  if (!time) return '';
  return time.slice(0, 5);
}

type Row = {
  child_id: string;
  first_name: string;
  classroom_id: string;
  default_in: string;
  default_out: string;
  exception_id: string | null;
  in_time: string;
  out_time: string;
  note: string | null;
  takes_bus_morning: boolean;
  takes_bus_afternoon: boolean;
  bus_morning_today: boolean;
  bus_afternoon_today: boolean;
  absent: boolean;
  date?: string;
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const deletingRef = useRef(false); // ✅ Prevent double deletion confirm

  // 🔹 Load data for a specific date
  const loadByDate = async (date: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance_view') // ✅ Ensure this view includes all dates
      .select('*')
      .eq('date', date)
      .order('first_name', { ascending: true });
    if (!error) setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadByDate(selectedDate);
  }, [selectedDate]);

  // ❌ Delete exception (revert change)
  const handleRevert = async (exceptionId: string | null, childName: string) => {
    if (!exceptionId) return alert('Este alumn@ no tiene cambio para eliminar.');
    const { error } = await supabase.from('exceptions').delete().eq('id', exceptionId);
    if (error) {
      alert('Error al eliminar el cambio: ' + error.message);
      return;
    }
    await loadByDate(selectedDate);
  };

  // 🎨 Card color logic
  const cardColor = (r: Row) => {
    if (r.note)
      return 'bg-[var(--color-note)] border-[var(--color-note-border)] text-[var(--color-note-text)]';
    if (r.absent)
      return 'bg-[var(--color-absent)] border-[var(--color-absent-border)]';
    const morningChanged = r.bus_morning_today !== r.takes_bus_morning;
    const afternoonChanged = r.bus_afternoon_today !== r.takes_bus_afternoon;
    const busChanged = morningChanged || afternoonChanged;
    const timeChanged =
      r.exception_id &&
      (formatTime(r.in_time) !== formatTime(r.default_in) ||
        formatTime(r.out_time) !== formatTime(r.default_out));

    if (busChanged && timeChanged)
      return 'bg-[var(--color-bus-change)] border-[var(--color-bus-border)]';
    if (timeChanged)
      return 'bg-[var(--color-time-change)] border-[var(--color-time-border)]';
    if (busChanged)
      return 'bg-[var(--color-bus-change)] border-[var(--color-bus-border)]';
    return 'bg-[var(--color-card-bg)] border-[var(--color-card-border)]';
  };

  const busBadge = (r: Row) => {
    if (r.absent) return '';
    if (r.bus_morning_today || r.bus_afternoon_today) {
      const parts = [];
      if (r.bus_morning_today) parts.push('Mañana');
      if (r.bus_afternoon_today) parts.push('Tarde');
      return `🚌 ${parts.join(' & ')}`;
    }
    return '';
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-[var(--color-primary-dark)]">
        Buscar horario por fecha
      </h1>

      {/* 📅 Date picker */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl px-4 py-4 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="text-sm font-medium text-gray-700">
          Selecciona una fecha:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-[var(--color-border)] rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
        />
      </div>

      {/* 🧾 Results */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando datos...</p>
      ) : rows.length > 0 ? (
        <div className="grid gap-4">
          {rows.map((r) => (
            <SmoothSwipeCard
              key={r.child_id}
              row={r}
              cardColor={cardColor}
              busBadge={busBadge}
              handleRevert={handleRevert}
              deletingRef={deletingRef}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No hay cambios registrados para esta fecha.
        </p>
      )}
    </main>
  );
}

/* 🧩 Subcomponent with smoother swipe + reset animation */
function SmoothSwipeCard({
  row: r,
  cardColor,
  busBadge,
  handleRevert,
  deletingRef,
}: {
  row: Row;
  cardColor: (r: Row) => string;
  busBadge: (r: Row) => string;
  handleRevert: (id: string | null, name: string) => void;
  deletingRef: React.MutableRefObject<boolean>;
}) {
  const x = useMotionValue(0);

  const resetPosition = () => {
    // 🌀 Smoothly animate back
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
  };

  return (
    <div className="relative">
      {/* ❌ background */}
      <div className="absolute inset-0 flex items-center justify-end pr-6 z-0">
        <span className="text-red-600 text-3xl select-none">❌</span>
      </div>

      <motion.div
        className={`relative z-10 rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${cardColor(
          r
        )}`}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        onDragEnd={(event, info) => {
          if (deletingRef.current) return;
          if (info.offset.x < -80 && r.exception_id) {
            deletingRef.current = true;

            const confirmed = window.confirm(
              `¿Seguro que quieres eliminar el cambio de ${r.first_name}?`
            );

            if (confirmed) {
              handleRevert(r.exception_id, r.first_name);
            }

            // ✅ Always reset position after cancel or confirm
            resetPosition();

            setTimeout(() => {
              deletingRef.current = false;
            }, 600);
          } else {
            resetPosition(); // ✅ Snap back if not far enough
          }
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div
              className={`text-base font-semibold mb-2 ${r.note
                  ? 'text-[var(--color-note-text)]'
                  : r.absent
                    ? 'text-[var(--color-text-purple)]'
                    : r.bus_morning_today !== r.takes_bus_morning ||
                      r.bus_afternoon_today !== r.takes_bus_afternoon
                      ? 'text-[var(--color-text-blue)]'
                      : 'text-[var(--color-primary-dark)]'
                }`}
            >
              {r.first_name}
            </div>

            {busBadge(r) && (
              <div className="text-sm font-semibold text-gray-900 mt-1 px-2 py-1 rounded-md bg-gray-100 inline-block shadow-sm">
                {busBadge(r)}
              </div>
            )}

            {r.note && (
              <div className="text-sm mt-2 italic text-[var(--color-note-text)]">
                {r.note}
              </div>
            )}
          </div>

          <div className="text-right text-[13px] text-gray-700 leading-relaxed mt-1">
            <div>
              Entrada:{' '}
              <span className="font-medium">{formatTime(r.in_time)}</span>
            </div>
            <div>
              Salida:{' '}
              <span className="font-medium">{formatTime(r.out_time)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
