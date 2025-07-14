import { useState } from "react";
import { FileText, ZoomIn, ZoomOut, RotateCcw, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PDFViewerProps {
  selectedPDF: string | null;
  onTextHighlight: (text: string) => void;
  onAIActionRequest: () => void;
}

export const PDFViewer = ({ selectedPDF, onTextHighlight, onAIActionRequest }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [showHighlightActions, setShowHighlightActions] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const { toast } = useToast();

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedText(text);
      onTextHighlight(text);
      setShowHighlightActions(true);
    }
  };

  const handleSummarize = () => {
    toast({
      title: "AI Summarization",
      description: "Summarizing selected text...",
    });
    onAIActionRequest();
    setShowHighlightActions(false);
  };

  const handleExplain = () => {
    toast({
      title: "AI Explanation",
      description: "Generating detailed explanation...",
    });
    onAIActionRequest();
    setShowHighlightActions(false);
  };

  return (
    <div className="h-full flex flex-col bg-pdf-bg">
      {/* PDF Toolbar */}
      <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {selectedPDF ? "Medical Textbook.pdf" : "No PDF selected"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(50, zoom - 25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {zoom}%
          </span>
          <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(200, zoom + 25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-4 relative">
        {selectedPDF ? (
          <div 
            className="bg-white rounded-lg shadow-sm p-8 notion-container min-h-full"
            onMouseUp={handleTextSelection}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          >
            {/* Sample PDF content */}
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Chapter 4: Cardiovascular System</h1>
              
              <div className="space-y-4 text-gray-800 leading-relaxed">
                <p>
                  The cardiovascular system consists of the heart, blood vessels, and blood. This intricate network
                  is responsible for transporting oxygen, nutrients, hormones, and waste products throughout the body.
                  The heart serves as the central pump, while the blood vessels form an extensive network of tubes
                  that carry blood to and from every cell in the body.
                </p>
                
                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Heart Anatomy</h2>
                <p>
                  The heart is a muscular organ approximately the size of a fist, located in the mediastinum
                  between the lungs. It consists of four chambers: two atria (upper chambers) and two ventricles
                  (lower chambers). The right side of the heart pumps deoxygenated blood to the lungs, while
                  the left side pumps oxygenated blood to the rest of the body.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Cardiac Chambers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right Atrium:</strong> Receives deoxygenated blood from the body via the superior and inferior vena cavae.</li>
                  <li><strong>Right Ventricle:</strong> Pumps blood to the lungs through the pulmonary trunk.</li>
                  <li><strong>Left Atrium:</strong> Receives oxygenated blood from the lungs via the pulmonary veins.</li>
                  <li><strong>Left Ventricle:</strong> Pumps oxygenated blood to the body through the aorta.</li>
                </ul>
                
                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Blood Circulation</h2>
                <p>
                  Blood circulation follows two main pathways: pulmonary circulation (between heart and lungs)
                  and systemic circulation (between heart and rest of the body). The cardiac cycle consists of
                  two phases: systole (contraction) and diastole (relaxation).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No PDF Selected</h3>
            <p className="text-muted-foreground max-w-md">
              Select a PDF from the sidebar to start viewing and taking notes. You can highlight text and use AI features.
            </p>
          </div>
        )}

        {/* Highlight Actions Popup */}
        {showHighlightActions && (
          <div className="fixed bg-white border border-border rounded-lg shadow-lg p-2 flex gap-2 animate-scale-in z-50"
               style={{ 
                 top: '50%', 
                 left: '25%', 
                 transform: 'translate(-50%, -50%)' 
               }}>
            <Button size="sm" onClick={handleSummarize} className="ai-action-btn">
              <Sparkles className="h-3 w-3 mr-1" />
              Summarize
            </Button>
            <Button size="sm" onClick={handleExplain} className="ai-action-btn">
              <BookOpen className="h-3 w-3 mr-1" />
              Explain More
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowHighlightActions(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};