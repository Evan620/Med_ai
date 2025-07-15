import { useState } from "react";
import { FileText, ZoomIn, ZoomOut, RotateCcw, Sparkles, BookOpen, Plus, Loader2, X, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { aiService } from "@/services/aiService";

interface PDFViewerProps {
  selectedPDF: string | null;
  onTextHighlight: (text: string) => void;
  onAIActionRequest: () => void;
  onInsertToNote?: (content: string) => void;
  pdfFile?: File;
}

export const PDFViewer = ({ selectedPDF, onTextHighlight, onAIActionRequest, onInsertToNote, pdfFile }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [showHighlightActions, setShowHighlightActions] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiActionType, setAiActionType] = useState<'summarize' | 'explain' | null>(null);
  const { toast } = useToast();
  const { actualTheme } = useTheme();
  const { settings } = useSettings();



  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedText(text);
      setShowHighlightActions(true);
      setAiResponse(""); // Clear previous AI response
      setAiActionType(null);
      onTextHighlight(text);
    } else {
      setShowHighlightActions(false);
      setSelectedText("");
      setAiResponse("");
      setAiActionType(null);
    }
  };

  // Process text with AI using OpenRouter API
  const processWithAI = async (text: string, action: 'summarize' | 'explain') => {
    setIsProcessingAI(true);
    setAiActionType(action);

    try {
      let result;

      if (action === 'summarize') {
        result = await aiService.summarizeText(text);
      } else {
        result = await aiService.explainConcept(text);
      }

      if (result.success) {
        setAiResponse(result.content);
        toast({
          title: `Dr. Mitchell's ${action === 'summarize' ? 'Summary' : 'Explanation'} Ready`,
          description: "Professional medical analysis completed. Click 'Insert to Note' to add to your notes.",
        });
      } else {
        setAiResponse(`**Error:** ${result.error || 'Failed to get AI response. Please try again.'}`);
        toast({
          title: "AI Service Error",
          description: "There was an issue connecting to the AI service. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI processing error:', error);
      setAiResponse("**Error:** Unable to process request. Please try again.");
      toast({
        title: "AI Processing Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSummarize = () => {
    processWithAI(selectedText, 'summarize');
  };

  const handleExplain = () => {
    processWithAI(selectedText, 'explain');
  };

  const handleInsertToNote = () => {
    if (aiResponse && onInsertToNote) {
      console.log('Inserting content to note:', aiResponse); // Debug log
      onInsertToNote(aiResponse);
      setShowHighlightActions(false);
      setSelectedText("");
      setAiResponse("");
      setAiActionType(null);
      toast({
        title: "Content Inserted",
        description: "AI-generated content has been added to your note.",
      });
    } else {
      console.log('Insert failed - aiResponse:', !!aiResponse, 'onInsertToNote:', !!onInsertToNote); // Debug log
      toast({
        title: "Insert Failed",
        description: "No content to insert or note not available.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-pdf-bg overflow-hidden">
      {/* PDF Toolbar */}
      <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4 flex-shrink-0">
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
      <div className="flex-1 overflow-y-auto overflow-x-auto p-4 relative" style={{ height: 'calc(100vh - 112px)' }}>
        {selectedPDF ? (
          <div
            className="rounded-lg shadow-sm p-8 notion-container bg-card text-card-foreground"
            onMouseUp={handleTextSelection}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              minHeight: 'fit-content',
              width: `${100 / (zoom / 100)}%`
            }}
          >
            {/* Sample PDF content */}
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold mb-6 text-foreground">Chapter 4: Cardiovascular System</h1>

              <div className="space-y-4 leading-relaxed text-muted-foreground">
                <p>
                  The cardiovascular system consists of the heart, blood vessels, and blood. This intricate network
                  is responsible for transporting oxygen, nutrients, hormones, and waste products throughout the body.
                  The heart serves as the central pump, while the blood vessels form an extensive network of tubes
                  that carry blood to and from every cell in the body.
                </p>
                
                <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Heart Anatomy</h2>
                <p>
                  The heart is a muscular organ approximately the size of a fist, located in the mediastinum
                  between the lungs. It consists of four chambers: two atria (upper chambers) and two ventricles
                  (lower chambers). The right side of the heart pumps deoxygenated blood to the lungs, while
                  the left side pumps oxygenated blood to the rest of the body.
                </p>
                
                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Cardiac Chambers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right Atrium:</strong> Receives deoxygenated blood from the body via the superior and inferior vena cavae.</li>
                  <li><strong>Right Ventricle:</strong> Pumps blood to the lungs through the pulmonary trunk.</li>
                  <li><strong>Left Atrium:</strong> Receives oxygenated blood from the lungs via the pulmonary veins.</li>
                  <li><strong>Left Ventricle:</strong> Pumps oxygenated blood to the body through the aorta.</li>
                </ul>
                
                <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Blood Circulation</h2>
                <p>
                  Blood circulation follows two main pathways: pulmonary circulation (between heart and lungs)
                  and systemic circulation (between heart and rest of the body). The cardiac cycle consists of
                  two phases: systole (contraction) and diastole (relaxation).
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Pulmonary Circulation</h3>
                <p>
                  Pulmonary circulation is the portion of the cardiovascular system that carries deoxygenated blood
                  away from the heart to the lungs and returns oxygenated blood back to the heart. This process
                  begins when the right ventricle contracts, pushing blood through the pulmonary valve into the
                  pulmonary trunk, which then divides into the left and right pulmonary arteries.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Systemic Circulation</h3>
                <p>
                  Systemic circulation carries oxygenated blood from the left ventricle through the aorta to all
                  parts of the body, and returns deoxygenated blood to the right atrium via the venous system.
                  The left ventricle is the most muscular chamber of the heart, as it must generate enough pressure
                  to pump blood throughout the entire body.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Heart Valves</h2>
                <p>
                  The heart contains four valves that ensure unidirectional blood flow. These valves open and close
                  in coordination with the cardiac cycle to prevent backflow of blood.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Atrioventricular Valves</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Tricuspid Valve:</strong> Located between the right atrium and right ventricle, consists of three cusps.</li>
                  <li><strong>Mitral (Bicuspid) Valve:</strong> Located between the left atrium and left ventricle, consists of two cusps.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Semilunar Valves</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Pulmonary Valve:</strong> Located between the right ventricle and pulmonary trunk.</li>
                  <li><strong>Aortic Valve:</strong> Located between the left ventricle and aorta.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Cardiac Conduction System</h2>
                <p>
                  The heart has its own electrical conduction system that initiates and coordinates the heartbeat.
                  This intrinsic system allows the heart to beat independently of nervous system control, though
                  it can be modulated by autonomic nervous system input.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Components of the Conduction System</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Sinoatrial (SA) Node:</strong> The natural pacemaker of the heart, located in the right atrium.</li>
                  <li><strong>Atrioventricular (AV) Node:</strong> Located at the junction between atria and ventricles, delays impulse transmission.</li>
                  <li><strong>Bundle of His:</strong> Conducts impulses from the AV node to the ventricles.</li>
                  <li><strong>Purkinje Fibers:</strong> Distribute electrical impulses throughout the ventricular myocardium.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Blood Pressure Regulation</h2>
                <p>
                  Blood pressure is the force exerted by circulating blood against the walls of blood vessels.
                  It is regulated by multiple mechanisms including cardiac output, peripheral resistance, and
                  blood volume. Normal blood pressure is typically around 120/80 mmHg.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Factors Affecting Blood Pressure</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Cardiac Output:</strong> The volume of blood pumped by the heart per minute.</li>
                  <li><strong>Peripheral Resistance:</strong> The resistance to blood flow in the peripheral circulation.</li>
                  <li><strong>Blood Volume:</strong> The total amount of blood in the circulatory system.</li>
                  <li><strong>Vessel Elasticity:</strong> The ability of blood vessels to expand and contract.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Common Cardiovascular Disorders</h2>
                <p>
                  Cardiovascular diseases are among the leading causes of morbidity and mortality worldwide.
                  Understanding these conditions is crucial for medical professionals in diagnosis, treatment,
                  and prevention strategies.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Coronary Artery Disease</h3>
                <p>
                  Coronary artery disease (CAD) occurs when the coronary arteries become narrowed or blocked
                  due to atherosclerotic plaque buildup. This can lead to reduced blood flow to the myocardium,
                  potentially causing angina, myocardial infarction, or sudden cardiac death.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Heart Failure</h3>
                <p>
                  Heart failure is a condition where the heart cannot pump blood effectively to meet the body's
                  metabolic demands. It can be classified as systolic (reduced ejection fraction) or diastolic
                  (preserved ejection fraction) heart failure.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Arrhythmias</h3>
                <p>
                  Arrhythmias are abnormal heart rhythms that can range from benign to life-threatening.
                  They can be classified as bradyarrhythmias (slow heart rate) or tachyarrhythmias (fast heart rate),
                  and may originate from the atria, ventricles, or conduction system.
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
          <div className="fixed bg-card border border-border rounded-lg shadow-lg p-4 animate-scale-in z-50 max-w-md"
               style={{
                 top: '50%',
                 left: '25%',
                 transform: 'translate(-50%, -50%)'
               }}>

            {/* Selected Text */}
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Selected text:</p>
              <p className="text-sm bg-muted p-2 rounded text-foreground italic">
                "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
              </p>
            </div>

            {/* AI Action Buttons */}
            {!aiResponse && !isProcessingAI && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Ask Dr. Mitchell:</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <Button size="sm" onClick={handleSummarize} className="flex-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Summarize
                  </Button>
                  <Button size="sm" onClick={handleExplain} className="flex-1">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Explain More
                  </Button>
                </div>
              </>
            )}

            {/* AI Processing State */}
            {isProcessingAI && (
              <div className="flex items-center justify-center py-4 mb-3">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  AI is {aiActionType === 'summarize' ? 'summarizing' : 'explaining'}...
                </span>
              </div>
            )}

            {/* AI Response */}
            {aiResponse && (
              <div className="mb-3">
                <div className="bg-muted p-3 rounded text-sm text-foreground max-h-40 overflow-y-auto">
                  {aiResponse.split('\n').map((line, index) => (
                    <div key={index} className="mb-1">
                      {line.startsWith('**') && line.endsWith('**') ? (
                        <strong>{line.slice(2, -2)}</strong>
                      ) : line.startsWith('• ') ? (
                        <div className="ml-2">• {line.slice(2)}</div>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>

                {/* Insert to Note Button */}
                <Button
                  onClick={handleInsertToNote}
                  className="w-full mt-2"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Insert to Note
                </Button>
              </div>
            )}

            {/* Cancel Button */}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowHighlightActions(false)}
              >
                <X className="h-3 w-3 mr-1" />
                Close
              </Button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};