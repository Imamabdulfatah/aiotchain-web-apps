"use client";

import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { compressImage } from "@/lib/image-utils";
import { Extension } from "@tiptap/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { FontFamily } from "@tiptap/extension-font-family";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { Youtube } from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Underline as UnderlineIcon,
    Youtube as YoutubeIcon
} from "lucide-react";
import { useCallback, useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Custom Font Size Extension
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: null }).run();
        },
    };
  },
});

// Create lowlight instance
const lowlight = createLowlight(all);

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const [margin, setMargin] = useState(48); // default padding in pixels
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontSize,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl border border-slate-100 shadow-lg max-w-full h-auto my-8',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-xl bg-slate-900 text-slate-100 p-6 my-6 font-mono text-sm leading-relaxed overflow-x-auto border border-slate-800 shadow-2xl',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
        allowFullscreen: true,
        HTMLAttributes: {
          class: "rounded-xl my-4 aspect-video w-full",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Mulai menulis cerita Anda...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] text-slate-700',
      },
    },
  });

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];

        // Validasi Ukuran Gambar (Maks 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Ukuran gambar terlalu besar. Maksimal 5MB.");
          return;
        }

        setIsUploading(true);
        
        try {
          // Kompres gambar sebelum upload
          const compressedFile = await compressImage(file, { maxWidth: 1500, quality: 0.8 });
          
          const formData = new FormData();
          formData.append("image", compressedFile);
          const token = getToken();

          const data = await fetchAPI<{url: string}>("/admin/upload", {
            method: "POST",
            body: formData,
            headers: { "Content-Type": undefined as any },
          });
          const imageUrl = data.url;
          const fullUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${imageUrl}`;
          
          editor?.chain().focus().setImage({ src: fullUrl }).run();
        } catch (err) {
          alert("Gagal upload gambar: " + (err as Error).message);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    const url = window.prompt("Masukkan URL Video YouTube:");

    if (url) {
      editor?.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 360,
      });
    }
  }, [editor]);

  if (!editor) return null;

  const fontFamilies = [
    { label: 'Sans', value: 'Inter, sans-serif' },
    { label: 'Serif', value: 'Merriweather, serif' },
    { label: 'Mono', value: 'monospace' },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* Floating/Sticky Toolbar */}
      <div className="sticky top-20 z-10 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-xl flex flex-wrap items-center gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('underline') ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>

        <div className="w-[1px] h-6 bg-slate-100 mx-1"></div>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('codeBlock') ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Code Block"
        >
          <Code size={18} />
        </button>

        <div className="w-[1px] h-6 bg-slate-100 mx-1"></div>

        <button
          onClick={setLink}
          className={`p-2 rounded-lg transition-all ${editor.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-400'}`}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </button>
        <button
          onClick={addImage}
          disabled={isUploading}
          className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-all disabled:opacity-50"
          title="Add Image"
        >
          <ImageIcon size={18} />
        </button>
        <button
          onClick={addYoutubeVideo}
          className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-all flex items-center gap-1"
          title="Add YouTube Video"
        >
          <YoutubeIcon size={18} />
          <span className="text-[10px] font-bold uppercase hidden lg:inline">Video</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-100 mx-1"></div>

        {/* Font Family Dropdown */}
        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-2 py-1 outline-none"
        >
          <option value="">Default Font</option>
          {fontFamilies.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <div className="hidden md:flex items-center space-x-2 ml-auto pr-2">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Margin</span>
          <input 
            type="range" 
            min="20" 
            max="120" 
            value={margin} 
            onChange={(e) => setMargin(parseInt(e.target.value))}
            className="w-24 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Editor Content Area */}
      <div 
        className="bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden"
        style={{ padding: `${margin}px` }}
      >
        <EditorContent editor={editor} />
      </div>

      {isUploading && (
        <div className="fixed bottom-10 right-10 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center space-x-3 animate-bounce">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-700">Mengunggah gambar...</span>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
