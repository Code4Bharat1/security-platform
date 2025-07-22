import { runJSAnalysis } from "../../../analyzer/jsScanner";
import AnalysisForm from "@/components/codeAnalysis/codeAnalysis";

export default function Home() {
 
  return (
    <AnalysisForm/>
  );
}
// <AnalysisResult issues={issues} />