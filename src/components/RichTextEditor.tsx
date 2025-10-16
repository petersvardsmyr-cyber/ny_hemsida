import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Heading3, Upload, AlignLeft, AlignCenter, AlignRight, AlignJustify, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Börja skriva..." }: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [imageWidth, setImageWidth] = useState('100');
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right'>('center');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Image.configure({
        inline: true,
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
        insertImageWithSettings(imageUrl);
      };
      img.onerror = () => {
        toast.error('Kunde inte ladda bilden. Kontrollera URL:en.');
      };
      img.src = imageUrl;
    }
  };

  const insertImageWithSettings = (src: string) => {
    const widthPercent = parseInt(imageWidth);
    const alignStyle = imageAlign === 'center' ? 'display: block; margin-left: auto; margin-right: auto;' : 
                       imageAlign === 'right' ? 'display: block; margin-left: auto;' : 
                       'display: block;';
    
    // Insert as HTML to allow custom styling
    const imageHtml = `<img src="${src}" style="width: ${widthPercent}%; height: auto; ${alignStyle} border-radius: 0.5rem;" alt="Bild" />`;
    editor.chain().focus().insertContent(imageHtml).run();
    
    setImageUrl('');
    setShowImageDialog(false);
    toast.success('Bild tillagd!');
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
        insertImageWithSettings(dataUrl);
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
          <div className="space-y-4">
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

            {/* Image Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image-width" className="text-sm font-medium mb-2 block">Bredd (%)</Label>
                <Select value={imageWidth} onValueChange={setImageWidth}>
                  <SelectTrigger id="image-width">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="33">33%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="66">66%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image-align" className="text-sm font-medium mb-2 block">Justering</Label>
                <Select value={imageAlign} onValueChange={(value: 'left' | 'center' | 'right') => setImageAlign(value)}>
                  <SelectTrigger id="image-align">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Vänster</SelectItem>
                    <SelectItem value="center">Centrerad</SelectItem>
                    <SelectItem value="right">Höger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Image Preview */}
            {imageUrl && (
              <div className="border border-input rounded-md p-2 bg-background">
                <p className="text-xs text-muted-foreground mb-2">Förhandsgranskning:</p>
                <div className={imageAlign === 'center' ? 'flex justify-center' : imageAlign === 'right' ? 'flex justify-end' : ''}>
                  <img 
                    src={imageUrl} 
                    alt="Förhandsgranskning" 
                    style={{ width: `${imageWidth}%` }}
                    className="h-auto max-h-48 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
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