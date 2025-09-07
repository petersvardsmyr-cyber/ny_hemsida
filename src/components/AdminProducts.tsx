import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, ArrowUp, ArrowDown } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
}

const BOOK_VAT_RATE = 0.06;

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    in_stock: true,
    featured: false,
    sort_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Fel vid hämtning av produkter",
        description: "Kunde inte hämta produkter.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      in_stock: true,
      featured: false,
      sort_order: products.length
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      image_url: product.image_url,
      in_stock: product.in_stock,
      featured: product.featured,
      sort_order: product.sort_order
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.price || !formData.image_url) {
      toast({
        title: "Fyll i alla obligatoriska fält",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        title: formData.title,
        description: formData.description || null,
        price: parseInt(formData.price),
        original_price: formData.original_price ? parseInt(formData.original_price) : null,
        image_url: formData.image_url,
        in_stock: formData.in_stock,
        featured: formData.featured,
        sort_order: formData.sort_order
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({
          title: "Produkt uppdaterad",
          description: "Produkten har uppdaterats.",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast({
          title: "Produkt skapad",
          description: "Ny produkt har skapats.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Fel vid sparande",
        description: "Kunde inte spara produkten.",
        variant: "destructive",
      });
    }
  };

  const toggleInStock = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setProducts(products.map(product => 
        product.id === id ? { ...product, in_stock: !currentStatus } : product
      ));

      toast({
        title: currentStatus ? "Produkt dold" : "Produkt synlig",
        description: currentStatus ? "Produkten är nu dold från butiken." : "Produkten är nu synlig i butiken.",
      });
    } catch (error) {
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera produkten.",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setProducts(products.map(product => 
        product.id === id ? { ...product, featured: !currentStatus } : product
      ));

      toast({
        title: currentStatus ? "Inte längre populär" : "Markerad som populär",
      });
    } catch (error) {
      toast({
        title: "Fel vid uppdatering",
        variant: "destructive",
      });
    }
  };

  const updateSortOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ sort_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      toast({
        title: "Fel vid sortering",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string, title: string) => {
    if (!confirm(`Är du säker på att du vill radera "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(product => product.id !== id));
      toast({
        title: "Produkt raderad",
        description: "Produkten har raderats permanent.",
      });
    } catch (error) {
      toast({
        title: "Fel vid radering",
        description: "Kunde inte radera produkten.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Laddar produkter...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Produkter</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Ny produkt
        </Button>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Inga produkter än.</p>
                <Button onClick={openCreateDialog}>Skapa din första produkt</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{product.title}</CardTitle>
                      {!product.in_stock && <Badge variant="destructive">Dold</Badge>}
                      {product.featured && <Badge variant="default"><Star className="w-3 h-3 mr-1" />Populär</Badge>}
                    </div>
                    {product.description && (
                      <CardDescription>{product.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-muted-foreground line-through text-sm">
                            {Math.round(product.original_price * (1 + BOOK_VAT_RATE))} kr
                          </span>
                        )}
                        <span className="font-medium">
                          {Math.round(product.price * (1 + BOOK_VAT_RATE))} kr
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.price} kr ex moms)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateSortOrder(product.id, Math.max(0, product.sort_order - 1))}
                        disabled={product.sort_order === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">#{product.sort_order + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateSortOrder(product.id, product.sort_order + 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(product.id, product.featured)}
                    >
                      <Star className={`h-4 w-4 ${product.featured ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleInStock(product.id, product.in_stock)}
                    >
                      {product.in_stock ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProduct(product.id, product.title)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Redigera produkt' : 'Skapa ny produkt'}
            </DialogTitle>
            <DialogDescription>
              Fyll i produktinformationen nedan. Priser anges exklusive moms (6% läggs till automatiskt).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Bokens titel"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Beskrivning</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kort beskrivning av boken"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Pris (ex moms) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="9900"
                />
              </div>
              
              <div>
                <Label htmlFor="original_price">Ordinarie pris (ex moms)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="12900"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="image_url">Bild URL *</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="/lovable-uploads/..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
              />
              <Label htmlFor="in_stock">Visa i butik</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Markera som populär</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? 'Uppdatera' : 'Skapa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};