import { useState, useMemo, ReactNode } from 'react';

// --- TYPES ---
type LawType = 'basic' | 'advanced' | 'demorgan';

interface BooleanLaw {
    id: string;
    name: string;
    category: LawType;
    expr1: string;
    expr2: string;
    visualLHS?: ReactNode;
    visualRHS?: ReactNode;
    description: string;
    requiresC: boolean;
}

// --- DATA: The Laws of Boolean Algebra ---
const LAWS: BooleanLaw[] = [
    { id: 'id_and', name: 'Identity (AND)', category: 'basic', expr1: 'A • 1', expr2: 'A', description: 'ANDing anything with 1 changes nothing.', requiresC: false },
    { id: 'id_or', name: 'Identity (OR)', category: 'basic', expr1: 'A + 0', expr2: 'A', description: 'ORing anything with 0 changes nothing.', requiresC: false },
    { id: 'null_and', name: 'Null Element (AND)', category: 'basic', expr1: 'A • 0', expr2: '0', description: 'ANDing with 0 always kills the signal.', requiresC: false },
    { id: 'null_or', name: 'Null Element (OR)', category: 'basic', expr1: 'A + 1', expr2: '1', description: 'ORing with 1 always maximizes the signal.', requiresC: false },
    { id: 'idem_and', name: 'Idempotent (AND)', category: 'basic', expr1: 'A • A', expr2: 'A', description: 'Redundant inputs don\'t change the value.', requiresC: false },
    {
        id: 'inv_and',
        name: 'Inverse (AND)',
        category: 'basic',
        expr1: "A • A'",
        expr2: '0',
        visualLHS: <span>A • <span className="border-t-2 border-current">A</span></span>,
        description: 'A signal AND its opposite is always false.',
        requiresC: false
    },
    {
        id: 'inv_or',
        name: 'Inverse (OR)',
        category: 'basic',
        expr1: "A + A'",
        expr2: '1',
        visualLHS: <span>A + <span className="border-t-2 border-current">A</span></span>,
        description: 'A signal OR its opposite covers all possibilities (always true).',
        requiresC: false
    },
    { id: 'comm_and', name: 'Commutative', category: 'advanced', expr1: 'A • B', expr2: 'B • A', description: 'Order does not matter.', requiresC: false },
    { id: 'assoc_add', name: 'Associative', category: 'advanced', expr1: 'A + (B + C)', expr2: '(A + B) + C', description: 'Grouping does not matter in a chain of ORs.', requiresC: true },
    { id: 'dist_1', name: 'Distributive #1', category: 'advanced', expr1: 'A(B + C)', expr2: 'AB + AC', description: 'Standard distribution, just like in regular algebra.', requiresC: true },
    { id: 'dist_2', name: 'Distributive #2', category: 'advanced', expr1: 'A + BC', expr2: '(A+B)(A+C)', description: 'A unique Boolean rule. Very useful for factoring.', requiresC: true },
    { id: 'absorp_1', name: 'Absorption #1', category: 'advanced', expr1: 'A + AB', expr2: 'A', description: 'The term "A" absorbs the "AB" term completely.', requiresC: false },
    { id: 'absorp_2', name: 'Absorption #2', category: 'advanced', expr1: 'A(A + B)', expr2: 'A', description: 'Also simplifies to just A.', requiresC: false },
    {
        id: 'dm_1',
        name: 'De Morgan #1',
        category: 'demorgan',
        expr1: "(A + B)'",
        expr2: "A' • B'",
        visualLHS: <span className="border-t-4 border-slate-800 inline-block leading-none pt-1">A + B</span>,
        visualRHS: <span><span className="border-t-4 border-slate-800 inline-block leading-none pt-1">A</span> • <span className="border-t-4 border-slate-800 inline-block leading-none pt-1">B</span></span>,
        description: 'Break the bar, change the sign (NOR -> AND).',
        requiresC: false
    },
    {
        id: 'dm_2',
        name: 'De Morgan #2',
        category: 'demorgan',
        expr1: "(AB)'",
        expr2: "A' + B'",
        visualLHS: <span className="border-t-4 border-slate-800 inline-block leading-none pt-1">A • B</span>,
        visualRHS: <span><span className="border-t-4 border-slate-800 inline-block leading-none pt-1">A</span> + <span className="border-t-4 border-slate-800 inline-block leading-none pt-1">B</span></span>,
        description: 'Break the bar, change the sign (NAND -> OR).',
        requiresC: false
    },
];

export default function BooleanAlgebra() {
    const [activeLawId, setActiveLawId] = useState<string>('dm_1');
    const [inputs, setInputs] = useState<{ a: boolean; b: boolean; c: boolean }>({ a: false, b: false, c: false });

    const activeLaw = LAWS.find(l => l.id === activeLawId) || LAWS[0];

    const results = useMemo(() => {
        const { a, b, c } = inputs;
        let lhs = false;
        let rhs = false;

        switch (activeLaw.id) {
            case 'id_and': lhs = a && true; rhs = a; break;
            case 'id_or': lhs = a || false; rhs = a; break;
            case 'null_and': lhs = a && false; rhs = false; break;
            case 'null_or': lhs = a || true; rhs = true; break;
            case 'idem_and': lhs = a && a; rhs = a; break;
            case 'inv_and': lhs = a && !a; rhs = false; break;
            case 'inv_or': lhs = a || !a; rhs = true; break;
            case 'comm_and': lhs = a && b; rhs = b && a; break;
            case 'assoc_add': lhs = a || (b || c); rhs = (a || b) || c; break;
            case 'dist_1': lhs = a && (b || c); rhs = (a && b) || (a && c); break;
            case 'dist_2': lhs = a || (b && c); rhs = (a || b) && (a || c); break;
            case 'absorp_1': lhs = a || (a && b); rhs = a; break;
            case 'absorp_2': lhs = a && (a || b); rhs = a; break;
            case 'dm_1': lhs = !(a || b); rhs = !a && !b; break;
            case 'dm_2': lhs = !(a && b); rhs = !a || !b; break;
            default: lhs = false; rhs = false;
        }

        return { lhs, rhs, match: lhs === rhs };
    }, [activeLaw, inputs]);

    const toggle = (key: 'a' | 'b' | 'c') => {
        setInputs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // FIX: Define the keys array with proper typing
    const inputKeys: ('a' | 'b' | 'c')[] = activeLaw.requiresC ? ['a', 'b', 'c'] : ['a', 'b'];

    return (
        <section>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Boolean Algebra & Identities</h1>
                <p className="mt-2 text-slate-600">
                    Select a Boolean Identity to prove it logically. These are the tools you use to simplify circuits.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                    {['basic', 'advanced', 'demorgan'].map((cat) => (
                        <div key={cat}>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{cat} Laws</h3>
                            <div className="space-y-1">
                                {LAWS.filter(l => l.category === cat).map(law => (
                                    <button
                                        key={law.id}
                                        onClick={() => setActiveLawId(law.id)}
                                        className={`w-full text-left px-4 py-3 rounded-md text-sm transition-all border ${activeLawId === law.id
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="font-bold">{law.name}</div>
                                        <div className="font-mono text-xs opacity-75 mt-1">{law.expr1} = {law.expr2}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-8">
                    <div className="border-2 border-dashed border-slate-200 rounded-md p-6 bg-slate-50 min-h-[400px] flex flex-col h-full">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-800">{activeLaw.name}</h2>
                            <p className="text-slate-500 text-sm mt-1">{activeLaw.description}</p>
                        </div>

                        <div className="flex items-center justify-center gap-4 bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
                            <div className="text-center">
                                <div className="text-xs font-bold text-slate-400 mb-2">ORIGINAL (LHS)</div>
                                <div className="text-2xl sm:text-4xl font-mono font-bold text-slate-800 px-4">
                                    {/* Prefer visualLHS if it exists, otherwise use text */}
                                    {activeLaw.visualLHS ? activeLaw.visualLHS : activeLaw.expr1}
                                </div>
                            </div>
                            <div className="text-3xl text-slate-300 font-light">=</div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-slate-400 mb-2">SIMPLIFIED (RHS)</div>
                                <div className="text-2xl sm:text-4xl font-mono font-bold text-blue-600 px-4">
                                    {activeLaw.visualRHS ? activeLaw.visualRHS : activeLaw.expr2}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Inputs</h4>
                                <div className="flex gap-4">
                                    {inputKeys.map((key) => (
                                        <div key={key} className="flex flex-col items-center gap-2">
                                            <span className="font-mono font-bold text-slate-500 uppercase">{key}</span>
                                            <button
                                                onClick={() => toggle(key)}
                                                className={`w-12 h-12 rounded-lg font-mono text-xl font-bold border-b-4 transition-all active:border-b-0 active:translate-y-1 ${inputs[key]
                                                        ? 'bg-blue-500 border-blue-700 text-white'
                                                        : 'bg-slate-200 border-slate-300 text-slate-500'
                                                    }`}
                                            >
                                                {inputs[key] ? '1' : '0'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Verification</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm font-mono">
                                        <span className="text-slate-600">LHS Value:</span>
                                        <span className={results.lhs ? 'text-green-600 font-bold' : 'text-slate-400 font-bold'}>
                                            {results.lhs ? 'TRUE (1)' : 'FALSE (0)'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-mono">
                                        <span className="text-slate-600">RHS Value:</span>
                                        <span className={results.rhs ? 'text-green-600 font-bold' : 'text-slate-400 font-bold'}>
                                            {results.rhs ? 'TRUE (1)' : 'FALSE (0)'}
                                        </span>
                                    </div>
                                    <div className={`mt-2 pt-2 border-t border-slate-100 text-center font-bold ${results.match ? 'text-green-600' : 'text-red-500'}`}>
                                        {results.match ? '✓ EQUIVALENT' : '✗ ERROR'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto bg-yellow-50 text-yellow-800 p-4 rounded text-sm border border-yellow-100 flex gap-2">
                            <span className="font-bold">💡:</span>
                            <span>
                                Try setting inputs to different combinations. If Left-Hand side (LHS) and Right-Hand side(RHS) result in the same output for
                                <strong> ALL</strong> possible input combinations, the identity is proven.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}