import { useState } from 'react';

type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export default function LogicGates() {
    const [selected, setSelected] = useState<GateType>('AND');

    const gates = {
        AND: { ic: '7408', formula: 'A • B', desc: 'Output is HIGH only if all inputs are HIGH.' },
        OR: { ic: '7432', formula: 'A + B', desc: 'Output is HIGH if at least one input is HIGH.' },
        NOT: { ic: '7404', formula: "A'", desc: 'Inverts the input (0 becomes 1, 1 becomes 0).' },
        NAND: { ic: '7400', formula: "(A • B)'", desc: 'Output is LOW only if all inputs are HIGH.' },
        NOR: { ic: '7402', formula: "(A + B)'", desc: 'Output is HIGH only if all inputs are LOW.' },
        XOR: { ic: '7486', formula: "A ⊕ B", desc: 'Output is HIGH if inputs are different.' },
        XNOR: { ic: '74266', formula: "(A ⊕ B)'", desc: 'Output is HIGH if inputs are the same.' },
    };

    const current = gates[selected];

    return (
        <section>
            <h1 className="text-2xl font-semibold">Logic Gates Reference</h1>
            <p className="mt-2 text-slate-600">Select a gate to view its IC number, logic symbol, and formula.</p>

            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-md p-6 flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <div className="flex flex-row md:flex-col flex-wrap gap-2 w-full md:w-1/4">
                    {(Object.keys(gates) as GateType[]).map(g => (
                        <button
                            key={g}
                            onClick={() => setSelected(g)}
                            className={`px-4 py-2 rounded text-left font-bold transition-all ${selected === g ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>

                {/* Main Display */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">

                    <div className="text-6xl font-black text-slate-800 mb-2">{selected}</div>
                    <div className="text-sm font-mono text-slate-400 mb-6 bg-slate-50 px-2 py-1 rounded">IC Series: <span className="text-blue-600 font-bold">{current.ic}</span></div>

                    <div className="w-full h-px bg-slate-100 mb-6"></div>

                    <div className="text-3xl font-mono font-bold text-slate-700 mb-4">
                        Y = {current.formula}
                    </div>

                    <p className="text-slate-600 max-w-sm">
                        {current.desc}
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs">
                        {/* Simple Truth Table Preview */}
                        <div className="col-span-2 text-xs font-bold text-slate-400 tracking-widest uppercase">Truth Table Snippet</div>
                        <div className="flex justify-between border-b border-slate-100 py-1">
                            <span>0, 0</span>
                            <span className="font-bold">{selected === 'AND' || selected === 'OR' || selected === 'XOR' ? '0' : selected === 'NOT' ? '1' : '1'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1">
                            <span>1, 1</span>
                            <span className="font-bold">{selected === 'AND' || selected === 'XNOR' ? '1' : selected === 'NOT' ? '0' : '0'}</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}