'use client';

import ToolLayout from "./Layout";
import { blueTools } from "./catalog";
export default function BlueTool() {
    return( <div className="relative w-full h-full">
            <ToolLayout team="blue" toolList={blueTools} />
        </div>
    );
}
