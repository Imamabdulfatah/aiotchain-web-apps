"use client";

import { fetchAPI } from "@/lib/api";
import { Extension } from "@tiptap/core";
import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

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

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Mulai menulis...",
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-xl",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
        allowFullscreen: true,
        HTMLAttributes: {
          class: "rounded-xl my-4 aspect-video w-full",
          title: "YouTube video player",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[400px] px-6 py-4 focus:outline-none text-slate-900",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addYoutubeVideo = () => {
    const url = prompt("Masukkan URL YouTube:");
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 360,
      });
    }
  };

  const uploadImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const data = await fetchAPI<{ url: string }>("/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (data.url) {
          // Prepend API URL to make it absolute so it shows up in both editor and public page
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
          const absoluteUrl = data.url.startsWith("http") ? data.url : `${baseUrl}${data.url}`;
          editor.commands.setImage({ src: absoluteUrl });
        } else {
          alert("Gagal mengupload gambar");
        }
      } catch (error: any) {
        console.error("Error uploading image:", error);
        alert(error.message || "Terjadi kesalahan saat upload gambar");
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50 p-3 flex flex-wrap gap-2">
        {/* Headings */}
        <div className="flex gap-1 border-r border-slate-200 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <span className="font-bold text-sm">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <span className="font-bold text-sm">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <span className="font-bold text-sm">H3</span>
          </ToolbarButton>
        </div>

        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-slate-200 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
          >
            <span className="underline">U</span>
          </ToolbarButton>
        </div>

        {/* Font Size */}
        <div className="flex gap-1 border-r border-slate-200 pr-2">
          <select
            onChange={(e) => {
              const size = e.target.value;
              if (size) {
                editor.chain().focus().setFontSize(size).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
            }}
            className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg cursor-pointer text-slate-700"
            title="Font Size"
          >
            <option value="">Default</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="24px">24px</option>
            <option value="32px">32px</option>
          </select>
        </div>

        {/* Font Family */}
        <div className="flex gap-1 border-r border-slate-200 pr-2">
          <select
            onChange={(e) => {
              const family = e.target.value;
              if (family) {
                editor.chain().focus().setFontFamily(family).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
            className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg cursor-pointer text-slate-700"
            title="Font Family"
          >
            <option value="">Default</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-slate-200 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4h16v2H2V4zm0 5h10v2H2V9zm0 5h16v2H2v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4h16v2H2V4zm3 5h10v2H5V9zm-3 5h16v2H2v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4h16v2H2V4zm6 5h10v2H8V9zm-6 5h16v2H2v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4h16v2H2V4zm0 5h16v2H2V9zm0 5h16v2H2v-2z" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-slate-200 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 100 4 2 2 0 000-4zm4 1h10v2H8V5zm0 5h10v2H8v-2zm0 5h10v2H8v-2zM4 9a2 2 0 100 4 2 2 0 000-4zm0 5a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h1v4H3V4zm0 6h1v4H3v-4zm0 6h1v4H3v-4zm4-11h10v2H7V5zm0 5h10v2H7v-2zm0 5h10v2H7v-2z" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Media */}
        <div className="flex gap-1 border-r border-slate-200 pr-2">
          <ToolbarButton
            onClick={uploadImage}
            disabled={isUploading}
            title="Upload Image"
          >
            {isUploading ? (
              <span className="text-xs">...</span>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            )}
          </ToolbarButton>
          <ToolbarButton onClick={addYoutubeVideo} title="Embed YouTube Video">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.5 10.5l-5 3v-6l5 3z" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10c0-2 1.5-3.5 3.5-3.5S13 8 13 10s-1.5 3.5-3.5 3.5H8v2h1.5c3.038 0 5.5-2.462 5.5-5.5S12.538 4.5 9.5 4.5 4 6.962 4 10v6h2v-6z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
            </svg>
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
