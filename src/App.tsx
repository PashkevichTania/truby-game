import  { useState } from 'react';
import {SOURCES, TARGETS, TILE_DATA} from "./const";
import {getActiveSides} from "./lib";
import TileComponent from "./components/Tile";
import type {Tile, Types} from "./types";

const PipeGame = () => {
  const ROWS = 6;
  const COLS = 7;

  const [won, setWon] = useState(false);

// Инициализация сетки с фиксированным начальным перемешиванием
  const [grid, setGrid] = useState<Tile[]>(() =>
      TILE_DATA.map((type: Types, i) => ({
        id: i,
        type: type,
        rotation: 0, // "Рандомный" начальный поворот
        activeColors: []
      }))
  );


// Алгоритм поиска пути (BFS)
  const calculateFlow = () => {
      let newGrid = grid.map(tile => ({ ...tile, activeColors: [] }));
      let completedTargets = new Set();

    SOURCES.forEach(source => {
        // Начинаем: вода входит в верхний ряд (row 0) со стороны 0 (верх)
        // fromDir в очереди — это направление движения воды (2 = вниз)
      const queue = [{ row: 0, col: source.col, fromDir: 0 }]; // 0 - вход сверху
      const visited = new Set();

      while (queue.length > 0) {
          const { row, col, fromDir } = queue.shift()!;
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

        if (row === 0 && fromDir === 0) {
          if (!activeSides.includes(0)) continue; // Источник не подключен
        } else {
          if (!activeSides.includes(incomingSide)) continue;
        }

        // Если нашли соединение, помечаем плитку цветом
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
        activeSides.forEach(side => {
          if (side === incomingSide && !(row === 0 && fromDir === 0)) return;

          let nextRow = row, nextCol = col;
          if (side === 0) nextRow--;
          if (side === 1) nextCol++;
          if (side === 2) nextRow++;
          if (side === 3) nextCol--;

          if (nextRow >= 0 && nextRow < ROWS && nextCol >= 0 && nextCol < COLS) {
            queue.push({ row: nextRow, col: nextCol, fromDir: side });
          }
        });
      }
    });

    setGrid(newGrid);
      if (completedTargets.size === SOURCES.length) setWon(true);
  };

  const handleTileClick = (index: number) => {
    const newGrid = [...grid];
    newGrid[index].rotation = (newGrid[index].rotation + 1) % 4;
    setGrid(newGrid);
    // Опционально: сразу пересчитывать поток при клике
    // calculateFlow(newGrid);
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans">
          <h1 className="text-3xl font-black text-slate-200 mb-12 tracking-tighter italic">
              PIPE <span className="text-cyan-500">FLOW</span>
          </h1>

          <div className="relative p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">

              {/* ИСТОЧНИКИ (Верх) */}
              <div className="absolute top-0 left-8 right-8 flex justify-around -translate-y-1/2"
                   style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '0.5rem' }}>
                  {SOURCES.map(s => (
                      <div key={s.name} className="flex justify-center" style={{ gridColumnStart: s.col + 1 }}>
                          <div className="w-6 h-10 rounded-b-full shadow-lg animate-bounce" style={{ backgroundColor: s.color }} />
                      </div>
                  ))}
              </div>

              {/* СЕТКА */}
              <div
                  className="grid gap-2"
                  style={{
                      gridTemplateColumns: `repeat(${COLS}, 60px)`,
                      gridTemplateRows: `repeat(${ROWS}, 60px)`
                  }}
              >
                  {grid.map((tile, i) => (
                      <TileComponent key={i} tile={tile} onClick={() => handleTileClick(i)} />
                  ))}
              </div>

              {/* ЦЕЛИ (Низ) */}
              <div className="absolute bottom-0 left-8 right-8 flex justify-around translate-y-1/2"
                   style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '0.5rem' }}>
                  {TARGETS.map(t => {
                      const isFilled = grid.some(tile =>
                          tile.id >= (ROWS-1)*COLS && (tile.id % COLS === t.col) && tile.activeColors.includes(t.color)
                      );
                      return (
                          <div key={t.name} className="flex justify-center" style={{ gridColumnStart: t.col + 1 }}>
                              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isFilled ? 'scale-110 shadow-lg' : 'opacity-40'}`}
                                   style={{ borderColor: t.color, backgroundColor: isFilled ? t.color : 'transparent' }}>
                                  {isFilled && <span className="text-white text-xs">✓</span>}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {won && (
              <div className="mt-8 text-green-400 font-bold animate-pulse text-xl">
                  ПОЗДРАВЛЯЕМ! ВСЕ ПОТОКИ СОЕДИНЕНЫ!
              </div>
          )}

          <button
              onClick={calculateFlow}
              className="mt-12 px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl transition-all active:scale-95 shadow-xl uppercase"
          >
              Запустить поток
          </button>
      </div>
  );
};


export default PipeGame;
