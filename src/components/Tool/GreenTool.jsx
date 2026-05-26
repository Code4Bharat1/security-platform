'use client';

import ToolLayout from "./Layout";
import { greenTools } from "./catalog";
export default function GreenTool() {
    return (<ToolLayout team="green" toolList={greenTools}></ToolLayout>)
}
