import { useState } from 'react';

export default function MSI() {
    // MUX State
    const [inputs, setInputs] = useState([0, 0, 0, 0]); // I0, I1, I2, I3
    const [selectors, setSelectors] = useState([0, 0]); // S1, S0

    const toggleInput = (idx: number) => {
        const newIn = [...inputs];
        newIn[idx] = newIn[idx] === 0 ? 1 : 0;
        setInputs(newIn);
    };

    const toggleSelect = (idx: number) => {
        const newSel = [...selectors];
        newSel[idx] = newSel[idx] === 0 ? 1 : 0;
        setSelectors(newSel);
    };

    // Calculate Logic
    // S1 is MSB (value 2), S0 is LSB (value 1)
    const selectedIndex = (selectors[0] * 2) + selectors[1];
    const output = inputs[selectedIndex];

    return (
        <section>
            <h1 className="text-2xl font-semibold">MSI: 4-to-1 Multiplexer</h1>
            <p className="mt-2 text-slate-600">A MUX acts like a digital switch. The Select lines choose which Input flows to the Output.</p>

            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-md p-6 bg-slate-50 flex flex-col md:flex-row items-center justify-center gap-12">

                {/* INPUTS SIDE */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-center font-bold text-slate-400 text-sm">DATA INPUTS</h3>
                    {inputs.map((val, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className={`font-mono text-sm ${idx === selectedIndex ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>I{idx}</span>
                            <button
                                onClick={() => toggleInput(idx)}
                                className={`w-10 h-10 border-2 rounded flex items-center justify-center font-mono font-bold transition-all
                  ${val === 1 ? 'bg-white border-green-500 text-green-700' : 'bg-slate-200 border-slate-300 text-slate-400'}
                  ${idx === selectedIndex ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                `}
                            >
                                {val}
                            </button>
                            {/* Wire visualization */}
                            <div className={`h-1 w-8 transition-colors ${idx === selectedIndex ? (val ? 'bg-green-500' : 'bg-slate-400') : 'bg-slate-200'}`}></div>
                        </div>
                    ))}
                </div>

                {/* MUX CHIP VISUAL */}
                <div className="relative w-32 h-64 bg-slate-800 rounded-lg flex items-center justify-center shadow-xl text-white">
                    <span className="font-bold tracking-widest -rotate-90 text-2xl text-slate-600">MUX 4:1</span>

                    {/* Select Lines entering bottom */}
                    <div className="absolute -bottom-12 flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-1 bg-blue-400"></div>
                            <button onClick={() => toggleSelect(0)} className="w-8 h-8 rounded bg-blue-100 text-blue-800 font-bold mt-1 text-xs flex items-center justify-center">{selectors[0]}</button>
                            <span className="text-xs font-bold text-slate-400">S1</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-1 bg-blue-400"></div>
                            <button onClick={() => toggleSelect(1)} className="w-8 h-8 rounded bg-blue-100 text-blue-800 font-bold mt-1 text-xs flex items-center justify-center">{selectors[1]}</button>
                            <span className="text-xs font-bold text-slate-400">S0</span>
                        </div>
                    </div>
                </div>

                {/* OUTPUT SIDE */}
                <div className="flex items-center gap-2">
                    <div className={`h-1 w-12 ${output === 1 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-300'}`}></div>
                    <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-3xl font-mono font-bold
                ${output === 1 ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'bg-white border-slate-300 text-slate-300'}
              `}>
                            {output}
                        </div>
                        <span className="mt-2 font-bold text-slate-500 text-sm">OUTPUT Y</span>
                    </div>
                </div>

            </div>
        </section>
    );
}