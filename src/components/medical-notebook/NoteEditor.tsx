import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Bold, Italic, List, AlignLeft, Hash, Quote, Plus, Type, Video, Maximize2, Minimize2, X, Underline, Highlighter, Code, Palette, Image, Upload, Move, RotateCw, Square, Circle, Minus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";

interface NoteData {
  id: string;
  title: string;
  content: string;
  lastModified: string;
}

interface NoteEditorProps {
  selectedNote: string | null;
  highlightedText: string;
  noteData?: NoteData;
  onNoteUpdate?: (noteId: string, title: string, content: string) => void;
  onOpenYouTubeProcessor?: () => void;
  onPublishNote?: (noteData: { title: string; content: string }) => void;
}

interface NoteEditorRef {
  saveCurrentNote: () => { title: string; content: string } | null;
  insertContent: (content: string) => void;
}

const NoteEditorComponent = forwardRef<NoteEditorRef, NoteEditorProps>(({ selectedNote, highlightedText, noteData, onNoteUpdate, onOpenYouTubeProcessor, onPublishNote }, ref) => {
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageEditMode, setImageEditMode] = useState(false);
  const [draggedImage, setDraggedImage] = useState<HTMLImageElement | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { actualTheme } = useTheme();

  // Generate theme-aware grid background - Notion style
  const getGridBackground = () => {
    if (!settings.showGridBackground) return {};

    // Notion-style grid colors and opacity
    const gridOpacity = actualTheme === 'dark' ? 0.12 : 0.03;
    const majorGridOpacity = actualTheme === 'dark' ? 0.06 : 0.01;
    const gridColor = actualTheme === 'dark' ? '255, 255, 255' : '0, 0, 0';

    return {
      backgroundImage: `
        linear-gradient(rgba(${gridColor}, ${gridOpacity}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(${gridColor}, ${gridOpacity}) 1px, transparent 1px),
        linear-gradient(rgba(${gridColor}, ${majorGridOpacity}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(${gridColor}, ${majorGridOpacity}) 1px, transparent 1px)
      `,
      backgroundSize: `${settings.gridSize}px ${settings.gridSize}px, ${settings.gridSize}px ${settings.gridSize}px, ${settings.gridSize * 5}px ${settings.gridSize * 5}px, ${settings.gridSize * 5}px ${settings.gridSize * 5}px`,
      backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
    };
  };

  // Expose save and insert functions to parent component
  useImperativeHandle(ref, () => ({
    saveCurrentNote: () => {
      if (noteContent.trim() || noteTitle !== "Untitled Note") {
        return {
          title: noteTitle,
          content: noteContent
        };
      }
      return null;
    },
    insertContent: (content: string) => {
      if (editorRef.current) {
        // Check if we're inserting HTML content or plain text
        const isHtmlContent = content.includes('<') && content.includes('>');

        if (isHtmlContent) {
          // Insert HTML content directly
          const separator = noteContent.trim() ? '<br><br>' : '';
          const newContent = noteContent + separator + content;
          setNoteContent(newContent);
          editorRef.current.innerHTML = newContent;
        } else {
          // Insert plain text content
          const separator = noteContent.trim() ? '\n\n' : '';
          const newContent = noteContent + separator + content;
          setNoteContent(newContent);

          // Convert to HTML if needed
          if (newContent.includes('<img') || newContent.includes('<div')) {
            editorRef.current.innerHTML = newContent;
          } else {
            editorRef.current.innerHTML = newContent.replace(/\n/g, '<br>');
          }
        }

        // Re-attach interactive handlers to images
        const images = editorRef.current.querySelectorAll('.note-image');
        images.forEach((img: Element) => {
          const imageElement = img as HTMLImageElement;
          const container = imageElement.parentElement as HTMLDivElement;
          if (container) {
            // Add interactive class and setup handlers
            imageElement.classList.add('interactive-image');
            imageElement.draggable = true;
            setupImageInteractivity(imageElement, container, imageElement.alt);
          }
        });

        // Focus the editor after inserting content
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            // Move cursor to end
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 50);
      }
    }
  }), [noteContent, noteTitle]);

  // Load note data when selectedNote or noteData changes
  useEffect(() => {
    if (noteData) {
      setNoteTitle(noteData.title);
      setNoteContent(noteData.content);
      if (editorRef.current) {
        // Check if content contains HTML (images, formatting)
        if (noteData.content.includes('<img') || noteData.content.includes('<div') || noteData.content.includes('<br>')) {
          // Content already contains HTML, use as-is
          editorRef.current.innerHTML = noteData.content;
        } else {
          // Plain text content, convert line breaks to HTML
          editorRef.current.innerHTML = noteData.content.replace(/\n/g, '<br>');
        }

        // Re-attach interactive handlers to images
        const images = editorRef.current.querySelectorAll('.note-image');
        images.forEach((img: Element) => {
          const imageElement = img as HTMLImageElement;
          const container = imageElement.parentElement as HTMLDivElement;
          if (container) {
            // Add interactive class and setup handlers
            imageElement.classList.add('interactive-image');
            imageElement.draggable = true;
            setupImageInteractivity(imageElement, container, imageElement.alt);
          }
        });
      }
    } else if (selectedNote) {
      // New note - reset to defaults
      setNoteTitle("Untitled Note");
      setNoteContent("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [selectedNote, noteData]);

  // Auto-save functionality and update parent
  useEffect(() => {
    if (!settings.autoSave) return;

    const autoSave = setTimeout(() => {
      if (selectedNote && onNoteUpdate && (noteContent.trim() || noteTitle !== "Untitled Note")) {
        onNoteUpdate(selectedNote, noteTitle, noteContent);
        if (settings.enableNotifications) {
          toast({
            title: "Auto-saved",
            description: "Your note has been automatically saved.",
          });
        }
      }
    }, settings.autoSaveInterval);

    return () => clearTimeout(autoSave);
  }, [noteContent, noteTitle, selectedNote, onNoteUpdate, toast, settings.autoSave, settings.autoSaveInterval, settings.enableNotifications]);

  // Handle content changes in the editor
  const handleEditorInput = () => {
    if (editorRef.current) {
      // Get HTML content to preserve images and formatting
      const htmlContent = editorRef.current.innerHTML;
      setNoteContent(htmlContent);

      // Calculate word count from text content only
      const textContent = editorRef.current.innerText || "";
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  };

  // Note: Highlighted text insertion is now handled by the AI system in PDFViewer
  // The highlightedText prop is kept for potential future use but no longer auto-inserts

  const formatText = (format: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    switch (format) {
      case "bold":
        document.execCommand('bold', false);
        break;
      case "italic":
        document.execCommand('italic', false);
        break;
      case "underline":
        document.execCommand('underline', false);
        break;
      case "heading":
        // Create proper heading with HTML
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString();
          if (selectedText) {
            const heading = document.createElement('h2');
            heading.textContent = selectedText;
            heading.style.fontSize = '1.5em';
            heading.style.fontWeight = '700';
            heading.style.margin = '1.5em 0 0.5em 0';
            heading.style.borderBottom = '1px solid hsl(var(--border))';
            heading.style.paddingBottom = '0.3em';
            range.deleteContents();
            range.insertNode(heading);
          }
        }
        break;
      case "quote":
        // Create proper blockquote
        const quoteSelection = window.getSelection();
        if (quoteSelection && quoteSelection.rangeCount > 0) {
          const range = quoteSelection.getRangeAt(0);
          const selectedText = range.toString();
          if (selectedText) {
            const blockquote = document.createElement('blockquote');
            blockquote.textContent = selectedText;
            blockquote.style.borderLeft = '4px solid hsl(var(--primary))';
            blockquote.style.padding = '0.8em 1.2em';
            blockquote.style.margin = '1.5em 0';
            blockquote.style.fontStyle = 'italic';
            blockquote.style.backgroundColor = 'hsl(var(--muted))';
            blockquote.style.borderRadius = '0 0.5em 0.5em 0';
            range.deleteContents();
            range.insertNode(blockquote);
          }
        }
        break;
      case "list":
        document.execCommand('insertUnorderedList', false);
        break;
      case "highlight-yellow":
        applyHighlight('rgba(255, 255, 0, 0.3)');
        break;
      case "highlight-blue":
        applyHighlight('rgba(0, 0, 255, 0.1)');
        break;
      case "highlight-green":
        applyHighlight('rgba(0, 255, 0, 0.1)');
        break;
      case "code":
        // Create inline code or code block
        const codeSelection = window.getSelection();
        if (codeSelection && codeSelection.rangeCount > 0) {
          const range = codeSelection.getRangeAt(0);
          const selectedText = range.toString();
          if (selectedText) {
            if (selectedText.includes('\n')) {
              // Multi-line: create code block
              const pre = document.createElement('pre');
              pre.textContent = selectedText;
              pre.style.backgroundColor = 'hsl(var(--muted))';
              pre.style.padding = '1em';
              pre.style.borderRadius = '0.5em';
              pre.style.margin = '1.5em 0';
              pre.style.fontFamily = 'monospace';
              pre.style.fontSize = '0.9em';
              pre.style.border = '1px solid hsl(var(--border))';
              range.deleteContents();
              range.insertNode(pre);
            } else {
              // Single line: create inline code
              const code = document.createElement('code');
              code.textContent = selectedText;
              code.style.backgroundColor = 'hsl(var(--muted))';
              code.style.padding = '0.2em 0.4em';
              code.style.borderRadius = '0.3em';
              code.style.fontFamily = 'monospace';
              code.style.fontSize = '0.9em';
              range.deleteContents();
              range.insertNode(code);
            }
          }
        }
        break;
      default:
        break;
    }

    // Update content state
    handleEditorInput();
  };

  const applyHighlight = (color: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      if (selectedText) {
        const span = document.createElement('span');
        span.textContent = selectedText;
        span.style.backgroundColor = color;
        span.style.padding = '0.1em 0.2em';
        span.style.borderRadius = '0.2em';
        range.deleteContents();
        range.insertNode(span);
      }
    }
  };

  const addBlock = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      const newBlock = document.createElement('div');
      newBlock.innerHTML = '<br><strong>New Section</strong><br><br>Type your content here...<br>';
      editorRef.current.appendChild(newBlock);
      handleEditorInput();
    }
  };

  const addSampleContent = () => {
    if (editorRef.current) {
      const sampleContent = `<div>
        <h2><strong>Medical Notes Sample</strong></h2><br>

        <strong>Patient Information</strong><br>
        <strong>Name:</strong> John Doe<br>
        <strong>Age:</strong> 45<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br><br>

        <strong>Chief Complaint</strong><br>
        Patient presents with <em>chest pain</em> and <strong>shortness of breath</strong>.<br><br>

        <strong>History of Present Illness</strong><br>
        • Onset: 2 hours ago<br>
        • Character: Sharp, stabbing pain<br>
        • Location: Left chest<br>
        • Radiation: To left arm<br>
        • Associated symptoms:<br>
        &nbsp;&nbsp;• Nausea<br>
        &nbsp;&nbsp;• Diaphoresis<br>
        &nbsp;&nbsp;• Anxiety<br><br>

        <strong>Assessment</strong><br>
        <em>Possible acute coronary syndrome. Requires immediate evaluation.</em><br><br>

        <strong>Plan</strong><br>
        1. <strong>Immediate:</strong> ECG, cardiac enzymes<br>
        2. <strong>Monitoring:</strong> Continuous cardiac monitoring<br>
        3. <strong>Medications:</strong> Aspirin, nitroglycerin PRN<br>
        4. <strong>Follow-up:</strong> Cardiology consultation<br><br>

        <em>Note: This is a sample medical note demonstrating rich text formatting.</em>
      </div>`;

      editorRef.current.innerHTML = sampleContent;
      handleEditorInput();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Image upload functionality
  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        insertImageIntoEditor(imageDataUrl, file.name);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (PNG, JPG, GIF, etc.).",
        variant: "destructive",
      });
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const insertImageIntoEditor = (imageDataUrl: string, fileName: string) => {
    if (!editorRef.current) return;

    // Create image container for better layout
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.style.position = 'relative';
    imageContainer.style.display = 'inline-block';
    imageContainer.style.margin = '16px 8px';

    // Create image element with interactive features
    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.alt = fileName;
    img.className = 'note-image interactive-image';
    img.title = fileName;
    img.draggable = true;
    img.style.width = '300px';
    img.style.height = 'auto';
    img.style.borderRadius = '8px';
    img.style.cursor = 'pointer';
    img.style.transition = 'all 0.3s ease';
    img.style.border = '2px solid transparent';

    // Add unique ID for tracking
    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    img.id = imageId;

    // Add event handlers for interactive features
    setupImageInteractivity(img, imageContainer, fileName);

    // Create caption element
    const caption = document.createElement('div');
    caption.className = 'image-caption';
    caption.textContent = fileName;
    caption.style.textAlign = 'center';
    caption.style.fontSize = '0.9em';
    caption.style.color = 'hsl(var(--muted-foreground))';
    caption.style.fontStyle = 'italic';
    caption.style.marginTop = '8px';

    // Assemble the image container
    imageContainer.appendChild(img);
    imageContainer.appendChild(caption);

    // Insert image container at cursor position or at the end
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        // Insert at cursor position
        range.deleteContents();

        // Add line breaks for better spacing
        const beforeBr = document.createElement('br');
        const afterBr = document.createElement('br');

        range.insertNode(afterBr);
        range.insertNode(imageContainer);
        range.insertNode(beforeBr);

        // Move cursor after the image
        range.setStartAfter(afterBr);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Insert at the end
        editorRef.current.appendChild(document.createElement('br'));
        editorRef.current.appendChild(imageContainer);
        editorRef.current.appendChild(document.createElement('br'));
      }
    } else {
      // Insert at the end
      editorRef.current.appendChild(document.createElement('br'));
      editorRef.current.appendChild(imageContainer);
      editorRef.current.appendChild(document.createElement('br'));
    }

    // Update note content
    handleEditorInput();

    toast({
      title: "Image added",
      description: `${fileName} has been inserted into your note. Click to select and edit.`,
    });
  };

  const setupImageInteractivity = (img: HTMLImageElement, container: HTMLDivElement, fileName: string) => {
    // Click handler for selection
    img.onclick = (e) => {
      e.stopPropagation();
      selectImage(img);
    };

    // Double-click for preview
    img.ondblclick = (e) => {
      e.stopPropagation();
      openImagePreview(img.src, fileName);
    };

    // Drag handlers
    img.ondragstart = (e) => {
      setDraggedImage(img);
      e.dataTransfer?.setData('text/plain', '');
    };

    img.ondragend = () => {
      setDraggedImage(null);
    };

    // Mouse down for potential resize
    img.onmousedown = (e) => {
      if (selectedImage === img) {
        const rect = img.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking near edges for resize
        const threshold = 10;
        if (x > rect.width - threshold && y > rect.height - threshold) {
          setResizeHandle('se');
          e.preventDefault();
        } else if (x > rect.width - threshold) {
          setResizeHandle('e');
          e.preventDefault();
        } else if (y > rect.height - threshold) {
          setResizeHandle('s');
          e.preventDefault();
        }
      }
    };
  };

  const selectImage = (img: HTMLImageElement) => {
    // Clear previous selection
    if (selectedImage) {
      selectedImage.style.border = '2px solid transparent';
      removeResizeHandles(selectedImage);
    }

    // Select new image
    setSelectedImage(img);
    img.style.border = '2px solid #3b82f6';
    addResizeHandles(img);
    setImageEditMode(true);
  };

  const addResizeHandles = (img: HTMLImageElement) => {
    const container = img.parentElement;
    if (!container) return;

    // Remove existing handles
    removeResizeHandles(img);

    // Create resize handles
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    handles.forEach(position => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-${position}`;
      handle.style.position = 'absolute';
      handle.style.width = '8px';
      handle.style.height = '8px';
      handle.style.backgroundColor = '#3b82f6';
      handle.style.border = '1px solid white';
      handle.style.borderRadius = '50%';
      handle.style.cursor = `${position}-resize`;
      handle.style.zIndex = '1000';

      // Position the handle
      switch (position) {
        case 'nw':
          handle.style.top = '-4px';
          handle.style.left = '-4px';
          break;
        case 'ne':
          handle.style.top = '-4px';
          handle.style.right = '-4px';
          break;
        case 'sw':
          handle.style.bottom = '20px';
          handle.style.left = '-4px';
          break;
        case 'se':
          handle.style.bottom = '20px';
          handle.style.right = '-4px';
          break;
        case 'n':
          handle.style.top = '-4px';
          handle.style.left = '50%';
          handle.style.transform = 'translateX(-50%)';
          break;
        case 's':
          handle.style.bottom = '20px';
          handle.style.left = '50%';
          handle.style.transform = 'translateX(-50%)';
          break;
        case 'e':
          handle.style.right = '-4px';
          handle.style.top = '50%';
          handle.style.transform = 'translateY(-50%)';
          break;
        case 'w':
          handle.style.left = '-4px';
          handle.style.top = '50%';
          handle.style.transform = 'translateY(-50%)';
          break;
      }

      // Add resize functionality
      handle.onmousedown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        startResize(img, position, e);
      };

      container.appendChild(handle);
    });
  };

  const removeResizeHandles = (img: HTMLImageElement) => {
    const container = img.parentElement;
    if (!container) return;

    const handles = container.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
  };

  const startResize = (img: HTMLImageElement, direction: string, e: MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const aspectRatio = startWidth / startHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (direction) {
        case 'se':
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'sw':
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'ne':
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'nw':
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'e':
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'w':
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 's':
          newHeight = Math.max(50, startHeight + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'n':
          newHeight = Math.max(50, startHeight - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
      }

      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      handleEditorInput();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const openImagePreview = (imageDataUrl: string, fileName: string) => {
    // Create a modal overlay for image preview
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.alt = fileName;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';

    overlay.appendChild(img);
    overlay.onclick = () => document.body.removeChild(overlay);

    document.body.appendChild(overlay);
  };

  // Image transformation functions
  const changeImageShape = (shape: 'rectangle' | 'circle' | 'rounded') => {
    if (!selectedImage) return;

    switch (shape) {
      case 'rectangle':
        selectedImage.style.borderRadius = '0px';
        break;
      case 'circle':
        selectedImage.style.borderRadius = '50%';
        selectedImage.style.aspectRatio = '1';
        selectedImage.style.objectFit = 'cover';
        break;
      case 'rounded':
        selectedImage.style.borderRadius = '12px';
        break;
    }
    handleEditorInput();
  };

  const rotateImage = () => {
    if (!selectedImage) return;

    const currentRotation = selectedImage.style.transform.match(/rotate\((\d+)deg\)/);
    const rotation = currentRotation ? parseInt(currentRotation[1]) + 90 : 90;
    selectedImage.style.transform = `rotate(${rotation}deg)`;
    handleEditorInput();
  };

  const deleteSelectedImage = () => {
    if (!selectedImage) return;

    const container = selectedImage.parentElement;
    if (container) {
      container.remove();
      setSelectedImage(null);
      setImageEditMode(false);
      handleEditorInput();
      toast({
        title: "Image deleted",
        description: "The selected image has been removed from your note.",
      });
    }
  };

  const duplicateSelectedImage = () => {
    if (!selectedImage) return;

    const container = selectedImage.parentElement;
    if (container) {
      const clone = container.cloneNode(true) as HTMLDivElement;
      const clonedImg = clone.querySelector('img') as HTMLImageElement;

      // Update ID and setup interactivity
      const newId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      clonedImg.id = newId;
      setupImageInteractivity(clonedImg, clone, clonedImg.alt);

      // Insert after current container
      container.parentNode?.insertBefore(clone, container.nextSibling);
      handleEditorInput();

      toast({
        title: "Image duplicated",
        description: "A copy of the image has been created.",
      });
    }
  };

  // Click outside to deselect image
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedImage && !selectedImage.contains(e.target as Node)) {
        selectedImage.style.border = '2px solid transparent';
        removeResizeHandles(selectedImage);
        setSelectedImage(null);
        setImageEditMode(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedImage]);

  // Keyboard shortcuts for image editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage || !imageEditMode) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelectedImage();
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            rotateImage();
          }
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            duplicateSelectedImage();
          }
          break;
        case 'Escape':
          if (selectedImage) {
            selectedImage.style.border = '2px solid transparent';
            removeResizeHandles(selectedImage);
            setSelectedImage(null);
            setImageEditMode(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, imageEditMode]);

  // Drag and drop functionality for repositioning images
  useEffect(() => {
    if (!editorRef.current) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!draggedImage || !editorRef.current) return;

      const rect = editorRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // Find the closest element to insert before
      const afterElement = getDragAfterElement(editorRef.current, y);
      const draggedContainer = draggedImage.parentElement;

      if (draggedContainer) {
        if (afterElement == null) {
          editorRef.current.appendChild(draggedContainer);
        } else {
          editorRef.current.insertBefore(draggedContainer, afterElement);
        }
        handleEditorInput();
      }
    };

    const getDragAfterElement = (container: HTMLElement, y: number) => {
      const draggableElements = [...container.querySelectorAll('.image-container:not(.dragging)')];

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY, element: null as Element | null }).element;
    };

    editorRef.current.addEventListener('dragover', handleDragOver);
    editorRef.current.addEventListener('drop', handleDrop);

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('dragover', handleDragOver);
        editorRef.current.removeEventListener('drop', handleDrop);
      }
    };
  }, [draggedImage]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex flex-col bg-background overflow-hidden transition-all duration-300`}>
      {/* Enhanced Note Header */}
      <div className="h-20 md:h-20 border-b border-border/60 flex items-center px-4 md:px-8 flex-shrink-0 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-md">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="text-xl md:text-2xl font-bold bg-transparent border-0 outline-none text-foreground w-full hover:bg-muted/10 rounded-lg px-2 md:px-3 py-1 md:py-2 transition-all duration-200 focus:bg-muted/20 focus:ring-2 focus:ring-primary/20"
            placeholder="Untitled Note"
          />
          <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground px-2 md:px-3 mt-1 overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${selectedNote ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="font-medium">{selectedNote ? "Saved" : "New note"}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-mono text-xs bg-muted/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded">{wordCount}</span>
              <span className="hidden sm:inline">words</span>
              <span className="sm:hidden">w</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-mono text-xs bg-muted/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded">{noteContent.length}</span>
              <span className="hidden sm:inline">characters</span>
              <span className="sm:hidden">c</span>
            </div>
            {noteData?.lastModified && (
              <span className="text-xs hidden md:inline flex-shrink-0">Last edited {new Date(noteData.lastModified).toLocaleTimeString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-muted/60 transition-all duration-200 hover:scale-105"
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3 md:h-4 md:w-4" /> : <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />}
          </Button>
          {isFullscreen && (
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Formatting Toolbar */}
      <div className="h-14 md:h-16 border-b border-border/60 flex items-center px-4 md:px-8 gap-2 md:gap-4 flex-shrink-0 bg-gradient-to-r from-muted/20 to-muted/10 backdrop-blur-sm overflow-x-auto">
        {/* Text Formatting Group */}
        <div className="flex items-center gap-0.5 md:gap-1 bg-background/80 rounded-xl p-1 md:p-1.5 shadow-sm border border-border/40 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("bold")}
            title="Bold (Ctrl+B)"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
          >
            <Bold className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("italic")}
            title="Italic (Ctrl+I)"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
          >
            <Italic className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("underline")}
            title="Underline (Ctrl+U)"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
          >
            <Underline className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>

        <div className="h-6 md:h-8 w-px bg-border/40 flex-shrink-0" />

        {/* Structure Formatting Group */}
        <div className="flex items-center gap-0.5 md:gap-1 bg-background/80 rounded-xl p-1 md:p-1.5 shadow-sm border border-border/40 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("heading")}
            title="Heading"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-secondary/60 hover:text-secondary-foreground transition-all duration-200 hover:scale-105"
          >
            <Hash className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("quote")}
            title="Quote"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-secondary/60 hover:text-secondary-foreground transition-all duration-200 hover:scale-105"
          >
            <Quote className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("list")}
            title="Bullet List"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-secondary/60 hover:text-secondary-foreground transition-all duration-200 hover:scale-105"
          >
            <List className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("code")}
            title="Code Block"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-secondary/60 hover:text-secondary-foreground transition-all duration-200 hover:scale-105"
          >
            <Code className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>

        <div className="h-6 md:h-8 w-px bg-border/40 flex-shrink-0 hidden sm:block" />

        {/* Highlight Group - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-0.5 md:gap-1 bg-background/80 rounded-xl p-1 md:p-1.5 shadow-sm border border-border/40 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("highlight-yellow")}
            title="Yellow Highlight"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-yellow-100 hover:text-yellow-700 transition-all duration-200 hover:scale-105"
          >
            <Highlighter className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("highlight-blue")}
            title="Blue Highlight"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-105"
          >
            <div className="h-3 w-3 md:h-4 md:w-4 bg-blue-400 rounded-sm" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => formatText("highlight-green")}
            title="Green Highlight"
            className="h-7 w-7 md:h-9 md:w-9 p-0 hover:bg-green-100 hover:text-green-700 transition-all duration-200 hover:scale-105"
          >
            <div className="h-3 w-3 md:h-4 md:w-4 bg-green-400 rounded-sm" />
          </Button>
        </div>

        <div className="h-8 w-px bg-border/40" />

        {/* Content Actions Group */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={addBlock}
            title="Add new section"
            className="gap-2 bg-background/60 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 border-border/60"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Block</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={addSampleContent}
            title="Add sample medical note"
            className="gap-2 bg-background/60 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 border-border/60"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Sample</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleImageUpload}
            title="Insert image"
            className="gap-2 bg-blue-50/80 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-105"
          >
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Image</span>
          </Button>

          {/* Image Editing Tools - Show when image is selected */}
          {imageEditMode && selectedImage && (
            <>
              <div className="h-8 w-px bg-border/40" />
              <div className="flex items-center gap-1 bg-blue-50/50 rounded-lg p-1 border border-blue-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => changeImageShape('rectangle')}
                  title="Rectangle shape"
                  className="h-7 w-7 p-0 hover:bg-blue-100"
                >
                  <Square className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => changeImageShape('rounded')}
                  title="Rounded corners"
                  className="h-7 w-7 p-0 hover:bg-blue-100"
                >
                  <div className="h-3 w-3 border border-current rounded-md" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => changeImageShape('circle')}
                  title="Circle shape"
                  className="h-7 w-7 p-0 hover:bg-blue-100"
                >
                  <Circle className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={rotateImage}
                  title="Rotate 90°"
                  className="h-7 w-7 p-0 hover:bg-blue-100"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={duplicateSelectedImage}
                  title="Duplicate image (Ctrl+D)"
                  className="h-7 w-7 p-0 hover:bg-blue-100"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={deleteSelectedImage}
                  title="Delete image (Delete)"
                  className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}

          {onOpenYouTubeProcessor && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenYouTubeProcessor}
              title="Analyze YouTube medical videos"
              className="gap-2 bg-red-50/80 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 transition-all duration-200 hover:scale-105"
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">YouTube</span>
            </Button>
          )}

          {onPublishNote && noteContent.trim() && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPublishNote({ title: noteTitle, content: noteContent })}
              title="Publish this note to Knowledge Bank"
              className="gap-2 bg-green-50/80 hover:bg-green-100 text-green-600 border-green-200 hover:border-green-300 transition-all duration-200 hover:scale-105"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          )}
        </div>

        <div className="flex-1" />

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          {settings.autoSave && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50/80 px-3 py-1.5 rounded-full border border-green-200/60">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Auto-save</span>
            </div>
          )}
        </div>
      </div>

      {/* Note Content Area */}
      <div className="flex-1 overflow-hidden relative" style={{ height: 'calc(100vh - 180px)' }}>
        {selectedNote ? (
          <div
            className="relative h-full flex flex-col overflow-hidden"
            style={getGridBackground()}
          >
            {/* Content Container with Enhanced Styling */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-8">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className="note-editor w-full min-h-full leading-relaxed bg-transparent border-none shadow-none focus:outline-none focus:ring-2 focus:ring-primary/10 focus:ring-offset-2 md:focus:ring-offset-4 rounded-lg transition-all duration-200"
                  style={{
                    background: 'transparent',
                    fontSize: `${Math.max(settings.fontSize - 2, 14)}px`, // Smaller on mobile
                    fontFamily: settings.fontFamily,
                    lineHeight: '1.7',
                    whiteSpace: settings.enableWordWrap ? 'pre-wrap' : 'pre',
                    minHeight: 'calc(100vh - 250px)'
                  }}
                  spellCheck={settings.enableSpellCheck}
                  data-placeholder="✨ Start writing your medical notes here...

📝 Quick Tips:
• Highlight text in the PDF to add it here automatically
• Use AI to summarize or explain complex concepts
• Try the formatting toolbar above for rich text styling
• Create organized blocks for better structure
• Your work is auto-saved as you type

💡 Pro tip: Use Ctrl+B for bold, Ctrl+I for italic, and the toolbar for more options!"
                />
              </div>
            </div>

            {/* Subtle Writing Guide Overlay */}
            <div className="absolute bottom-4 right-4 opacity-60 hover:opacity-100 transition-opacity duration-200">
              <div className="bg-background/90 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>Focus mode active</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full text-center p-8 overflow-y-auto"
            style={getGridBackground()}
          >
            <div className="max-w-lg mx-auto">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-6 mb-6 inline-block">
                <Type className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Take Notes?</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Select a note from the sidebar or create a new one to start documenting your medical studies.
                Your notes will be automatically saved and synced.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-card/50 border border-border/60 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-foreground mb-2">✨ Smart Features</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Auto-save as you type</li>
                    <li>• Rich text formatting</li>
                    <li>• PDF text integration</li>
                  </ul>
                </div>
                <div className="bg-card/50 border border-border/60 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-foreground mb-2">🚀 Quick Actions</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Ctrl+B for bold</li>
                    <li>• Ctrl+I for italic</li>
                    <li>• Use toolbar for more</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
});

NoteEditorComponent.displayName = "NoteEditor";

export const NoteEditor = NoteEditorComponent;
