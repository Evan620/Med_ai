import { useState } from "react";
import { Sidebar } from "@/components/medical-notebook/Sidebar";
import { PDFViewer } from "@/components/medical-notebook/PDFViewer";
import { NoteEditor } from "@/components/medical-notebook/NoteEditor";
import { AIPanel } from "@/components/medical-notebook/AIPanel";
import { Header } from "@/components/medical-notebook/Header";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
  const [aiPanelVisible, setAiPanelVisible] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string>("");

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for notes and PDFs */}
        <Sidebar 
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          selectedPDF={selectedPDF}
          onSelectPDF={setSelectedPDF}
        />
        
        {/* Main content area with split view */}
        <div className="flex-1 flex">
          {/* PDF Viewer */}
          <div className="w-1/2 border-r border-border">
            <PDFViewer 
              selectedPDF={selectedPDF}
              onTextHighlight={setHighlightedText}
              onAIActionRequest={() => setAiPanelVisible(true)}
            />
          </div>
          
          {/* Note Editor */}
          <div className="w-1/2 flex flex-col">
            <NoteEditor 
              selectedNote={selectedNote}
              highlightedText={highlightedText}
            />
            
            {/* AI Panel */}
            {aiPanelVisible && (
              <AIPanel 
                highlightedText={highlightedText}
                onClose={() => setAiPanelVisible(false)}
                onInsertToNote={(content) => {
                  // This will be handled by the note editor
                  console.log("Insert to note:", content);
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
