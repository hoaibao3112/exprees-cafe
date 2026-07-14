'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading2, Heading3,
  Link2, Link2Off, Highlighter, Undo, Redo,
  Minus, Quote
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Toolbar button helper
───────────────────────────────────────────── */
function ToolBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex items-center justify-center w-7 h-7 rounded-md text-xs transition-all cursor-pointer
        ${active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Divider
───────────────────────────────────────────── */
function Sep() {
  return <span className="w-px h-5 bg-slate-200 shrink-0" />;
}

/* ─────────────────────────────────────────────
   Color palette (text color)
───────────────────────────────────────────── */
const TEXT_COLORS = [
  { label: 'Mặc định', color: '#1e293b' },
  { label: 'Đỏ',      color: '#dc2626' },
  { label: 'Cam',     color: '#ea580c' },
  { label: 'Vàng',    color: '#ca8a04' },
  { label: 'Xanh lá', color: '#16a34a' },
  { label: 'Xanh lam',color: '#2563eb' },
  { label: 'Tím',     color: '#7c3aed' },
  { label: 'Hồng',    color: '#db2777' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Vàng', color: '#fef08a' },
  { label: 'Xanh', color: '#bbf7d0' },
  { label: 'Hồng', color: '#fecdd3' },
  { label: 'Cam',  color: '#fed7aa' },
  { label: 'Tím',  color: '#e9d5ff' },
];

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight = '220px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 text-slate-700 leading-7',
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value (e.g. when data loads from server).
  // Pass emitUpdate=false so setContent does NOT trigger onUpdate → prevents loops.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes('link').href ?? '';
    const url = window.prompt('Nhập URL liên kết:', prev);
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors bg-white">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50/80">

        {/* History */}
        <ToolBtn title="Hoàn tác (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Làm lại (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Headings */}
        <ToolBtn title="Tiêu đề lớn (H2)" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Tiêu đề nhỏ (H3)" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Text styles */}
        <ToolBtn title="In đậm (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="In nghiêng (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Gạch chân (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Gạch ngang" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn title="Căn trái" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Căn giữa" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Căn phải" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Căn đều" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn title="Danh sách gạch đầu dòng" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Danh sách số thứ tự" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Trích dẫn" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Đường kẻ ngang" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Link */}
        <ToolBtn title="Chèn liên kết" active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="w-3.5 h-3.5" />
        </ToolBtn>
        {editor.isActive('link') && (
          <ToolBtn title="Xóa liên kết" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Link2Off className="w-3.5 h-3.5" />
          </ToolBtn>
        )}

        <Sep />

        {/* Text color */}
        <div className="relative group">
          <button
            type="button"
            title="Màu chữ"
            className="flex items-center justify-center w-7 h-7 rounded-md text-xs transition-all cursor-pointer text-slate-500 hover:bg-slate-100"
          >
            <span className="text-[11px] font-black" style={{ color: editor.getAttributes('textStyle').color || '#1e293b' }}>A</span>
          </button>
          <div className="absolute left-0 top-8 z-50 hidden group-hover:flex flex-col gap-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 min-w-[120px]">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-1 pb-1">Màu chữ</p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {TEXT_COLORS.map(({ label, color }) => (
                <button
                  key={color}
                  type="button"
                  title={label}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Highlight */}
        <div className="relative group">
          <button
            type="button"
            title="Tô nền"
            className="flex items-center justify-center w-7 h-7 rounded-md text-xs transition-all cursor-pointer text-slate-500 hover:bg-slate-100"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <div className="absolute left-0 top-8 z-50 hidden group-hover:flex flex-col gap-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 min-w-[120px]">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-1 pb-1">Tô nền</p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {HIGHLIGHT_COLORS.map(({ label, color }) => (
                <button
                  key={color}
                  type="button"
                  title={label}
                  onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                type="button"
                title="Xóa tô nền"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white shadow-sm hover:scale-110 transition-transform text-[8px] font-bold text-slate-400 cursor-pointer"
              >✕</button>
            </div>
          </div>
        </div>

      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
