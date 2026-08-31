import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { richTextEditorClass } from '@/utils/richTextClasses';

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'min-h-10 min-w-10 rounded-md p-2 transition-colors sm:min-h-0 sm:min-w-0 sm:p-1.5',
        active
          ? 'bg-primary-900 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-primary-900',
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  label,
  value = '',
  onChange,
  placeholder = 'Write content…',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary-700 underline' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: richTextEditorClass,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {editor && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/80 px-2 py-1.5">
            <ToolbarButton
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-slate-200" />
            <ToolbarButton
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-slate-200" />
            <ToolbarButton
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('link')} onClick={setLink} title="Link">
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-slate-200" />
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </ToolbarButton>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
