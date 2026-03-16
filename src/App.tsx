import {useState} from 'react';
import {getActiveSides} from "./lib";
import TileComponent from "./components/Tile";
import type {Tile, Types} from "./types";
import {SOURCES, TARGETS, TILE_DATA, TYPES} from "./const";


const PipeGame = () => {
    const ROWS = 6;
    const COLS = 7;

    const [won, setWon] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [finishTime, setFinishTime] = useState<number | null>(null);

    // Инициализация сетки с фиксированным начальным перемешиванием
    const initialGrid = TILE_DATA.map((type: Types, i) => ({
        id: i,
        type: type,
        rotation: 0, // "Рандомный" начальный поворот
        activeColors: []
    }));

    const [grid, setGrid] = useState<Tile[]>(initialGrid);

    const handleRestart = () => {
        setGrid(initialGrid);
        setWon(false);
        setStartTime(null);
        setFinishTime(null);
    };


// Алгоритм поиска пути (BFS)
    const calculateFlow = () => {
        let newGrid = grid.map(tile => ({...tile, activeColors: []}));
        let completedTargets = new Set();

        const getNeighborCoords = (r: number, c: number, side: number) => {
            let nextR = r, nextC = c;
            if (side === 0) nextR--;
            if (side === 1) nextC++;
            if (side === 2) nextR++;
            if (side === 3) nextC--;
            return {nextR, nextC};
        };

        const isValidCoord = (r: number, c: number) => {
            return r >= 0 && r < ROWS && c >= 0 && c < COLS;
        };

        SOURCES.forEach(source => {
            // Начинаем: вода входит в верхний ряд (row 0) со стороны 0 (верх)
            // fromDir в очереди — это направление движения воды (2 = вниз)
            const queue = [{row: 0, col: source.col, fromDir: 2}]; // 2 - вход сверху (вода пришла снизу от источника)
            const visited = new Set();

            while (queue.length > 0) {
                const {row, col, fromDir} = queue.shift()!;
                const currentIndex = row * COLS + col;
                const tile: Tile = newGrid[currentIndex];

                if (!tile || visited.has(`${currentIndex}-${source.name}`)) continue;

                const activeSides = getActiveSides(tile.type, tile.rotation);

                // Проверяем, есть ли вход у плитки с той стороны, откуда пришла вода
                // Если вода пришла СВЕРХУ (0), то у плитки должен быть открыт ВЕРХ (0)
                const incomingSide = (fromDir + 2) % 4; // Противоположная сторона

                // Если у плитки нет "входа" с этой стороны — поток прерывается
                if (!activeSides.includes(incomingSide)) continue;

                // Добавляем цвет (сет предотвращает дубликаты)
                if (!tile.activeColors.includes(source.color)) {
                    tile.activeColors.push(source.color);
                }

                tile.activeColors = Array.from(new Set([...tile.activeColors, source.color]));
                visited.add(`${currentIndex}-${source.name}`);

                // Проверка: достигли ли мы дна в нужной колонке?
                if (row === ROWS - 1) {
                    const target = TARGETS.find(t => t.col === col && t.color === source.color);
                    if (target && activeSides.includes(2)) { // Если у трубы есть выход вниз
                        completedTargets.add(source.name);
                    }
                }

                // Ищем, куда течь дальше
                let sidesToProcess: number[] = [];

                if (tile.type === TYPES.CROSS) {
                    const oppositeSide = (incomingSide + 2) % 4;
                    let foundOutgoingSide: number | null = null;

                    // 1. Проверяем противоположную сторону
                    const {nextR: oppR, nextC: oppC} = getNeighborCoords(row, col, oppositeSide);
                    if (isValidCoord(oppR, oppC)) {
                        const neighborTile = newGrid[oppR * COLS + oppC];
                        // The incoming side for the neighbor is the opposite of the current tile's outgoing side
                        const incomingSideForNeighbor = (oppositeSide + 2) % 4;
                        if (neighborTile && getActiveSides(neighborTile.type, neighborTile.rotation).includes(incomingSideForNeighbor)) {
                            foundOutgoingSide = oppositeSide;
                        }
                    }

                    // 2. Если противоположная сторона не найдена или не соединена, ищем первый доступный соединенный выход
                    if (foundOutgoingSide === null) {
                        // Filter activeSides to exclude the incoming side
                        const potentialOutgoingSides = activeSides.filter(side => side !== incomingSide);

                        for (const side of potentialOutgoingSides) {
                            const {nextR, nextC} = getNeighborCoords(row, col, side);
                            if (isValidCoord(nextR, nextC)) {
                                const neighborTile = newGrid[nextR * COLS + nextC];
                                const incomingSideForNeighbor = (side + 2) % 4;
                                if (neighborTile && getActiveSides(neighborTile.type, neighborTile.rotation).includes(incomingSideForNeighbor)) {
                                    foundOutgoingSide = side;
                                    break; // Нашли первый соединенный выход, выходим
                                }
                            }
                        }
                    }

                    if (foundOutgoingSide !== null) {
                        sidesToProcess.push(foundOutgoingSide);
                    }

                } else {
                    // Для других типов плиток, обрабатываем все активные стороны, кроме входящей
                    sidesToProcess = activeSides.filter(side => {
                        // Особая обработка для исходной плитки (row 0, fromDir 2 означает, что вода поступает сверху, incomingSide 0)
                        // Мы не хотим отправлять воду обратно к "источнику"
                        if (row === 0 && fromDir === 2 && side === 0) {
                            return false;
                        }
                        return side !== incomingSide;
                    });
                }

                sidesToProcess.forEach(side => {
                    const {nextR, nextC} = getNeighborCoords(row, col, side);

                    if (isValidCoord(nextR, nextC)) {
                        queue.push({row: nextR, col: nextC, fromDir: side});
                    }
                });
            }
        });

        setGrid(newGrid);
        if (completedTargets.size === SOURCES.length) {
            setWon(true);
            setFinishTime(Date.now());
        }
    };

    const handleTileClick = (index: number) => {
        if (!startTime) {
            setStartTime(Date.now());
        }
        const newGrid = grid.map(tile => ({ ...tile, activeColors: [] })); // Сбрасываем цвета
        newGrid[index].rotation = (newGrid[index].rotation + 1) % 4;
        setGrid(newGrid);
        setWon(false); // Сбрасываем состояние победы
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans">
            <h1 className="text-3xl font-black text-slate-200 mb-12 tracking-tighter italic">
                КВЕСТ <span className="text-cyan-500">НА ДР</span>
            </h1>

            <div className="relative p-4 md:p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">

                {/* ИСТОЧНИКИ (Верх) */}
                <div className="absolute top-0 left-8 right-8 flex justify-around -translate-y-1/2"
                     style={{display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '0.5rem'}}>
                    {SOURCES.map(s => (
                        <div key={s.name} className="flex justify-center" style={{gridColumnStart: s.col + 1}}>
                            <div
                                className="w-6 h-10 rounded-b-full shadow-lg animate-bounce flex justify-center align-center text-lg font-bold text-white"
                                style={{backgroundColor: s.color}}>{s.letter}</div>
                        </div>
                    ))}
                </div>

                {/* СЕТКА */}
                {/* TODO: col row from const */}
                <div
                    className={"grid gap-2 " +
                        "grid-cols-[repeat(7,40px)] grid-rows-[repeat(6,40px)] " +
                        "sm:grid-cols-[repeat(7,40px)] sm:grid-rows-[repeat(6,40px)] " +
                        "md:grid-cols-[repeat(7,50px)] md:grid-rows-[repeat(6,50px)] " +
                        "lg:grid-cols-[repeat(7,60px)] lg:grid-rows-[repeat(6,60px)] " +
                        "xl:grid-cols-[repeat(7,80px)] xl:grid-rows-[repeat(6,80px)] " +
                        "2xl:grid-cols-[repeat(7,100px)] 2xl:grid-rows-[repeat(6,100px)] "
                }
                >
                    {grid.map((tile, i) => (
                        <TileComponent key={i} tile={tile} onClick={() => handleTileClick(i)}/>
                    ))}
                </div>

                {/* ЦЕЛИ (Низ) */}
                <div className="absolute bottom-0 left-8 right-8 flex justify-around translate-y-1/2"
                     style={{display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '0.5rem'}}>
                    {TARGETS.map(t => {
                        const isFilled = grid.some(tile =>
                            tile.id >= (ROWS - 1) * COLS && (tile.id % COLS === t.col) && tile.activeColors.includes(t.color)
                        );
                        return (
                            <div key={t.name} className="flex justify-center" style={{gridColumnStart: t.col + 1}}>
                                <div
                                    className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isFilled ? 'scale-110 shadow-lg' : 'opacity-90'}`}
                                    style={{borderColor: t.color, backgroundColor: isFilled ? t.color : 'transparent'}}>
                                    {isFilled ? <t.icon className="w-6 h-6" fill="white"/> :
                                        <t.icon className="w-6 h-6" fill="#d6d6d6"/>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {won && (
                <div className="mt-8 text-green-400 font-bold animate-pulse text-xl">
                    ПОЗДРАВЛЯЕМ! ВСЕ ЛИНИИ СОЕДИНЕНЫ!
                    {startTime && finishTime && (
                        <div className="text-lg text-white mt-2">
                            Время: {((finishTime - startTime) / 1000).toFixed(2)} сек.
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={calculateFlow}
                className="mt-12 px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl transition-all active:scale-95 shadow-xl uppercase"
            >
                Запустить
            </button>
            <button
                onClick={handleRestart}
                className="mt-4 px-12 py-4 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white font-black rounded-xl transition-all active:scale-95 shadow-xl uppercase"
            >
                Рестарт
            </button>
        </div>
    );
};


export default PipeGame;
