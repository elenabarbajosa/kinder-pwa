'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Trash2, Edit, X } from 'lucide-react';

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

    // modal state
    const [editing, setEditing] = useState<Row | null>(null);
    const [newIn, setNewIn] = useState('');
    const [newOut, setNewOut] = useState('');
    const [note, setNote] = useState('');
    const [busMorning, setBusMorning] = useState(false);
    const [busAfternoon, setBusAfternoon] = useState(false);
    const [absent, setAbsent] = useState(false);

    // 🔄 force fresh query
    const loadToday = async () => {
        const { data, error } = await supabase
            .from('today_view')
            .select('*')
            .order('first_name', { ascending: true });
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

    // 🗑️ Delete exception
    const handleDelete = async (exceptionId: string | null) => {
        if (!exceptionId) return alert('Este alumno no tiene cambio para eliminar.');
        if (!confirm('¿Seguro que quieres eliminar este cambio?')) return;

        const { error } = await supabase.from('exceptions').delete().eq('id', exceptionId);
        if (error) return alert('Error al eliminar: ' + error.message);

        // wait briefly so the view updates
        await new Promise((r) => setTimeout(r, 500));
        await loadToday();
    };

    // ✏️ Open modal for editing
    const handleEdit = (r: Row) => {
        setEditing(r);
        setNewIn(r.in_time);
        setNewOut(r.out_time);
        setNote(r.note || '');
        setBusMorning(r.bus_morning_today);
        setBusAfternoon(r.bus_afternoon_today);
        setAbsent(r.absent);
    };

    // 💾 Update exception
    const handleUpdate = async () => {
        if (!editing?.exception_id) return;

        const { error } = await supabase
            .from('exceptions')
            .update({
                new_in: newIn || null,
                new_out: newOut || null,
                note: note || null,
                bus_morning_override: busMorning,
                bus_afternoon_override: busAfternoon,
                absent,
            })
            .eq('id', editing.exception_id);

        if (error) return alert('Error al actualizar: ' + error.message);

        setEditing(null);
        // wait briefly so view refreshes with new data
        await new Promise((r) => setTimeout(r, 500));
        await loadToday();
    };

    const visible = rows
        .filter((r) => selectedClass === 'all' || r.classroom_id === selectedClass)
        .filter((r) => !changedOnly || r.exception_id);

    // counts for summary
    const total = visible.length;
    const absentCount = visible.filter((r) => r.absent).length;
    const busChangeCount = visible.filter(
        (r) =>
            r.bus_morning_today !== r.takes_bus_morning ||
            r.bus_afternoon_today !== r.takes_bus_afternoon
    ).length;
    const timeChangeCount = visible.filter((r) => r.exception_id && !r.absent).length;

    const cardColor = (r: Row) => {
        if (r.absent) return 'bg-[var(--color-absent)] border-[var(--color-absent-border)]';
        const morningChanged = r.bus_morning_today !== r.takes_bus_morning;
        const afternoonChanged = r.bus_afternoon_today !== r.takes_bus_afternoon;
        if (morningChanged || afternoonChanged)
            return 'bg-[var(--color-bus-change)] border-[var(--color-bus-border)]';
        if (r.exception_id)
            return 'bg-[var(--color-time-change)] border-[var(--color-time-border)]';
        return 'bg-[var(--color-card-bg)] border-[var(--color-card-border)]';
    };

    const badge = (r: Row) => {
        if (!r.exception_id) return '';
        const diffs: string[] = [];
        if (r.in_time < r.default_in) diffs.push('Entrada antes');
        else if (r.in_time > r.default_in) diffs.push('Entrada después');
        if (r.out_time < r.default_out) diffs.push('Salida antes');
        else if (r.out_time > r.default_out) diffs.push('Salida después');
        return diffs.join(' • ');
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
        <main className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-[var(--color-primary-dark)]">Hoy</h1>

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

            {/* Summary bar */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-3 mb-4 shadow-sm text-sm text-gray-700 flex flex-wrap justify-between">
                <span>Total: <strong>{total}</strong></span>
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
            <div className="grid gap-3">
                {visible
                    .sort((a, b) => {
                        if (a.exception_id && !b.exception_id) return -1;
                        if (!a.exception_id && b.exception_id) return 1;
                        return a.in_time.localeCompare(b.in_time);
                    })
                    .map((r) => (
                        <div
                            key={r.child_id}
                            className={`rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between card-transition ${cardColor(
                                r
                            )}`}
                        >
                            <div>
                                <div className="text-lg font-semibold text-[var(--color-primary-dark)]">
                                    {r.first_name}
                                </div>
                                {busBadge(r) && (
                                    <div className="text-xs text-blue-700 mt-1">{busBadge(r)}</div>
                                )}
                                {r.note && (
                                    <div className="text-sm text-gray-600 mt-1">{r.note}</div>
                                )}
                            </div>

                            <div className="flex flex-col items-end justify-between gap-2">
                                <div className="text-right text-sm text-gray-700">
                                    <div>
                                        Entrada: <span className="font-medium">{r.in_time}</span>
                                    </div>
                                    <div>
                                        Salida: <span className="font-medium">{r.out_time}</span>
                                    </div>
                                    {r.exception_id && (
                                        <div className="text-xs mt-1 px-2 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary-dark)] inline-block">
                                            {badge(r)}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                {r.exception_id && (
                                    <div className="flex gap-2 text-gray-500">
                                        <button
                                            onClick={() => handleEdit(r)}
                                            className="hover:text-[var(--color-primary-dark)] transition"
                                            title="Editar cambio"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(r.exception_id)}
                                            className="hover:text-red-500 transition"
                                            title="Eliminar cambio"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                {visible.length === 0 && (
                    <div className="text-sm text-gray-600 text-center py-4 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
                        No hay alumn@s para mostrar.
                    </div>
                )}
            </div>

            {/* ✏️ Edit Modal */}
            {editing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[var(--color-border)] shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[var(--color-primary-dark)]">
                                Editar: {editing.first_name}
                            </h2>
                            <button
                                onClick={() => setEditing(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Nueva entrada
                                <input
                                    type="time"
                                    value={newIn}
                                    onChange={(e) => setNewIn(e.target.value)}
                                    className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Nueva salida
                                <input
                                    type="time"
                                    value={newOut}
                                    onChange={(e) => setNewOut(e.target.value)}
                                    className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                />
                            </label>

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={busMorning}
                                        onChange={(e) => setBusMorning(e.target.checked)}
                                        className="accent-[var(--color-primary)]"
                                    />
                                    Bus (mañana)
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={busAfternoon}
                                        onChange={(e) => setBusAfternoon(e.target.checked)}
                                        className="accent-[var(--color-primary)]"
                                    />
                                    Bus (tarde)
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={absent}
                                        onChange={(e) => setAbsent(e.target.checked)}
                                        className="accent-purple-500"
                                    />
                                    Ausente
                                </label>
                            </div>

                            <label className="block text-sm font-medium text-gray-700">
                                Nota
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                />
                            </label>
                        </div>

                        <div className="flex justify-end mt-5 gap-3">
                            <button
                                onClick={() => setEditing(null)}
                                className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
