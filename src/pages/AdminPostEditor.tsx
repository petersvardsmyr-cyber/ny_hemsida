import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Save, ArrowLeft, X, FileText } from 'lucide-react';

interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  featured_image_url: string;
  is_published: boolean;
  tags: string[];
  author: string;
  published_date: string;
}

export default function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<BlogPostData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    meta_description: '',
    featured_image_url: '',
    is_published: false,
    tags: [],
    author: 'Peter Svärdsmyr',
    published_date: new Date().toISOString().split('T')[0],
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchPost(id);
    }
  }, [id, isEditing]);

  const fetchPost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        meta_description: data.meta_description || '',
        featured_image_url: data.featured_image_url || '',
        is_published: data.is_published || false,
        tags: data.tags || [],
        author: data.author || 'Peter Svärdsmyr',
        published_date: data.published_date || new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast({
        title: "Fel vid hämtning av inlägg",
        description: "Kunde inte hämta inlägget.",
        variant: "destructive",
      });
      navigate('/admin');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && id) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Inlägg uppdaterat",
          description: "Blogginlägget har uppdaterats.",
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Inlägg skapat",
          description: "Nytt blogginlägg har skapats.",
        });
      }

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Fel vid sparande",
        description: error.message || "Kunde inte spara inlägget.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setLoading(true);

    try {
      const draftData = {
        ...formData,
        is_published: false,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...draftData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Utkast sparat",
          description: "Inlägget har sparats som utkast.",
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([draftData]);

        if (error) throw error;

        toast({
          title: "Utkast sparat",
          description: "Inlägget har sparats som utkast.",
        });
      }

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Fel vid sparande",
        description: error.message || "Kunde inte spara utkastet.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="self-start sm:self-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold flex-1">
          {isEditing ? 'Redigera inlägg' : 'Nytt blogginlägg'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Innehåll</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="Titel på blogginlägget"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL-slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-slug-for-inlagget"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Sammanfattning</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Kort sammanfattning av inlägget"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Innehåll *</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Skriv ditt blogginlägg här..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Publicering</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_published: checked }))
                    }
                  />
                  <Label htmlFor="published">Publicera inlägg</Label>
                </div>

                <div>
                  <Label htmlFor="published_date">Publiceringsdatum</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="author">Författare</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_description">Meta-beskrivning</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Beskrivning för sökmotorer (max 160 tecken)"
                    rows={3}
                    maxLength={160}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.meta_description.length}/160 tecken
                  </div>
                </div>

                <div>
                  <Label htmlFor="featured_image">Bild-URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                    placeholder="https://exempel.se/bild.jpg"
                  />
                  {formData.featured_image_url && (
                    <div className="mt-3">
                      <Label className="text-sm text-muted-foreground">Förhandsvisning</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden bg-muted/30">
                        <img
                          src={formData.featured_image_url}
                          alt="Förhandsvisning av bild"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = target.nextElementSibling as HTMLDivElement;
                            if (errorDiv) errorDiv.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                            const errorDiv = target.nextElementSibling as HTMLDivElement;
                            if (errorDiv) errorDiv.style.display = 'none';
                          }}
                        />
                        <div 
                          className="w-full h-48 hidden items-center justify-center text-muted-foreground bg-muted/50"
                          style={{ display: 'none' }}
                        >
                          <div className="text-center">
                            <p className="text-sm">Kunde inte ladda bilden</p>
                            <p className="text-xs">Kontrollera att URL:en är korrekt</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Taggar</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Lägg till tagg"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      Lägg till
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSaveAsDraft}
                disabled={loading || !formData.title || !formData.content}
              >
                <FileText className="mr-2 h-4 w-4" />
                Spara som utkast
              </Button>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.title || !formData.content}
              >
                {loading ? (
                  'Sparar...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Uppdatera inlägg' : 'Skapa inlägg'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}