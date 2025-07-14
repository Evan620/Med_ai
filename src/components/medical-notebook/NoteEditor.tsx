import { useState, useRef, useEffect } from "react";
import { Bold, Italic, List, AlignLeft, Hash, Quote, Plus, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface NoteEditorProps {
  selectedNote: string | null;
  highlightedText: string;
}

export const NoteEditor = ({ selectedNote, highlightedText }: NoteEditorProps) => {
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (noteContent.trim()) {
        toast({
          title: "Auto-saved",
          description: "Your note has been automatically saved.",
        });
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [noteContent, toast]);

  // Insert highlighted text when it changes
  useEffect(() => {
    if (highlightedText && textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBefore = noteContent.substring(0, cursorPosition);
      const textAfter = noteContent.substring(cursorPosition);
      const newContent = `${textBefore}\n\n**Highlighted Text:**\n> ${highlightedText}\n\n${textAfter}`;
      setNoteContent(newContent);
    }
  }, [highlightedText, noteContent]);

  const formatText = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteContent.substring(start, end);
    
    let replacement = "";
    
    switch (format) {
      case "bold":
        replacement = `**${selectedText}**`;
        break;
      case "italic":
        replacement = `*${selectedText}*`;
        break;
      case "heading":
        replacement = `# ${selectedText}`;
        break;
      case "quote":
        replacement = `> ${selectedText}`;
        break;
      case "list":
        replacement = `- ${selectedText}`;
        break;
      default:
        replacement = selectedText;
    }
    
    const newContent = noteContent.substring(0, start) + replacement + noteContent.substring(end);
    setNoteContent(newContent);
  };

  const addBlock = () => {
    const newBlock = "\n\n## New Section\n\nType your content here...\n";
    setNoteContent(noteContent + newBlock);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Note Header */}
      <div className="h-16 border-b border-border flex items-center px-6">
        <div className="flex-1">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="text-xl font-semibold bg-transparent border-0 outline-none text-foreground w-full"
            placeholder="Note title..."
          />
          <p className="text-sm text-muted-foreground">
            {selectedNote ? "Last edited 2 minutes ago" : "New note"}
          </p>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="h-12 border-b border-border flex items-center px-6 gap-2">
        <Button size="sm" variant="ghost" onClick={() => formatText("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("heading")}>
          <Hash className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("quote")}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("list")}>
          <List className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        <Button size="sm" variant="ghost" onClick={addBlock}>
          <Plus className="h-4 w-4 mr-1" />
          Block
        </Button>
      </div>

      {/* Note Content Area */}
      <div className="flex-1 overflow-auto">
        {selectedNote ? (
          <div className="p-6">
            <Textarea
              ref={textareaRef}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start writing your medical notes here...

You can:
• Highlight text in the PDF to add it here
• Use AI to summarize or explain concepts
• Format your text with the toolbar above
• Create blocks for better organization"
              className="note-editor min-h-[600px] text-base leading-relaxed resize-none"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Type className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Note Selected</h3>
            <p className="text-muted-foreground max-w-md">
              Select a note from the sidebar or create a new one to start taking notes. Your notes will be automatically saved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};