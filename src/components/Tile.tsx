import {memo} from "react";
import Pipe from "./Pipe";
import type {Tile} from "../types";

const Tile = ({ tile, onClick }: { tile: Tile, onClick: VoidFunction }) => {
    return (
        <div
            onClick={onClick}
            className={`
        relative aspect-square w-full h-full 
        bg-slate-800/50 border border-slate-700/50 
        cursor-pointer rounded-md overflow-hidden
        transition-all duration-300 hover:bg-slate-700/50
      `}
        >
            <div
                className="w-full h-full transition-transform duration-300 ease-in-out"
                style={{ transform: `rotate(${tile.rotation * 90}deg)` }}
            >
                <Pipe type={tile.type} colors={tile.activeColors} />
            </div>

            {/* Маленький индикатор, если через плитку течет вода */}
            {/*{tile.activeColors.length > 0 && (*/}
            {/*    <div className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse"*/}
            {/*         style={{ backgroundColor: tile.activeColors[0] }} />*/}
            {/*)}*/}
        </div>
    );
};

export default memo(Tile);
