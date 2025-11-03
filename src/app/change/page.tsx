'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';

type Child = {
    id: string;
    first_name: string;
    default_in: string;
    default_out: string;
};

function splitTime(t?: string | null) {
    if (!t) return { h: '', m: '' };
    // Accept "HH:MM" or "HH:MM:SS"
    const [h, m] = t.slice(0, 5).split(':');
    return { h: h ?? '', m: m ?? '' };
}

export default function ChangePage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [childId, setChildId] = useState('');
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string>('');

    // Hour/min selects (we store hours and minutes separately to enforce 5-min steps)
    const [inHour, setInHour] = useState(''); const [inMin, setInMin] = useState('');
    const [outHour, setOutHour] = useState(''); const [outMin, setOutMin] = useState('');

    // Options for selects
    const hours = useMemo(
        () => Array.from({ length: 15 }, (_, i) => String(i + 7).padStart(2, '0')), // 07..21
        [],
    );
    const minutes = useMemo(
        () => ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
        [],
    );

    // Load children (with defaults)
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('children')
                .select('id, first_name, default_in, default_out')
                .order('first_name');
            if (!error) setChildren(data ?? []);
        })();
    }, []);

    // When a child is chosen, fill selects with their defaults
    const handleSelectChild = (id: string) => {
        setChildId(id);
        const selected = children.find((c) => c.id === id);
        if (selected) {
            const i = splitTime(selected.default_in);
            const o = splitTime(selected.default_out);
            setInHour(i.h); setInMin(i.m);
            setOutHour(o.h); setOutMin(o.m);
        } else {
            setInHour(''); setInMin('');
            setOutHour(''); setOutMin('');
        }
    };

    const composeTime = (h: string, m: string) => (h && m ? `${h}:${m}` : '');

    const submit = async () => {
        const newIn = composeTime(inHour, inMin);
        const newOut = composeTime(outHour, outMin);

        if (!childId || (!newIn && !newOut)) {
            alert('Elige un/a alumn@ y al menos una hora nueva.');
            return;
        }

        setSaving(true);
        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes?.user?.id;

        const { error } = await supabase.from('exceptions').insert({
            child_id: childId,
            date,
            new_in: newIn || null,
            new_out: newOut || null,
            note: note || null,
            created_by: userId,
        });

        setSaving(false);
        if (error) {
            alert(error.message);
            return;
        }

        setOk('Guardado ✓');
        // leave selects as-is (often teachers add several changes)
        setNote('');
        setTimeout(() => setOk(''), 1500);
    };

    return (
        <main className="min-h-screen p-6 flex justify-center bg-[var(--color-bg)]">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
                <h1 className="text-2xl font-semibold mb-6 text-[var(--color-primary-dark)] text-center">
                    Registrar cambio de horario
                </h1>

                {/* Alumn@ */}
                <select
                    className="border border-[var(--color-border)] rounded-xl px-4 py-2 w-full mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    value={childId}
                    onChange={(e) => handleSelectChild(e.target.value)}
                >
                    <option value="">Elige alumn@…</option>
                    {children.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.first_name}
                        </option>
                    ))}
                </select>

                {/* Fecha */}
                <label className="block text-sm mb-2 font-medium text-gray-700">
                    Fecha
                    <input
                        type="date"
                        inputMode="numeric"
                        className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>

                {/* Horas (custom selects to enforce 5-min steps across iOS/Android) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Nueva entrada</div>
                        <div className="flex gap-2">
                            <select
                                value={inHour}
                                onChange={(e) => setInHour(e.target.value)}
                                className="border border-[var(--color-border)] rounded-xl px-3 py-2 bg-white w-24 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                                <option value="">HH</option>
                                {hours.map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <select
                                value={inMin}
                                onChange={(e) => setInMin(e.target.value)}
                                className="border border-[var(--color-border)] rounded-xl px-3 py-2 bg-white w-24 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                                <option value="">MM</option>
                                {minutes.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Nueva salida</div>
                        <div className="flex gap-2">
                            <select
                                value={outHour}
                                onChange={(e) => setOutHour(e.target.value)}
                                className="border border-[var(--color-border)] rounded-xl px-3 py-2 bg-white w-24 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                                <option value="">HH</option>
                                {hours.map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <select
                                value={outMin}
                                onChange={(e) => setOutMin(e.target.value)}
                                className="border border-[var(--color-border)] rounded-xl px-3 py-2 bg-white w-24 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                                <option value="">MM</option>
                                {minutes.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Nota */}
                <label className="block text-sm mb-4 font-medium text-gray-700">
                    Nota
                    <input
                        className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Opcional"
                    />
                </label>

                {/* Guardar */}
                <button
                    onClick={submit}
                    disabled={saving}
                    className="w-full px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium shadow-sm hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-50"
                >
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>

                {ok && <p className="mt-3 text-center text-green-600 font-medium">{ok}</p>}
            </div>
        </main>
    );
}
