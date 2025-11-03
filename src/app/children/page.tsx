'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Classroom = { id: string; name: string };
type Child = {
    id: string;
    first_name: string;
    classroom_id: string;
    default_in: string;
    default_out: string;
    active: boolean;
};

export default function ChildrenPage() {
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            // cargar aulas
            const { data: cls } = await supabase.from('classrooms').select('id,name').order('name');
            setClasses(cls ?? []);
            // cargar alumn@s
            const { data: kids } = await supabase
                .from('children')
                .select('id, first_name, classroom_id, default_in, default_out, active')
                .order('first_name');
            setChildren(kids ?? []);
            setLoading(false);
        })();
    }, []);

    const classNameFor = (id: string) => classes.find(c => c.id === id)?.name ?? '—';

    if (loading) {
        return <main className="p-4 max-w-3xl mx-auto">Cargando…</main>;
    }

    return (
        <main className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Alumn@s</h1>

            <div className="grid gap-2">
                {children.map(k => (
                    <div key={k.id} className="rounded-2xl border p-3 flex items-center justify-between">
                        <div>
                            <div className="text-lg font-medium">{k.first_name}</div>
                            <div className="text-sm text-gray-600">
                                Clase: {classNameFor(k.classroom_id)}
                            </div>
                        </div>
                        <div className="text-right text-sm">
                            <div>Entrada <span className="font-medium">{k.default_in}</span></div>
                            <div>Salida <span className="font-medium">{k.default_out}</span></div>
                        </div>
                    </div>
                ))}
                {children.length === 0 && (
                    <div className="text-sm text-gray-600">No hay alumn@s aún.</div>
                )}
            </div>
        </main>
    );
}
