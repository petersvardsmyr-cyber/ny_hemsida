import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Heading3, Upload, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div');
      container.className = 'image-resizer-container';
      container.style.cssText = 'position: relative; display: inline-block; max-width: 100%; margin: 1rem 0;';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.className = 'rounded-lg';
      img.style.cssText = 'display: block; max-width: 100%; height: auto; cursor: pointer;';
      
      if (node.attrs.width) {
        img.style.width = `${node.attrs.width}px`;
      }

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background: hsl(var(--primary));
        border: 2px solid white;
        border-radius: 50%;
        cursor: nwse-resize;
        display: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;

      container.appendChild(img);
      container.appendChild(resizeHandle);

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      container.addEventListener('mouseenter', () => {
        if (editor.isEditable) {
          resizeHandle.style.display = 'block';
        }
      });

      container.addEventListener('mouseleave', () => {
        if (!isResizing) {
          resizeHandle.style.display = 'none';
        }
      });

      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startWidth = img.offsetWidth;

        const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;
          const deltaX = e.clientX - startX;
          const newWidth = Math.max(100, Math.min(startWidth + deltaX, container.parentElement?.offsetWidth || 800));
          img.style.width = `${newWidth}px`;
        };

        const handleMouseUp = () => {
          if (isResizing) {
            isResizing = false;
            resizeHandle.style.display = 'none';
            
            const pos = getPos();
            if (typeof pos === 'number') {
              editor.commands.updateAttributes('image', {
                width: img.offsetWidth,
              });
            }
          }
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') {
            return false;
          }
          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.width) {
            img.style.width = `${updatedNode.attrs.width}px`;
          }
          return true;
        },
      };
    };
  },
});

export function RichTextEditor({ content, onChange, placeholder = "Börja skriva..." }: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-4 text-foreground',
        style: 'color: hsl(var(--foreground));',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const addImageFromUrl = () => {
    if (imageUrl) {
      const img = document.createElement('img');
      img.onload = () => {
        editor.chain().focus().setImage({ src: imageUrl }).run();
        setImageUrl('');
        setShowImageDialog(false);
        toast.success('Bild tillagd! Dra i den blå cirkeln i nedre högra hörnet för att ändra storlek.');
      };
      img.onerror = () => {
        toast.error('Kunde inte ladda bilden. Kontrollera URL:en.');
      };
      img.src = imageUrl;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Bilden är för stor. Max 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        editor.chain().focus().setImage({ src: dataUrl }).run();
        toast.success('Bild tillagd! Dra i den blå cirkeln i nedre högra hörnet för att ändra storlek.');
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    const url = window.prompt('Ange länk-URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <div className="border-b border-input p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(!showImageDialog)}
          className={showImageDialog ? 'bg-muted' : ''}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Image URL Dialog */}
      {showImageDialog && (
        <div className="border-b border-input p-4 bg-muted/50">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="image-url" className="text-sm font-medium mb-2 block">Bild-URL</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://exempel.se/bild.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageFromUrl();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={addImageFromUrl}
              disabled={!imageUrl}
            >
              Lägg till
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowImageDialog(false);
                setImageUrl('');
              }}
            >
              Avbryt
            </Button>
          </div>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="bg-background min-h-[300px] [&_.ProseMirror]:text-foreground [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:text-foreground [&_.ProseMirror_h1]:text-foreground [&_.ProseMirror_h2]:text-foreground [&_.ProseMirror_h3]:text-foreground [&_.ProseMirror_strong]:text-foreground [&_.ProseMirror_em]:text-foreground [&_.ProseMirror_img]:my-4"
      />
    </div>
  );
}