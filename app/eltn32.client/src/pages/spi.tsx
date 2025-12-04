import { useState, useEffect } from 'react';

export default function SPI() {
    const [clock, setClock] = useState(0);
    const [masterVal, setMasterVal] = useState(1);
    const [slaveVal, setSlaveVal] = useState(0);
    const [isTransmitting, setIsTransmitting] = useState(false);

    // Simple clock animation simulation
    useEffect(() => {
        let interval: any;
        if (isTransmitting) {
            interval = setInterval(() => {
                setClock(c => c === 0 ? 1 : 0);
            }, 500);

            // Stop after a few cycles for demo
            setTimeout(() => {
                setIsTransmitting(false);
                setClock(0);
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isTransmitting]);

    return (
        <section>
            <h1 className="text-2xl font-semibold">SPI Protocol (Master/Slave)</h1>
            <p className="mt-2 text-slate-600">
                SPI is a synchronous serial protocol. Data moves on <strong>MOSI</strong> (Master Out Slave In) and <strong>MISO</strong> (Master In Slave Out) simultaneously on the clock edge.
            </p>

            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-md p-6 bg-slate-900 text-white min-h-[300px] flex flex-col items-center">

                <button
                    onClick={() => setIsTransmitting(true)}
                    disabled={isTransmitting}
                    className={`mb-8 px-6 py-2 rounded font-bold ${isTransmitting ? 'bg-slate-700 text-slate-500' : 'bg-green-600 text-white hover:bg-green-500'}`}
                >
                    {isTransmitting ? 'Transmitting...' : 'Start Transmission Simulation'}
                </button>

                <div className="flex w-full max-w-2xl justify-between items-center relative">

                    {/* MASTER */}
                    <div className="w-32 h-32 border-2 border-blue-500 bg-slate-800 rounded-lg flex flex-col items-center justify-center z-10">
                        <span className="font-bold text-blue-400 mb-2">MASTER</span>
                        <div className="text-xs text-slate-400">Data Register</div>
                        <div className="font-mono text-xl">{masterVal}</div>
                    </div>

                    {/* WIRES */}
                    <div className="flex-1 flex flex-col gap-6 px-4 font-mono text-xs relative">

                        {/* CLK Line */}
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-400 w-8 text-right">SCLK</span>
                            <div className={`h-1 flex-1 transition-colors duration-100 ${clock ? 'bg-yellow-400 shadow-[0_0_8px_yellow]' : 'bg-slate-700'}`}></div>
                        </div>

                        {/* MOSI Line */}
                        <div className="flex items-center gap-2">
                            <span className="text-green-400 w-8 text-right">MOSI</span>
                            <div className="h-1 flex-1 bg-slate-700 relative overflow-hidden">
                                {isTransmitting && (
                                    <div className="absolute top-0 bottom-0 w-4 bg-green-500 animate-[moveRight_1s_infinite_linear]"></div>
                                )}
                            </div>
                        </div>

                        {/* MISO Line */}
                        <div className="flex items-center gap-2">
                            <span className="text-purple-400 w-8 text-right">MISO</span>
                            <div className="h-1 flex-1 bg-slate-700 relative overflow-hidden">
                                {isTransmitting && (
                                    <div className="absolute top-0 bottom-0 w-4 bg-purple-500 animate-[moveLeft_1s_infinite_linear]"></div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* SLAVE */}
                    <div className="w-32 h-32 border-2 border-purple-500 bg-slate-800 rounded-lg flex flex-col items-center justify-center z-10">
                        <span className="font-bold text-purple-400 mb-2">SLAVE</span>
                        <div className="text-xs text-slate-400">Data Register</div>
                        <div className="font-mono text-xl">{slaveVal}</div>
                    </div>

                </div>

                {/* Global Keyframe styles for this component */}
                <style>{`
          @keyframes moveRight {
            0% { left: 0; opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          @keyframes moveLeft {
            0% { right: 0; opacity: 1; }
            100% { right: 100%; opacity: 0; }
          }
        `}</style>
            </div>
        </section>
    );
}