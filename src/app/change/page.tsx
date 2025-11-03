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
        <main className="p-4 max-w-md mx-auto space-y-3">
            <h1 className="text-2xl font-semibold">Registrar cambio de horario</h1>

            <select
                className="border rounded-xl px-3 py-2 w-full"
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

            <label className="block text-sm">
                Fecha
                <input
                    type="date"
                    className="border rounded-xl px-3 py-2 w-full"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </label>

            <div className="grid grid-cols-2 gap-2">
                <label className="text-sm">
                    Nueva entrada
                    <input
                        type="time"
                        className="border rounded-xl px-3 py-2 w-full"
                        value={newIn}
                        onChange={(e) => setNewIn(e.target.value)}
                    />
                </label>
                <label className="text-sm">
                    Nueva salida
                    <input
                        type="time"
                        className="border rounded-xl px-3 py-2 w-full"
                        value={newOut}
                        onChange={(e) => setNewOut(e.target.value)}
                    />
                </label>
            </div>

            <label className="block text-sm">
                Nota
                <input
                    className="border rounded-xl px-3 py-2 w-full"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Opcional"
                />
            </label>

            <button
                onClick={submit}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-black text-white"
            >
                {saving ? 'Guardando…' : 'Guardar'}
            </button>
            {ok && <span className="ml-2 text-green-700">{ok}</span>}
        </main>
    );
}
