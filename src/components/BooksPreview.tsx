import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string;
  in_stock: boolean;
  featured: boolean;
  discount_active: boolean;
}

const BOOK_VAT_RATE = 0.06;

export const BooksPreview = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('sort_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    // Use discount price if active, otherwise use original price
    const effectivePrice = product.discount_active ? product.price : (product.original_price || product.price);
    const productWithEffectivePrice = { ...product, price: effectivePrice };
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.price = effectivePrice; // Update price in case discount status changed
    } else {
      cart.push({ ...productWithEffectivePrice, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    toast({
      title: "Tillagd i varukorg",
      description: `${product.title} har lagts till i din varukorg`,
    });
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-lg mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <Link key={product.id} to="/butik" className="block">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6">
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading font-medium text-lg text-foreground flex-1">
                    {product.title}
                  </h3>
                  {product.featured && (
                    <Badge variant="secondary" className="ml-2">Populär</Badge>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {product.discount_active && product.original_price ? (
                      <>
                        <span className="text-muted-foreground line-through text-sm">
                          {Math.round(product.original_price * (1 + BOOK_VAT_RATE))} kr
                        </span>
                        <span className="text-primary font-medium text-lg">
                          {Math.round(product.price * (1 + BOOK_VAT_RATE))} kr
                        </span>
                      </>
                    ) : (
                      <span className="text-primary font-medium text-lg">
                        {Math.round((product.original_price || product.price) * (1 + BOOK_VAT_RATE))} kr
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Lägg till
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="text-center">
        <Link to="/butik">
          <Button size="lg" className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Gå till varukorg
          </Button>
        </Link>
      </div>
    </div>
  );
};