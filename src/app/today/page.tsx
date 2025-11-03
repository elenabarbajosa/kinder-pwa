'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
};

export default function Today() {
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [rows, setRows] = useState<Row[]>([]);
    const [selectedClass, setSelectedClass] = useState<'all' | string>('all');
    const [changedOnly, setChangedOnly] = useState(false);

    // cargar aulas
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('classrooms')
                .select('id,name')
                .order('name');
            if (!error) setClasses(data ?? []);
        })();
    }, []);

    // cargar vista de HOY
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from('today_view').select('*');
            if (!error) setRows((data as Row[]) ?? []);
        })();
    }, []);

    const visible = rows
        .filter(r => selectedClass === 'all' || r.classroom_id === selectedClass)
        .filter(r => !changedOnly || r.exception_id);

    const badge = (r: Row) => {
        if (!r.exception_id) return '';
        const diffs: string[] = [];
        if (r.in_time < r.default_in) diffs.push('Entrada antes');
        else if (r.in_time > r.default_in) diffs.push('Entrada después');
        if (r.out_time < r.default_out) diffs.push('Salida antes');
        else if (r.out_time > r.default_out) diffs.push('Salida después');
        return diffs.join(' • ');
    };

    return (
        <main className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-[var(--color-primary-dark)]">Hoy</h1>

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

            <div className="grid gap-3">
                {visible
                    .sort((a, b) => {
                        // 1️⃣ Changed items (with exception_id) go first
                        if (a.exception_id && !b.exception_id) return -1;
                        if (!a.exception_id && b.exception_id) return 1;
                        // 2️⃣ Then sort by arrival time
                        return a.in_time.localeCompare(b.in_time);
                    })
                    .map((r) => (
                        <div
                            key={r.child_id}
                            className={`rounded-2xl border border-[var(--color-border)] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between ${r.exception_id
                                    ? 'bg-[#ffeaf3] border-[var(--color-primary)] border-l-4' // highlighted style
                                    : 'bg-white'
                                }`}
                        >
                            <div>
                                <div className="text-lg font-semibold text-[var(--color-primary-dark)]">
                                    {r.first_name}
                                </div>
                                {r.note && (
                                    <div className="text-sm text-gray-600 mt-1">{r.note}</div>
                                )}
                            </div>
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
                        </div>
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
