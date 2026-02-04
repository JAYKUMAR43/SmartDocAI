"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { API_URL } from '@/app/services/api';

// Set worker source - Version 5.4.530
const PDFJS_VERSION = '5.4.530';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

interface PageState {
    canvas: fabric.Canvas | null;
    id: number;
    viewport: pdfjsLib.PageViewport;
    rotation: number;
}

const ToolbarButton = ({ active, onClick, icon, label, children }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, children?: React.ReactNode }) => (
    <div className="flex flex-col items-center">
        <button
            onClick={onClick}
            className={`h-12 w-12 flex flex-col items-center justify-center rounded-lg transition-all border ${active ? 'bg-white border-gray-300 shadow-inner' : 'bg-transparent border-transparent hover:bg-gray-200'}`}
        >
            {icon}
        </button>
        <span className={`text-[10px] font-bold uppercase mt-1 tracking-tighter ${active ? 'text-blue-600' : 'text-gray-500'}`}>{label}</span>
        {children}
    </div>
);

const FormattingToolbar = ({ selectedText, fontFamily, fontSize, fontWeight, fontStyle, underline, textAlign, updateTextStyle }: any) => (
    <div className="h-12 bg-white border-b border-gray-300 px-6 flex items-center gap-4 z-20 shrink-0 shadow-sm">
        {/* Font Family */}
        <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 ml-1">Font</span>
            <select
                value={fontFamily}
                onChange={(e) => updateTextStyle('fontFamily', e.target.value)}
                className="h-8 border border-gray-300 rounded px-2 text-[13px] bg-white text-gray-800 font-medium focus:ring-1 focus:ring-blue-500 outline-none hover:border-gray-400 transition-colors shadow-sm"
            >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
            </select>
        </div>

        {/* Font Size */}
        <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 ml-1">Size</span>
            <input
                type="number"
                value={fontSize}
                onChange={(e) => updateTextStyle('fontSize', e.target.value)}
                className="w-16 h-8 border border-gray-300 rounded px-2 text-[13px] bg-white text-gray-800 font-medium outline-none hover:border-gray-400 transition-colors shadow-sm"
            />
        </div>

        <div className="h-10 w-[1px] bg-gray-200" />

        {/* Styles */}
        <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 ml-1">Format</span>
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                <button
                    onClick={() => updateTextStyle('fontWeight', fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm transition-all ${fontWeight === 'bold' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                    title="Bold"
                >
                    B
                </button>
                <button
                    onClick={() => updateTextStyle('fontStyle', fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`w-8 h-8 rounded-md flex items-center justify-center italic text-sm transition-all ${fontStyle === 'italic' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                    title="Italic"
                >
                    I
                </button>
                <button
                    onClick={() => updateTextStyle('underline', !underline)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center underline text-sm transition-all ${underline ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                    title="Underline"
                >
                    U
                </button>
            </div>
        </div>

        <div className="h-10 w-[1px] bg-gray-200" />

        {/* Alignment */}
        <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 ml-1">Align</span>
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                <button
                    onClick={() => updateTextStyle('textAlign', 'left')}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${textAlign === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" /></svg>
                </button>
                <button
                    onClick={() => updateTextStyle('textAlign', 'center')}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${textAlign === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm4 4h10v2H7V7zm-4 4h18v2H3v-2zm4 4h10v2H7v-2zm-4 4h18v2H3v-2z" /></svg>
                </button>
                <button
                    onClick={() => updateTextStyle('textAlign', 'right')}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${textAlign === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm9 4h9v2h-9V7zm-9 4h18v2H3v-2zm9 4h9v2h-9v-2zm-9 4h18v2H3v-2z" /></svg>
                </button>
            </div>
        </div>
    </div>
);

export default function PDFEditor() {
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pages, setPages] = useState<PageState[]>([]);
    const [activePage, setActivePage] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [zoom, setZoom] = useState(1.0);

    // Tools state
    const [activeTab, setActiveTab] = useState<'editor' | 'form' | 'organize'>('editor');
    const [activeTool, setActiveTool] = useState<string>('select');
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [showSignModal, setShowSignModal] = useState(false);
    const [signType, setSignType] = useState<'draw' | 'type' | 'upload'>('draw');
    const [typeSignText, setTypeSignText] = useState('');
    const [password, setPassword] = useState('');
    const [watermark, setWatermark] = useState('');
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [showShapesMenu, setShowShapesMenu] = useState(false);
    const [showIconsMenu, setShowIconsMenu] = useState(false);
    const [originalFileId, setOriginalFileId] = useState<string | null>(null);

    // History Tracking
    const historyRef = useRef<{ [key: number]: string[] }>({});
    const historyIndexRef = useRef<{ [key: number]: number }>({});
    const isRestoringRef = useRef(false);

    // Text formatting state
    const [selectedText, setSelectedText] = useState<fabric.IText | null>(null);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState(18);
    const [fontWeight, setFontWeight] = useState('normal');
    const [fontStyle, setFontStyle] = useState('normal');
    const [underline, setUnderline] = useState(false);
    const [textAlign, setTextAlign] = useState('left');

    const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedPages = useRef<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pagesRef = useRef<PageState[]>([]);

    useEffect(() => {
        pagesRef.current = pages;
    }, [pages]);

    console.log("PDFEditor v2.1: Initializing with Undo/Redo support");

    const saveHistory = (pageNum: number) => {
        const page = pagesRef.current.find(p => p.id === pageNum);
        if (!page?.canvas || isRestoringRef.current) return;

        const json = JSON.stringify(page.canvas.toJSON(['linkUrl']));

        if (!historyRef.current[pageNum]) {
            historyRef.current[pageNum] = [];
            historyIndexRef.current[pageNum] = -1;
        }

        // Don't save if state is identical to current
        if (historyIndexRef.current[pageNum] >= 0) {
            if (historyRef.current[pageNum][historyIndexRef.current[pageNum]] === json) return;
        }

        // If we are not at the end of the history stack, clear the future
        if (historyIndexRef.current[pageNum] < historyRef.current[pageNum].length - 1) {
            historyRef.current[pageNum] = historyRef.current[pageNum].slice(0, historyIndexRef.current[pageNum] + 1);
        }

        historyRef.current[pageNum].push(json);
        // Limit history to 50 steps
        if (historyRef.current[pageNum].length > 50) {
            historyRef.current[pageNum].shift();
            historyIndexRef.current[pageNum] = historyRef.current[pageNum].length - 1;
        } else {
            historyIndexRef.current[pageNum]++;
        }
        console.log(`History Saved - Page ${pageNum}, Index: ${historyIndexRef.current[pageNum]}, Total: ${historyRef.current[pageNum].length}`);
    };

    const undo = () => {
        const page = pages.find(p => p.id === activePage);
        const canvas = page?.canvas;
        if (!canvas) {
            console.warn("Undo: No active canvas");
            return;
        }

        const history = historyRef.current[activePage];
        const index = historyIndexRef.current[activePage];

        console.log(`Undo requested - Page: ${activePage}, Index: ${index}, History Length: ${history?.length}`);

        if (!history || index <= 0) {
            console.log("Undo: Nothing to undo");
            return;
        }

        isRestoringRef.current = true;
        const newIndex = index - 1;
        historyIndexRef.current[activePage] = newIndex;
        const state = history[newIndex];

        canvas.loadFromJSON(state, () => {
            canvas.renderAll();
            isRestoringRef.current = false;
            console.log(`Undo Success - New Index: ${newIndex}`);
        });
    };

    const redo = () => {
        const page = pages.find(p => p.id === activePage);
        const canvas = page?.canvas;
        if (!canvas) return;

        const history = historyRef.current[activePage];
        const index = historyIndexRef.current[activePage];

        console.log(`Redo requested - Page: ${activePage}, Index: ${index}, History Length: ${history?.length}`);

        if (!history || index >= history.length - 1) {
            console.log("Redo: Nothing to redo");
            return;
        }

        isRestoringRef.current = true;
        const newIndex = index + 1;
        historyIndexRef.current[activePage] = newIndex;
        const state = history[newIndex];

        canvas.loadFromJSON(state, () => {
            canvas.renderAll();
            isRestoringRef.current = false;
            console.log(`Redo Success - New Index: ${newIndex}`);
        });
    };

    // Handle File Upload
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // Delete selected object handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const page = pages.find(p => p.id === activePage);
                if (page?.canvas) {
                    const activeObjects = page.canvas.getActiveObjects();
                    if (activeObjects.length) {
                        page.canvas.discardActiveObject();
                        activeObjects.forEach((obj) => {
                            page.canvas?.remove(obj);
                        });
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activePage, pages]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;
                handleFileUpload({ target: fileInputRef.current } as any);
            }
        } else {
            alert("Please drop a valid PDF file.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state for new upload
        initializedPages.current.clear();
        setPages([]);
        setIsLoaded(false);

        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const result = e.target?.result;
            if (!(result instanceof ArrayBuffer)) return;
            const typedarray = new Uint8Array(result);
            try {
                // Upload to backend to get a persistent reference for native saving
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch(`${API_URL}/documents/upload`, {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.file_id) setOriginalFileId(uploadData.file_id);

                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                setPdfDoc(pdf);

                const newPages: PageState[] = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    newPages.push({ canvas: null, id: i, viewport, rotation: 0 });
                }
                setPages(newPages);
                setIsLoaded(true);
            } catch (err) {
                console.error("Error loading PDF:", err);
                alert("Failed to load PDF.");
            }
        };
        fileReader.readAsArrayBuffer(file);
    };

    // Initialize Fabric Canvas for a page
    const initCanvas = useCallback(async (pageNum: number, viewport: pdfjsLib.PageViewport) => {
        const el = canvasRefs.current[pageNum];
        if (!el || !pdfDoc || initializedPages.current.has(pageNum)) return;

        initializedPages.current.add(pageNum);
        const canvas = new fabric.Canvas(el, {
            width: viewport.width,
            height: viewport.height,
            backgroundColor: 'white',
        });

        // Add selection listeners
        canvas.on('selection:created', (e) => handleSelectionChange(e.target, pageNum));
        canvas.on('selection:updated', (e) => handleSelectionChange(e.target, pageNum));
        canvas.on('selection:cleared', () => handleSelectionChange(null, pageNum));

        canvas.on('object:modified', (e) => {
            handleSelectionChange(e.target, pageNum);
            saveHistory(pageNum);
        });
        canvas.on('object:added', () => saveHistory(pageNum));
        canvas.on('object:removed', () => saveHistory(pageNum));
        canvas.on('text:changed', () => saveHistory(pageNum));

        // Render PDF page content onto canvas background
        if (pageNum <= pdfDoc.numPages) {
            try {
                const page = await pdfDoc.getPage(pageNum);
                const tempCanvas = document.createElement('canvas');
                const context = tempCanvas.getContext('2d');
                if (context) {
                    tempCanvas.width = viewport.width;
                    tempCanvas.height = viewport.height;
                    await page.render({ canvasContext: context, viewport } as any).promise;

                    fabric.Image.fromURL(tempCanvas.toDataURL(), (img) => {
                        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                        // Save initial state for undo
                        saveHistory(pageNum);
                    });
                }
                setPages(prev => prev.map(p => p.id === pageNum ? { ...p, canvas } : p));
            } catch (err) {
                console.error(`Error initializing canvas for page ${pageNum}:`, err);
            }
        } else {
            setPages(prev => prev.map(p => p.id === pageNum ? { ...p, canvas } : p));
        }
    }, [pdfDoc]);

    useEffect(() => {
        if (isLoaded && pages.length > 0) {
            pages.forEach(p => {
                if (!p.canvas) initCanvas(p.id, p.viewport);
            });
        }
    }, [isLoaded, pages, initCanvas]);

    const handleSelectionChange = (obj: fabric.Object | undefined | null, pageNum: number) => {
        // Automatically sync active page when object is selected
        if (obj) {
            setActivePage(pageNum);
        }

        if (obj && obj.type === 'i-text') {
            const textObj = obj as fabric.IText;
            setSelectedText(textObj);
            setFontFamily(textObj.fontFamily || 'Arial');
            setFontSize(textObj.fontSize || 18);
            setFontWeight(textObj.fontWeight as string || 'normal');
            setFontStyle(textObj.fontStyle || 'normal');
            setUnderline(!!textObj.underline);
            setTextAlign(textObj.textAlign || 'left');
            setBrushColor(textObj.fill as string || '#000000');
        } else {
            setSelectedText(null);
        }


        if (obj && (obj as any).linkUrl) {
            setLinkUrl((obj as any).linkUrl);
        } else {
            setLinkUrl('');
        }
    };


    const updateTextStyle = (property: string, value: any) => {
        if (!selectedText) return;

        selectedText.set(property as any, value);

        // Update local state for UI sync
        if (property === 'fontFamily') setFontFamily(value);
        if (property === 'fontSize') setFontSize(parseInt(value));
        if (property === 'fontWeight') setFontWeight(value);
        if (property === 'fontStyle') setFontStyle(value);
        if (property === 'underline') setUnderline(value);
        if (property === 'textAlign') setTextAlign(value);
        if (property === 'fill') setBrushColor(value);

        selectedText.canvas?.renderAll();
    };


    // Toolbar Actions
    const setTool = (tool: typeof activeTool) => {
        if (tool === 'signature') {
            setShowSignModal(true);
            return;
        }
        setActiveTool(tool);
        pages.forEach(p => {
            if (!p.canvas) return;
            p.canvas.isDrawingMode = tool === 'draw';
            if (p.canvas.freeDrawingBrush) {
                p.canvas.freeDrawingBrush.color = brushColor;
                p.canvas.freeDrawingBrush.width = brushSize;
            }
            p.canvas.selection = tool === 'select';
            // Disable native selection if drawing
            p.canvas.forEachObject(obj => {
                obj.selectable = tool === 'select' || (tool === activeTool && obj.type === 'i-text');
            });
        });
    };

    const addSymbol = (type: 'check' | 'cross') => {
        const page = pages.find(p => p.id === activePage);
        const canvas = page?.canvas;
        if (!canvas) return;

        let pathData = '';
        let color = '';
        if (type === 'check') {
            pathData = 'M 9 20 l 5 5 l 15 -15';
            color = '#27ae60';
        } else {
            pathData = 'M 6 6 l 18 18 M 24 6 l -18 18';
            color = '#e74c3c';
        }

        const path = new fabric.Path(pathData, {
            left: 100,
            top: 100,
            stroke: color,
            fill: 'transparent',
            strokeWidth: 5,
            strokeLineCap: 'round',
            strokeLineJoin: 'round'
        });
        canvas.add(path);
        canvas.setActiveObject(path);
        canvas.renderAll();
        setTool('select');
    };

    const addSignatureToCanvas = (dataUrl: string) => {
        const page = pages.find(p => p.id === activePage);
        if (!page?.canvas) return;

        fabric.Image.fromURL(dataUrl, (img) => {
            img.scale(0.5);

            // Enable resizing
            img.set({
                borderColor: '#2563eb',
                cornerColor: '#2563eb',
                cornerSize: 10,
                transparentCorners: false,
                lockRotation: false,
                globalCompositeOperation: 'multiply' // Mix with background for realistic ink look
            });
            img.setControlsVisibility({
                mt: true, mb: true, ml: true, mr: true,
                bl: true, br: true, tl: true, tr: true,
                mtr: true
            });

            page.canvas?.add(img);
            page.canvas?.centerObject(img);
            page.canvas?.setActiveObject(img);
            page.canvas?.renderAll();
            saveHistory(page.id);
        });
        setShowSignModal(false);
        setActiveTool('select');
    };

    const handleSignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/editor/remove-bg`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error("Server failed to process image");
            const data = await res.json();
            addSignatureToCanvas(data.image);
        } catch (err) {
            console.error(err);
            alert("Failed to process signature. Try a different image.");
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            const data = f.target?.result as string;
            const page = pages.find(p => p.id === activePage);
            if (page?.canvas) {
                fabric.Image.fromURL(data, (img) => {
                    img.scaleToWidth(200); // Auto scale to decent size

                    img.set({
                        borderColor: '#2563eb',
                        cornerColor: '#2563eb',
                        cornerSize: 10,
                        transparentCorners: false
                    });

                    page.canvas?.add(img);
                    page.canvas?.centerObject(img);
                    page.canvas?.setActiveObject(img);
                    page.canvas?.renderAll();
                    saveHistory(activePage);
                });
            }
        };
        reader.readAsDataURL(file);
    };

    const deletePage = (id: number) => {
        setPages(prev => prev.filter(p => p.id !== id));
    };

    const rotatePage = (id: number) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };

    const handleOCR = async () => {
        const page = pages.find(p => p.id === activePage);
        const canvas = page?.canvas;
        if (!canvas) return;

        setIsProcessingOCR(true);
        try {
            const dataUrl = canvas.toDataURL({ multiplier: 2 });
            const blob = await (await fetch(dataUrl)).blob();
            const formData = new FormData();
            formData.append("file", blob, "scan.png");

            const res = await fetch(`${API_URL}/editor/ocr`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            // Add the OCR text as a new block
            const text = new fabric.IText(data.text || "No text detected", {
                left: 50, top: 50, fontSize: 14, fontFamily: 'Arial'
            });
            canvas.add(text);
            canvas.renderAll();
            saveHistory(activePage);
            alert("AI OCR & Rebuild Completed!");
        } catch (e) {
            console.error(e);
            alert("OCR Failed");
        } finally {
            setIsProcessingOCR(false);
        }
    };

    const movePage = (id: number, direction: 'up' | 'down') => {
        setPages(prev => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx === -1) return prev;
            const newPages = [...prev];
            const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (targetIdx < 0 || targetIdx >= newPages.length) return prev;
            [newPages[idx], newPages[targetIdx]] = [newPages[targetIdx], newPages[idx]];
            return newPages;
        });
    };

    const addBlankPage = () => {
        setPages(prev => {
            const lastPage = prev[prev.length - 1];
            const newId = (lastPage?.id || 0) + 1;
            const templateViewport = prev[0]?.viewport || { width: 595.275 * 1.5, height: 841.89 * 1.5, scale: 1.5, rotation: 0 } as any;
            const newPage: PageState = {
                canvas: null,
                id: newId,
                viewport: { ...templateViewport } as any,
                rotation: 0
            };
            return [...prev, newPage];
        });
        setTimeout(() => {
            const newId = pages.length + 1;
            document.getElementById(`page-${newId}`)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const addShape = (type: 'rect' | 'circle' | 'triangle' | 'line' | 'arrow') => {
        const page = pages.find(p => p.id === activePage);
        const canvas = page?.canvas;
        if (!canvas) return;

        let shape;
        const common = {
            left: 150,
            top: 150,
            fill: 'transparent',
            stroke: brushColor,
            strokeWidth: brushSize,
            borderColor: '#2563eb',
            cornerColor: '#2563eb',
            cornerSize: 8,
            transparentCorners: false
        };

        if (type === 'rect') shape = new fabric.Rect({ ...common, width: 100, height: 100 });
        else if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
        else if (type === 'triangle') shape = new fabric.Triangle({ ...common, width: 100, height: 100 });
        else if (type === 'line') {
            shape = new fabric.Line([50, 50, 200, 50], {
                ...common,
                strokeWidth: brushSize + 1
            });
        }
        else if (type === 'arrow') {
            shape = new fabric.Path('M 0 0 L 50 0 M 50 0 L 40 -5 M 50 0 L 40 5', {
                ...common,
                strokeWidth: brushSize + 1
            });
        }

        if (shape) {
            canvas.add(shape);
            canvas.centerObject(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
            saveHistory(activePage);
            setTool('select');
            setShowShapesMenu(false);
        }
    };

    const addIcon = (svgPath: string) => {
        const page = pages.find(p => p.id === activePage);
        if (!page?.canvas) return;

        const path = new fabric.Path(svgPath, {
            left: 100,
            top: 100,
            fill: brushColor,
            stroke: 'transparent',
            borderColor: '#2563eb',
            cornerColor: '#2563eb',
            cornerSize: 8,
            transparentCorners: false
        });

        path.scaleToWidth(50);
        page.canvas.add(path);
        page.canvas.centerObject(path);
        page.canvas.setActiveObject(path);
        page.canvas.renderAll();
        saveHistory(activePage);
        setShowIconsMenu(false);
        setTool('select');
    };

    const handleSetLink = () => {
        const page = pages.find(p => p.id === activePage);
        const canvas = page?.canvas;
        if (!canvas) return;

        const activeObj = canvas.getActiveObject();
        if (!activeObj) {
            alert("Please select an object first");
            return;
        }

        (activeObj as any).linkUrl = linkUrl;
        setShowLinkModal(false);
        canvas.renderAll();
    };


    const handleNativeEdit = () => {
        const page = pages.find(p => p.id === activePage);
        if (!page?.canvas) return;

        setActiveTool('native-edit');
        const selector = new fabric.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 40,
            fill: 'rgba(59, 130, 246, 0.2)',
            stroke: '#2563eb',
            strokeDashArray: [5, 5],
            strokeWidth: 2,
            name: 'style-selector'
        });
        page.canvas.add(selector);
        page.canvas.setActiveObject(selector);
    };

    const applyAIReplace = async () => {
        const page = pages.find(p => p.id === activePage);
        const canvas = page?.canvas;
        if (!canvas) return;

        const activeObj = canvas.getActiveObject();
        if (!activeObj || activeObj.name !== 'style-selector') {
            alert("Please select the magic box first!");
            return;
        }

        // AI logic...
        const { left, top, width, height } = activeObj.getBoundingRect();
        activeObj.visible = false;
        canvas.renderAll();

        const dataUrl = canvas.toDataURL({
            left, top, width, height, multiplier: 2
        });
        activeObj.visible = true;

        try {
            const formData = new FormData();
            const blob = await (await fetch(dataUrl)).blob();
            formData.append("file", blob, "selection.png");

            const response = await fetch(`${API_URL}/editor/analyze-style`, {
                method: 'POST',
                body: formData
            });
            const style = await response.json();

            // Cover original and add new text
            const whiteout = new fabric.Rect({
                left, top, width, height,
                fill: style.backgroundColor || 'white',
                selectable: false
            });
            const text = new fabric.IText("Edit me", {
                left, top,
                fontSize: style.fontSize || 16,
                fontFamily: style.fontFamily || 'Arial',
                fill: style.color || '#000000',
                fontWeight: style.fontWeight || 'normal'
            });

            canvas.remove(activeObj);
            canvas.add(whiteout, text);
            canvas.setActiveObject(text);
            canvas.renderAll();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const images = pages.map(p => p.canvas?.toDataURL({ multiplier: 2 }) || "");

            // Extract links
            const links: any[] = [];

            pages.forEach((p, pageIdx) => {
                if (!p.canvas) return;
                p.canvas.getObjects().forEach(obj => {
                    if ((obj as any).linkUrl) {
                        const rect = obj.getBoundingRect();
                        links.push({
                            pageIndex: pageIdx,
                            url: (obj as any).linkUrl,
                            rect: [rect.left, rect.top, rect.left + rect.width, rect.top + rect.height]
                        });
                    }
                });
            });

            const res = await fetch(`${API_URL}/editor/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    images,
                    originalFileId,
                    password,
                    watermark,
                    links
                })
            });
            const data = await res.json();
            if (data.download_url) {
                window.open(`${API_URL}${data.download_url}`, '_blank');
            }
        } catch (e) {
            alert("Save failed");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f1f2f3] overflow-hidden font-sans">
            {/* Top Tier: Tabs and Brand */}
            <div className="h-10 bg-[#2d3e50] flex items-center px-4 justify-between z-30 shrink-0">
                <div className="flex items-center gap-1">
                    <div className="bg-white p-1 rounded-md mr-1 md:mr-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d3e50]" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,9V3.5L18.5,9H13Z" /></svg>
                    </div>
                    <span className="text-white font-black text-sm md:text-lg tracking-tight truncate max-w-[100px] md:max-w-none">SmartDoc AI</span>

                    <div className="flex ml-4 md:ml-8 h-10">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`px-2 md:px-4 text-[11px] md:text-[13px] font-bold transition-colors ${activeTab === 'editor' ? 'bg-[#f1f2f3] text-gray-800 rounded-t-lg' : 'text-gray-300 hover:text-white'}`}
                        >
                            Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('organize')}
                            className={`px-2 md:px-4 text-[11px] md:text-[13px] font-bold transition-colors ${activeTab === 'organize' ? 'bg-[#f1f2f3] text-gray-800 rounded-t-lg' : 'text-gray-300 hover:text-white'}`}
                        >
                            <span className="hidden xs:inline">Organize</span>
                            <span className="xs:hidden">Org</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-white text-[10px] md:text-xs font-medium">
                    <span className="opacity-70 hidden sm:inline">Example.pdf</span>
                    <div className="h-4 w-[1px] bg-white opacity-20 hidden sm:block" />
                    <button className="hover:underline flex items-center gap-1">
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="hidden xs:inline">Help</span>
                    </button>
                </div>
            </div>

            {/* Middle Tier: Main Toolbar (DocFly Style) */}
            <header className="h-16 md:h-20 bg-[#f1f2f3] border-b border-gray-300 px-2 md:px-6 flex items-center justify-between z-20 shrink-0 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-0.5 min-w-max">
                    {/* Zoom & View */}
                    <div className="flex flex-col items-center mr-6 gap-1">
                        <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
                            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 px-2 hover:bg-gray-100 text-gray-600 border-r border-gray-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                            </button>
                            <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} className="p-1 px-2 hover:bg-gray-100 text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                            </button>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Zoom</span>
                    </div>

                    <div className="h-12 w-[1px] bg-gray-300 mx-1 md:mx-3" />

                    {!isLoaded ? (
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="h-12 w-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-blue-600 shadow-sm hover:border-blue-400"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Upload</span>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-0.5 w-full overflow-x-auto no-scrollbar">
                            {activeTab === 'editor' && (
                                <>
                                    <ToolbarButton
                                        active={activeTool === 'select'}
                                        onClick={() => setTool('select')}
                                        label="Select"
                                        icon={<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>}
                                    />
                                    <ToolbarButton
                                        active={activeTool === 'text'}
                                        onClick={() => {
                                            setTool('text');
                                            const page = pages.find(p => p.id === activePage);
                                            const canvas = page?.canvas;
                                            if (canvas) {
                                                const text = new fabric.IText('Edit text', { left: 100, top: 100, fontFamily: 'Arial', fontSize: 18 });
                                                canvas.add(text);
                                                canvas.setActiveObject(text);
                                            }
                                        }}
                                        label="Text"
                                        icon={<div className="font-serif font-black text-xl text-gray-700">A</div>}
                                    />
                                    <ToolbarButton
                                        active={activeTool === 'native-edit'}
                                        onClick={handleNativeEdit}
                                        label="Whiteout"
                                        icon={<div className="w-6 h-6 border-2 border-gray-400 bg-white" />}
                                    />
                                    <ToolbarButton
                                        active={false}
                                        onClick={() => addSymbol('check')}
                                        label="Check"
                                        icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    />
                                    <ToolbarButton
                                        active={false}
                                        onClick={() => addSymbol('cross')}
                                        label="Cross"
                                        icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                                    />
                                    <ToolbarButton
                                        active={false}
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = (e) => handleImageUpload(e as any);
                                            input.click();
                                        }}
                                        label="Image"
                                        icon={<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                    />
                                    <ToolbarButton
                                        active={activeTool === 'signature'}
                                        onClick={() => setTool('signature')}
                                        label="Signature"
                                        icon={<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /><path d="M4 20h16" /></svg>}
                                    />

                                    <div className="h-12 w-[1px] bg-gray-300 mx-3" />

                                    <ToolbarButton
                                        active={activeTool === 'draw'}
                                        onClick={() => setTool('draw')}
                                        label="Draw"
                                        icon={<div className="w-6 h-3 bg-gray-600 border border-gray-400 rounded-sm" />}
                                    />

                                    {/* Color Picker */}
                                    <div className="flex flex-col items-center justify-center">
                                        <input
                                            type="color"
                                            value={brushColor}
                                            onChange={(e) => {
                                                setBrushColor(e.target.value);
                                                pages.forEach(p => {
                                                    if (p.canvas && p.canvas.freeDrawingBrush) {
                                                        p.canvas.freeDrawingBrush.color = e.target.value;
                                                    }
                                                    if (p.canvas) {
                                                        const activeObj = p.canvas.getActiveObject();
                                                        if (activeObj) {
                                                            if (activeObj.type === 'i-text' || activeObj.type === 'path') {
                                                                (activeObj as fabric.IText).set('fill', e.target.value);
                                                                p.canvas.renderAll();
                                                                saveHistory(p.id);
                                                            } else {
                                                                activeObj.set('stroke', e.target.value);
                                                                p.canvas.renderAll();
                                                                saveHistory(p.id);
                                                            }
                                                        }
                                                    }
                                                });
                                            }}
                                            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                                            title="Object Color"
                                        />
                                        <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Color</span>
                                    </div>

                                    {/* Shapes Menu */}
                                    <div className="relative group">
                                        <ToolbarButton
                                            active={showShapesMenu}
                                            onClick={() => setShowShapesMenu(!showShapesMenu)}
                                            label="Shapes"
                                            icon={<svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" /></svg>}
                                        />
                                        {showShapesMenu && (
                                            <div className="absolute top-[72px] left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-xl shadow-2xl p-2 flex gap-1 z-[60] min-w-[280px] justify-center animate-in fade-in slide-in-from-top-2 duration-200">
                                                <button onClick={(e) => { e.stopPropagation(); addShape('rect'); }} className="p-2 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-1.5 transition-colors group/shape">
                                                    <div className="w-7 h-7 border-2 border-gray-700 group-hover/shape:border-blue-600" />
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover/shape:text-blue-600">Square</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); addShape('circle'); }} className="p-2 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-1.5 transition-colors group/shape">
                                                    <div className="w-7 h-7 border-2 border-gray-700 rounded-full group-hover/shape:border-blue-600" />
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover/shape:text-blue-600">Circle</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); addShape('triangle'); }} className="p-2 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-1.5 transition-colors group/shape">
                                                    <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-gray-700 group-hover/shape:border-b-blue-600" />
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover/shape:text-blue-600">Triangle</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); addShape('line'); }} className="p-2 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-1.5 transition-colors group/shape">
                                                    <div className="w-7 h-[2px] bg-gray-700 mt-4 group-hover/shape:bg-blue-600" />
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover/shape:text-blue-600">Line</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); addShape('arrow'); }} className="p-2 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-1.5 transition-colors group/shape">
                                                    <svg className="w-7 h-7 text-gray-700 group-hover/shape:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover/shape:text-blue-600">Arrow</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Icons Menu */}
                            <div className="relative group">
                                <ToolbarButton
                                    active={showIconsMenu}
                                    onClick={() => setShowIconsMenu(!showIconsMenu)}
                                    label="Icons"
                                    icon={<svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>}
                                />
                                {showIconsMenu && (
                                    <div className="absolute top-[72px] left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-xl shadow-2xl p-4 grid grid-cols-5 gap-1.5 z-[60] min-w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                                        {[
                                            // Row 1: Actions & Status
                                            { name: 'Check', path: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' },
                                            { name: 'Close', path: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' },
                                            { name: 'Add', path: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' },
                                            { name: 'Edit', path: 'M3,17.25V21h3.75L17.81,9.94l-3.75,-3.75L3,17.25z' },
                                            { name: 'Delete', path: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4Z M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z' },

                                            // Row 2: Navigation
                                            { name: 'Home', path: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z' },
                                            { name: 'Menu', path: 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z' },
                                            { name: 'Search', path: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' },
                                            { name: 'Settings', path: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.97 21.68,8.73L19.68,5.27C19.56,5.03 19.3,4.94 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.7,4.94 4.44,5.03 4.32,5.27L2.32,8.73C2.22,8.97 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.03 2.32,15.27L4.32,18.73C4.44,18.97 4.7,19.06 4.95,18.95L7.44,17.95C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.95L19.05,18.95C19.3,19.06 19.56,18.97 19.68,18.73L21.68,15.27C21.78,15.03 21.73,14.78 21.54,14.63L19.43,12.97Z' },
                                            { name: 'User', path: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' },

                                            // Row 3: Social & Feedback
                                            { name: 'Smiley', path: 'M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10s10,-4.48 10,-10S17.52,2 12,2zM12,20c-4.41,0-8,-3.59-8,-8s3.59,-8 8,-8s8,3.59 8,8S16.41,20 12,20z M7,9.5c0,-0.83 0.67,-1.5 1.5,-1.5s1.5,0.67 1.5,1.5S9.33,11 8.5,11S7,10.33 7,9.5zM15.5,11c-0.83,0-1.5,-0.67-1.5,-1.5s0.67,-1.5 1.5,-1.5s1.5,0.67 1.5,1.5S16.33,11 15.5,11zM12,17.5c-2.33,0-4.31,-1.46-5.11,-3.5h10.22C16.31,16.04 14.33,17.5 12,17.5z' },
                                            { name: 'Thumb Up', path: 'M23,10C23,8.9 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19C7,20.1 7.9,21 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10Z' },
                                            { name: 'Thumb Down', path: 'M1,14C1,15.1 1.9,16 3,16H9.31L8.35,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.42,16.41C16.78,16.05 17,15.55 17,15V5C17,3.9 16.1,3 15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14Z' },
                                            { name: 'Star', path: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' },
                                            { name: 'Heart', path: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z' },

                                            // Row 4: Arrows
                                            { name: 'Arrow Up', path: 'M4,12l1.41,1.41L11,7.83V20h2V7.83l5.58,5.59L20,12l-8,-8L4,12z' },
                                            { name: 'Arrow Down', path: 'M20,12l-1.41,-1.41L13,16.17V4h-2v12.17l-5.58,-5.59L4,12l8,8L20,12z' },
                                            { name: 'Arrow Left', path: 'M20,11H7.83l5.59,-5.58L12,4l-8,8l8,8l1.41,-1.41L7.83,13H20V11z' },
                                            { name: 'Arrow Right', path: 'M12,4l-1.41,1.41L16.17,11H4v2h12.17l-5.58,5.58L12,20l8,-8L12,4z' },
                                            { name: 'Refresh', path: 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z' },

                                            // Row 5: Media & Objects
                                            { name: 'Camera', path: 'M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z' },
                                            { name: 'Image', path: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z' },
                                            { name: 'Play', path: 'M8,5.14V19.14L19,12.14L8,5.14Z' },
                                            { name: 'Volume', path: 'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z' },
                                            { name: 'Lock', path: 'M12,17A2,2 0 0,0 14,15C14,13.89 13.11,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8H17V6A5,5 0 0,0 12,1H12A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M9,6A3,3 0 0,1 12,3H12A3,3 0 0,1 15,6V8H9V6Z' },

                                            // Row 6: Communication
                                            { name: 'Mail', path: 'M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M20,8L12,13L4,8V6L12,11L20,6V8Z' },
                                            { name: 'Chat', path: 'M20,2H4C2.9,2 2,2.9 2,4v18l4,-4h14c1.1,0 2,-0.9 2,-2V4C22,2.9 21.1,2 20,2z' },
                                            { name: 'Phone', path: 'M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z' },
                                            { name: 'Share', path: 'M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.12,18.77 15.12,19A3,3 0 0,0 18.12,22A3,3 0 0,0 21.12,19A3,3 0 0,0 18.12,16C18.12,16 18.12,16 18,16.08Z' },
                                            { name: 'Map', path: 'M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z' },

                                            // Row 7: Tools & Hands
                                            { name: 'Wrench', path: 'M22.7,19L20.4,21.3C20,21.7 19.3,21.7 18.9,21.3L12.5,14.9L14,13.4L20.4,19.8L22.7,17.5L22.7,19M13.2,12.5L2,1.3V5H5V8H2V11.2C2,12.1 2.3,12.9 3,13.5L8.5,19L9.9,17.6L4.4,12.1C4.1,11.8 4,11.5 4,11.2V9H7V6H4V3.1L12.5,11.6L13.2,12.5Z' },
                                            { name: 'Flash', path: 'M7,2V13H10V22L17,10H13L17,2H7Z' },
                                            { name: 'Hand', path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12.5,17H11.5A0.5,0.5 0 0,1 11,16.5V11.5A0.5,0.5 0 0,1 11.5,11H12.5A0.5,0.5 0 0,1 13,11.5V16.5A0.5,0.5 0 0,1 12.5,17M12,9A1,1 0 0,1 11,8A1,1 0 0,1 12,7A1,1 0 0,1 13,8A1,1 0 0,1 12,9Z' },
                                            { name: 'Attachment', path: 'M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z' },
                                            { name: 'Trophy', path: 'M18,2H16V1H8V2H6C4.9,2 4,2.9 4,4V9C4,11.2 5.8,13 8,13V15.1C5.7,15.6 4,17.6 4,20V21H20V20C20,17.6 18.3,15.6 16,15.1V13C18.2,13 20,11.2 20,9V4C20,2.9 19.1,2 18,2M6,9V4H8V11C6.9,11 6,10.1 6,9M18,9C18,10.1 17.1,11 16,11V4H18V9Z' },

                                            // Row 8: Nature & Food
                                            { name: 'Cloud', path: 'M17.5,19C15.57,19 14,17.43 14,15.5C14,15.42 14,15.34 14.03,15.26C12.87,15.82 11.47,15.5 10.58,14.53C9.69,13.56 9.54,12.16 10.22,11.03C8.63,11.44 7,10.21 7,8.5C7,6.57 8.57,5 10.5,5C10.58,5 10.66,5 10.74,5.03C11.3,3.87 12.6,3.15 14,3.15C15.88,3.15 17.42,4.63 17.5,6.5C19.43,6.5 21,8.07 21,10C21,11.93 19.43,13.5 17.5,13.5H16V15.5C16,16.33 16.67,17 17.5,17H19V19H17.5Z' },
                                            { name: 'Water', path: 'M12,20C8.69,20 6,17.31 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14C18,17.31 15.31,20 12,20Z' },
                                            { name: 'Leaf', path: 'M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C11,2 15,2 15,2C15,2 15,2 13,2C7,2 3,7 3,7C3,7 13.5,6.5 17,8Z' },
                                            { name: 'Coffee', path: 'M2,21H20V19H2M20,8H18V5H2V14A3,3 0 0,0 5,17H15A3,3 0 0,0 18,14V12H20A2,2 0 0,0 22,10V10A2,2 0 0,0 20,8M16,14A1,1 0 0,1 15,15H5A1,1 0 0,1 4,14V7H16M20,10H18V10H20Z' },
                                            { name: 'Pizza', path: 'M7,15A1,1 0 0,1 8,16A1,1 0 0,1 7,17A1,1 0 0,1 6,16A1,1 0 0,1 7,15M11,10A1,1 0 0,1 12,11A1,1 0 0,1 11,12A1,1 0 0,1 10,11A1,1 0 0,1 11,10M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.58,20 4,16.42 4,12C4,11.85 4,11.71 4,11.57L12,12L16.43,19.43C15.11,19.79 13.59,20 12,20M12,10.1L4.57,9.64C5.2,6.34 8,4 12,4V10.1M17.43,18.43L12,12L12,4C15.2,4 18,6 19.3,8.7L13,10.5L17.43,18.43Z' }
                                        ].map(icon => (
                                            <button
                                                key={icon.name}
                                                onClick={(e) => { e.stopPropagation(); addIcon(icon.path); }}
                                                className="p-1.5 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-all group/icon hover:scale-110"
                                                title={icon.name}
                                            >
                                                <svg className="w-5 h-5 text-gray-700 group-hover/icon:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d={icon.path} /></svg>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-12 w-[1px] bg-gray-300 mx-3" />
                            <div className="flex items-center gap-1 border-r pr-3 mr-3">
                                <button
                                    onClick={undo}
                                    title="Undo"
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                </button>
                                <button
                                    onClick={redo}
                                    title="Redo"
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>

                            <ToolbarButton
                                active={showLinkModal}
                                onClick={() => setShowLinkModal(true)}
                                label="Link"
                                icon={<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19,8.688a4.5,4.5,0,0,1,6.364,0l2.828,2.828a4.5,4.5,0,0,1,0,6.364l-2.828,2.828a4.5,4.5,0,0,1-6.364,0M10.81,15.312a4.5,4.5,0,0,1-6.364,0L1.618,12.484a4.5,4.5,0,0,1,0-6.364L4.446,3.292a4.5,4.5,0,0,1,6.364,0M8.27,15.73l7.46-7.46" /></svg>}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isLoaded && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`h-11 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isSaving ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-11l-4-4m0 0L8 8m4-4v12" /></svg>
                                        Save Document
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Formatting Toolbar - Visible only when text tool active or text selected */}
            {(activeTool === 'text' || selectedText) && (
                <FormattingToolbar
                    selectedText={selectedText}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                    fontStyle={fontStyle}
                    underline={underline}
                    textAlign={textAlign}
                    updateTextStyle={updateTextStyle}
                />
            )}

            {/* Bottom Tier: Page Status Bar */}
            {isLoaded && (
                <div className="h-10 bg-white border-b border-gray-200 px-6 flex items-center justify-between text-xs font-medium text-gray-500 z-10 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" /></svg>
                            </button>
                            <span className="font-bold">Page {activePage} of {pages.length}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative">
                {/* Thumbnails Sidebar - Hidden on mobile, toggleable or just smaller */}
                <aside className="hidden sm:flex w-24 md:w-32 bg-[#edeff1] border-r overflow-y-auto p-2 md:p-3 flex-col gap-4">
                    {pages.map(p => (
                        <div
                            key={p.id}
                            onClick={() => {
                                setActivePage(p.id);
                                document.getElementById(`page-${p.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`group cursor-pointer transition-all ${activePage === p.id ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}
                        >
                            <div className="bg-white shadow-sm rounded aspect-[1/1.4] relative flex items-center justify-center overflow-hidden">
                                <span className="text-[10px] text-gray-400 font-bold">PAGE {p.id}</span>
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); movePage(p.id, 'up'); }} className="text-white hover:text-blue-400">↑</button>
                                    <button onClick={(e) => { e.stopPropagation(); movePage(p.id, 'down'); }} className="text-white hover:text-blue-400">↓</button>
                                    <button onClick={(e) => { e.stopPropagation(); rotatePage(p.id); }} className="text-white hover:text-yellow-400">↻</button>
                                    <button onClick={(e) => { e.stopPropagation(); deletePage(p.id); }} className="text-white hover:text-red-400">×</button>
                                </div>
                            </div>
                            <p className="text-[10px] text-center mt-1 font-medium text-gray-500">{p.id}</p>
                        </div>
                    ))}
                    <button
                        onClick={addBlankPage}
                        className="w-full aspect-[1/1.4] border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-[10px] font-bold mt-1">ADD PAGE</span>
                    </button>
                </aside>

                {/* Editor Surface */}
                <main
                    className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth transition-colors ${isDragging ? 'bg-blue-50' : 'bg-gray-200'}`}
                    ref={containerRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center gap-4 md:gap-8 max-w-5xl mx-auto h-full">
                        {!isLoaded ? (
                            <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full max-w-2xl aspect-[1/1] sm:aspect-[16/9] border-4 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 md:gap-6 cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-100/50 scale-[1.02]' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50 shadow-sm px-4'}`}
                                >
                                    <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-100 rounded-full flex items-center justify-center animate-bounce-slow">
                                        <svg className="w-8 h-8 md:w-12 md:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl md:text-2xl font-black text-gray-800">Drop your PDF here</h3>
                                        <p className="text-sm text-gray-500 mt-2 font-medium">or click to browse</p>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm6-1a1 1 0 11-2 0 1 1 0 012 0z" /></svg> No registration</div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg> Secure & Private</div>
                                    </div>
                                </div>
                                <div className="mt-8 grid grid-cols-3 gap-8 w-full max-w-2xl px-4">
                                    <div className="text-center">
                                        <div className="text-blue-600 font-bold mb-1 text-lg">AI Native</div>
                                        <p className="text-[10px] text-gray-400 font-medium leading-tight">Edit text with original fonts and styles automatically matched.</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-purple-600 font-bold mb-1 text-lg">Secure</div>
                                        <p className="text-[10px] text-gray-400 font-medium leading-tight">Add passwords and watermarks to your exported documents.</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-orange-600 font-bold mb-1 text-lg">OCR</div>
                                        <p className="text-[10px] text-gray-400 font-medium leading-tight">Transform scanned images into editable text blocks in one click.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-8 pb-20 w-full">
                                {pages.map(p => (
                                    <div
                                        key={p.id}
                                        id={`page-${p.id}`}
                                        className="relative shadow-2xl bg-white transition-transform duration-300 origin-top max-w-full"
                                        style={{
                                            transform: `scale(${zoom})`,
                                            marginBottom: `${((p.viewport.height * zoom) - p.viewport.height) / 2 + 40}px`
                                        }}
                                        onMouseEnter={() => setActivePage(p.id)}
                                    >
                                        <canvas
                                            ref={el => { canvasRefs.current[p.id] = el; }}
                                            className="border border-gray-300"
                                        />
                                        <div className="absolute -left-12 top-0 flex flex-col gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                                                {p.id}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addBlankPage}
                                    className="w-[595px] h-[150px] border-4 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-400 hover:bg-white transition-all group shrink-0"
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top' }}
                                >
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <span className="font-bold text-sm uppercase tracking-widest">Add Blank Page</span>
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                {/* Form Properties Sidebar */}
            </div>

            {/* Signature Modal */}
            {
                showSignModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="border-b p-4 flex items-center justify-between">
                                <h3 className="font-bold text-lg">Create Signature</h3>
                                <button onClick={() => setShowSignModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex border-b bg-gray-50">
                                {(['draw', 'type', 'upload'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSignType(t)}
                                        className={`flex-1 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${signType === t ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8 h-64 flex items-center justify-center bg-[#fafafa]">
                                {signType === 'draw' && (
                                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative group">
                                        <canvas
                                            id="signature-pad"
                                            width={500}
                                            height={200}
                                            className="w-full h-full cursor-crosshair bg-white"
                                            onMouseDown={(e) => {
                                                const canvas = e.currentTarget;
                                                const ctx = canvas.getContext('2d');
                                                if (ctx) {
                                                    ctx.lineWidth = 3;
                                                    ctx.lineCap = 'round';
                                                    ctx.strokeStyle = '#000';
                                                    ctx.beginPath();
                                                    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                                    canvas.setAttribute('data-drawing', 'true');
                                                }
                                            }}
                                            onMouseMove={(e) => {
                                                const canvas = e.currentTarget;
                                                if (canvas.getAttribute('data-drawing') === 'true') {
                                                    const ctx = canvas.getContext('2d');
                                                    if (ctx) {
                                                        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                                        ctx.stroke();
                                                    }
                                                }
                                            }}
                                            onMouseUp={(e) => {
                                                e.currentTarget.setAttribute('data-drawing', 'false');
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.setAttribute('data-drawing', 'false');
                                            }}
                                        />
                                        <div className="absolute bottom-2 right-2 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const canvas = document.getElementById('signature-pad') as HTMLCanvasElement;
                                                    const ctx = canvas?.getContext('2d');
                                                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                                                }}
                                                className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                            >
                                                Clear
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const canvas = document.getElementById('signature-pad') as HTMLCanvasElement;
                                                    addSignatureToCanvas(canvas.toDataURL());
                                                }}
                                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                            >
                                                Use This
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {signType === 'type' && (
                                    <div className="w-full flex flex-col gap-4">
                                        <input
                                            type="text"
                                            value={typeSignText}
                                            onChange={(e) => setTypeSignText(e.target.value)}
                                            placeholder="Type your name..."
                                            className="w-full p-4 border rounded-xl text-4xl font-serif text-center focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder:text-gray-300"
                                            style={{ fontFamily: 'Dancing Script, cursive' }}
                                        />
                                        <div className="flex gap-2 justify-center">
                                            {['cursive', 'serif', 'sans-serif'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => {
                                                        const canvas = document.createElement('canvas');
                                                        canvas.width = 400; canvas.height = 100;
                                                        const ctx = canvas.getContext('2d');
                                                        if (ctx) {
                                                            ctx.font = `italic 40px ${f === 'cursive' ? 'Dancing Script, Pacifico, cursive' : f}`;
                                                            ctx.fillText(typeSignText || 'Signature', 20, 60);
                                                            addSignatureToCanvas(canvas.toDataURL());
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-900 hover:bg-gray-50 capitalize shadow-sm transition-colors"
                                                >
                                                    {f} Style
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {signType === 'upload' && (
                                    <div className="flex flex-col items-center gap-4">
                                        <label className="flex flex-col items-center gap-2 cursor-pointer group">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Upload signature image</span>
                                            <span className="text-xs text-gray-400">AI will remove background automatically</span>
                                            <input type="file" className="hidden" onChange={handleSignUpload} accept="image/*" />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                                <button onClick={() => setShowSignModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={() => setShowSignModal(false)} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Done</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-black text-gray-800 mb-2">Add Link</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {pages.find(p => p.id === activePage)?.canvas?.getActiveObject() ?
                                    "Enter the URL you want this object to point to." :
                                    "⚠️ You must select an object (text, image, or shape) on the canvas before setting a link."}
                            </p>

                            {pages.find(p => p.id === activePage)?.canvas?.getActiveObject() ? (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full p-4 pl-12 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700"
                                        autoFocus
                                    />
                                    <svg className="w-5 h-5 absolute left-4 top-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                    <svg className="w-6 h-6 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div className="text-xs text-amber-700 font-medium leading-relaxed">
                                        To add a link:
                                        <ol className="list-decimal ml-4 mt-1 space-y-1">
                                            <li>Close this modal.</li>
                                            <li>Click on any text, shape, or icon in the document.</li>
                                            <li>Then click the "Link" button again.</li>
                                        </ol>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                            <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
                                {pages.find(p => p.id === activePage)?.canvas?.getActiveObject() ? "Cancel" : "Close"}
                            </button>
                            {pages.find(p => p.id === activePage)?.canvas?.getActiveObject() && (
                                <button
                                    onClick={handleSetLink}
                                    className="px-8 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                                >
                                    Set Link
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Google Fonts and Custom Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite;
                }
            `}} />
        </div>
    );
}
