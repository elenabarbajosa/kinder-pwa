'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Child = { id: string; first_name: string };

export default function ChangePage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [childId, setChildId] = useState('');
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [newIn, setNewIn] = useState<string>('');
    const [newOut, setNewOut] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string>('');

    // cargar alumn@s para el desplegable
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('children')
                .select('id, first_name')
                .order('first_name');
            if (!error) setChildren(data ?? []);
        })();
    }, []);

    const submit = async () => {
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
        setNewIn('');
        setNewOut('');
        setNote('');
        setTimeout(() => setOk(''), 1500);
    };

    return (
        <main className="min-h-screen p-6 flex justify-center bg-[var(--color-bg)]">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
                <h1 className="text-2xl font-semibold mb-6 text-[var(--color-primary-dark)] text-center">
                    Registrar cambio de horario
                </h1>

                {/* Selector de alumn@ */}
                <select
                    className="border border-[var(--color-border)] rounded-xl px-3 py-2 w-full mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    value={childId}
                    onChange={(e) => setChildId(e.target.value)}
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
                        className="mt-1 border border-[var(--color-border)] rounded-xl px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>

                {/* Horas */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <label className="text-sm font-medium text-gray-700">
                        Nueva entrada
                        <input
                            type="time"
                            className="mt-1 border border-[var(--color-border)] rounded-xl px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            value={newIn}
                            onChange={(e) => setNewIn(e.target.value)}
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Nueva salida
                        <input
                            type="time"
                            className="mt-1 border border-[var(--color-border)] rounded-xl px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            value={newOut}
                            onChange={(e) => setNewOut(e.target.value)}
                        />
                    </label>
                </div>

                {/* Nota */}
                <label className="block text-sm mb-4 font-medium text-gray-700">
                    Nota
                    <input
                        className="mt-1 border border-[var(--color-border)] rounded-xl px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Opcional"
                    />
                </label>

                {/* Botón Guardar */}
                <button
                    onClick={submit}
                    disabled={saving}
                    className="w-full px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium shadow-sm hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-50"
                >
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>

                {ok && <p className="mt-3 text-center text-green-600 font-medium">{ok}</p>}
            </div>
        </main>
    );
}
