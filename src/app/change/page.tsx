'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';

type Child = {
    id: string;
    first_name: string;
    default_in: string;
    default_out: string;
    takes_bus_morning: boolean;
    takes_bus_afternoon: boolean;
};

const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

export default function ChangePage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [childId, setChildId] = useState('');
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [newIn, setNewIn] = useState<string>('');
    const [newOut, setNewOut] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string>('');

    const [busMorning, setBusMorning] = useState(false);
    const [busAfternoon, setBusAfternoon] = useState(false);
    const [absent, setAbsent] = useState(false);

    // iOS modal state
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('children')
                .select(
                    'id, first_name, default_in, default_out, takes_bus_morning, takes_bus_afternoon'
                )
                .order('first_name');
            if (!error) setChildren((data as Child[]) ?? []);
        })();
    }, []);

    // selected child object for convenience
    const selectedChild = useMemo(
        () => children.find((c) => c.id === childId) || null,
        [children, childId]
    );

    const applySelectedChild = (id: string) => {
        setChildId(id);
        const c = children.find((x) => x.id === id);
        if (c) {
            setNewIn(c.default_in || '');
            setNewOut(c.default_out || '');
            setBusMorning(!!c.takes_bus_morning);
            setBusAfternoon(!!c.takes_bus_afternoon);
        } else {
            setNewIn('');
            setNewOut('');
            setBusMorning(false);
            setBusAfternoon(false);
        }
    };

    const submit = async () => {
        if (!childId) {
            alert('Elige un/a alumn@ antes de guardar.');
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
            bus_morning_override: busMorning,
            bus_afternoon_override: busAfternoon,
            absent,
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
        setBusMorning(false);
        setBusAfternoon(false);
        setAbsent(false);
        setTimeout(() => setOk(''), 1500);
    };

    return (
        <main className="min-h-screen p-6 flex justify-center bg-[var(--color-bg)]">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
                <h1 className="text-2xl font-semibold mb-6 text-[var(--color-primary-dark)] text-center">
                    Registrar cambio de horario
                </h1>

                {/* Student picker */}
                {!isIOS ? (
                    <select
                        value={childId}
                        onChange={(e) => applySelectedChild(e.target.value)}
                        onInput={(e) => applySelectedChild((e.target as HTMLSelectElement).value)}
                        className="border border-[var(--color-border)] rounded-xl px-4 py-2 w-full mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    >
                        <option value="">Elige alumn@…</option>
                        {children.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.first_name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <>
                        <button
                            type="button"
                            className="w-full text-left border border-[var(--color-border)] rounded-xl px-4 py-2 mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            onClick={() => setPickerOpen(true)}
                        >
                            {selectedChild ? selectedChild.first_name : 'Elige alumn@…'}
                        </button>

                        {pickerOpen && (
                            <div className="fixed inset-0 z-[1000]">
                                {/* backdrop */}
                                <div
                                    className="absolute inset-0 bg-black/40"
                                    onClick={() => setPickerOpen(false)}
                                />
                                {/* sheet */}
                                <div className="absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl bg-white shadow-lg overflow-hidden">
                                    <div className="p-4 border-b font-semibold text-[var(--color-primary-dark)]">
                                        Elige alumn@
                                    </div>
                                    <div className="overflow-y-auto max-h-[60vh] divide-y">
                                        {children.map((c) => (
                                            <button
                                                key={c.id}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                                onClick={() => {
                                                    applySelectedChild(c.id);
                                                    setPickerOpen(false);
                                                }}
                                            >
                                                {c.first_name}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3">
                                        <button
                                            className="w-full border rounded-xl py-2"
                                            onClick={() => setPickerOpen(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Fecha */}
                <label className="block text-sm mb-2 font-medium text-gray-700">
                    Fecha
                    <input
                        type="date"
                        inputMode="numeric"
                        className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-3 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all [appearance:none]"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>

                {/* Horas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <label className="text-sm font-medium text-gray-700">
                        Nueva entrada
                        <input
                            type="time"
                            inputMode="numeric"
                            step={300}
                            className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-3 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all [appearance:none]"
                            value={newIn}
                            onChange={(e) => setNewIn(e.target.value)}
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Nueva salida
                        <input
                            type="time"
                            inputMode="numeric"
                            step={300}
                            className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-3 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all [appearance:none]"
                            value={newOut}
                            onChange={(e) => setNewOut(e.target.value)}
                        />
                    </label>
                </div>

                {/* Opciones */}
                <div className="flex flex-col gap-3 mb-4">
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

                <label className="block text-sm mb-4 font-medium text-gray-700">
                    Nota
                    <input
                        className="mt-1 border border-[var(--color-border)] rounded-xl px-4 py-3 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all [appearance:none]"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Opcional"
                    />
                </label>

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
