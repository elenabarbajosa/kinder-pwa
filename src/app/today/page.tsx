'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// 🕒 Format times like "08:00:00" → "08:00"
function formatTime(time: string) {
    if (!time) return '';
    return time.slice(0, 5); // keeps only HH:MM
}

type Classroom = { id: string; name: string };
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
};

export default function Today() {
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [rows, setRows] = useState<Row[]>([]);
    const [selectedClass, setSelectedClass] = useState<'all' | string>('all');
    const [changedOnly, setChangedOnly] = useState(false);
    const [filterBusMorning, setFilterBusMorning] = useState(false);
    const [filterBusAfternoon, setFilterBusAfternoon] = useState(false);
    const [filterAbsent, setFilterAbsent] = useState(false);
    const [filterNotes, setFilterNotes] = useState(false);

    // Load data
    const loadToday = async () => {
        const { data, error } = await supabase.from('today_view').select('*');
        if (!error) setRows((data as Row[]) ?? []);
    };

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('classrooms')
                .select('id,name')
                .order('name');
            if (!error) setClasses(data ?? []);
        })();
        loadToday();
    }, []);

    // ❌ Revert change (delete exception)
    const handleRevert = async (exceptionId: string | null, childName: string) => {
        if (!exceptionId) return alert('Este alumn@ no tiene cambio para revertir.');
        if (!confirm(`¿Seguro que quieres eliminar el cambio de ${childName}?`)) return;

        const { error } = await supabase.from('exceptions').delete().eq('id', exceptionId);
        if (error) {
            alert('Error al revertir el cambio: ' + error.message);
            return;
        }
        await loadToday();
    };

    // Filters
    const visible = rows
        .filter((r) => selectedClass === 'all' || r.classroom_id === selectedClass)
        .filter((r) => !changedOnly || r.exception_id)
        .filter((r) => !filterBusMorning || r.bus_morning_today)
        .filter((r) => !filterBusAfternoon || r.bus_afternoon_today)
        .filter((r) => !filterAbsent || r.absent)
        .filter((r) => !filterNotes || r.note); // 🟨 Only students with notes

    // Summary
    const total = visible.length;
    const absentCount = visible.filter((r) => r.absent).length;
    const busChangeCount = visible.filter(
        (r) =>
            r.bus_morning_today !== r.takes_bus_morning ||
            r.bus_afternoon_today !== r.takes_bus_afternoon
    ).length;
    const timeChangeCount = visible.filter((r) => r.exception_id && !r.absent).length;

    // 🟨 Card color logic
    const cardColor = (r: Row) => {
        // 🟨 0️⃣ Note override (always yellow)
        if (r.note)
            return 'bg-[var(--color-note)] border-[var(--color-note-border)] text-[var(--color-note-text)]';

        // 💜 1️⃣ Absent
        if (r.absent)
            return 'bg-[var(--color-absent)] border-[var(--color-absent-border)]';

        const morningChanged = r.bus_morning_today !== r.takes_bus_morning;
        const afternoonChanged = r.bus_afternoon_today !== r.takes_bus_afternoon;
        const busChanged = morningChanged || afternoonChanged;
        const timeChanged =
            r.exception_id &&
            (formatTime(r.in_time) !== formatTime(r.default_in) ||
                formatTime(r.out_time) !== formatTime(r.default_out));

        // 💙 2️⃣ Both bus & time change
        if (busChanged && timeChanged)
            return 'bg-[var(--color-bus-change)] border-[var(--color-bus-border)]';

        // 💗 3️⃣ Time change only
        if (timeChanged)
            return 'bg-[var(--color-time-change)] border-[var(--color-time-border)]';

        // 💙 4️⃣ Bus change only
        if (busChanged)
            return 'bg-[var(--color-bus-change)] border-[var(--color-bus-border)]';

        // ⚪ 5️⃣ Default
        return 'bg-[var(--color-card-bg)] border-[var(--color-card-border)]';
    };

    // Time difference label
    const badge = (r: Row) => {
        if (!r.exception_id) return '';
        const diffs: string[] = [];
        if (r.in_time < r.default_in) diffs.push('Entrada antes');
        else if (r.in_time > r.default_in) diffs.push('Entrada después');
        if (r.out_time < r.default_out) diffs.push('Salida antes');
        else if (r.out_time > r.default_out) diffs.push('Salida después');
        return diffs.join(' • ');
    };

    // Bus info
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
        <main className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-[var(--color-primary-dark)]">
                Hoy
            </h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6 items-center">
                <select
                    className="border border-[var(--color-border)] rounded-xl px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as any)}
                >
                    <option value="all">Todas las clases</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={changedOnly}
                        onChange={(e) => setChangedOnly(e.target.checked)}
                        className="accent-[var(--color-primary)]"
                    />
                    Solo cambios
                </label>
            </div>

            {/* Filter bar */}
            <div className="bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 shadow-sm flex flex-wrap gap-3 text-sm mt-2 mb-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filterBusMorning}
                        onChange={(e) => setFilterBusMorning(e.target.checked)}
                        className="accent-[var(--color-primary)]"
                    />
                    Bus mañana
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filterBusAfternoon}
                        onChange={(e) => setFilterBusAfternoon(e.target.checked)}
                        className="accent-[var(--color-primary)]"
                    />
                    Bus tarde
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filterAbsent}
                        onChange={(e) => setFilterAbsent(e.target.checked)}
                        className="accent-purple-500"
                    />
                    Ausente
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filterNotes}
                        onChange={(e) => setFilterNotes(e.target.checked)}
                        className="accent-yellow-400"
                    />
                    Notas
                </label>
            </div>

            {/* Summary bar */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-3 mb-4 shadow-sm text-sm text-gray-700 flex flex-wrap justify-between">
                <span>
                    Total: <strong>{total}</strong>
                </span>
                <span className="text-[var(--color-primary-dark)]">
                    Cambios: <strong>{timeChangeCount}</strong>
                </span>
                <span className="text-blue-700">
                    Bus distinto: <strong>{busChangeCount}</strong>
                </span>
                <span className="text-purple-600">
                    Ausentes: <strong>{absentCount}</strong>
                </span>
            </div>

            {/* Student cards */}
            <div className="grid gap-4">
                {visible
                    .sort((a, b) => {
                        if (a.exception_id && !b.exception_id) return -1;
                        if (!a.exception_id && b.exception_id) return 1;
                        return a.first_name.localeCompare(b.first_name, 'es', { sensitivity: 'base' });
                    })
                    .map((r) => (
                        <SwipeCard
                            key={r.child_id}
                            row={r}
                            cardColor={cardColor}
                            badge={badge}
                            busBadge={busBadge}
                            handleRevert={handleRevert}
                        />
                    ))}

                {visible.length === 0 && (
                    <div className="text-sm text-gray-600 text-center py-4 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
                        No hay alumn@s para mostrar.
                    </div>
                )}
            </div>
        </main>
    );
}

/* 🧩 Subcomponent for swipe-to-delete */
function SwipeCard({
    row: r,
    cardColor,
    badge,
    busBadge,
    handleRevert,
}: {
    row: Row;
    cardColor: (r: Row) => string;
    badge: (r: Row) => string;
    busBadge: (r: Row) => string;
    handleRevert: (id: string | null, name: string) => void;
}) {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center justify-end pr-6 z-0">
                <span className="text-red-600 text-3xl select-none">❌</span>
            </div>

            <motion.div
                className={`relative z-10 rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${cardColor(
                    r
                )}`}
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                    if (info.offset.x < -80 && r.exception_id) {
                        if (confirm(`¿Seguro que quieres eliminar el cambio de ${r.first_name}?`)) {
                            handleRevert(r.exception_id, r.first_name);
                        }
                    }
                }}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <div
                            className={`text-base font-semibold mb-2 ${r.note
                                ? 'text-[var(--color-note-text)]' // 🟨 override for yellow cards
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
                            Entrada: <span className="font-medium">{formatTime(r.in_time)}</span>
                        </div>
                        <div>
                            Salida: <span className="font-medium">{formatTime(r.out_time)}</span>
                        </div>

                        {r.exception_id &&
                            !r.absent &&
                            (r.in_time !== r.default_in || r.out_time !== r.default_out) && (
                                <div className="text-xs mt-1 px-2 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary-dark)] inline-block">
                                    {badge(r)}
                                </div>
                            )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
