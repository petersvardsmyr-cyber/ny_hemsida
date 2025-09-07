import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Trash2, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string;
  in_stock: boolean;
  featured: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ladda produkter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      const newCart = cart.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(newCart);
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      saveCart(newCart);
    }
    toast({
      title: "Tillagd i varukorg",
      description: `${product.title} har lagts till i din varukorg`,
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item =>
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  };

  const applyDiscount = () => {
    // Simple discount logic - in real app, validate against database
    if (discountCode.toLowerCase() === 'välkommen10') {
      setDiscountAmount(10);
      toast({
        title: "Rabattkod aktiverad!",
        description: "10% rabatt tillämpad",
      });
    } else {
      setDiscountAmount(0);
      toast({
        title: "Ogiltig rabattkod",
        description: "Rabattkoden kunde inte hittas",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = Math.round(subtotal * (discountAmount / 100));
    return {
      subtotal,
      discount,
      total: subtotal - discount
    };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const { subtotal, discount, total } = calculateTotal();
      
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: total,
        discount_amount: discount,
        discount_code: discountCode || null,
        email: 'guest@example.com' // Will be updated after Stripe checkout
      };

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: orderData
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab for better mobile UX
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Fel vid beställning",
        description: "Något gick fel. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const { subtotal, discount, total } = calculateTotal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-medium text-foreground">
            Butik
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingCart className="w-5 h-5" />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} varor</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
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
                    
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-muted-foreground line-through text-sm">
                            {product.original_price} kr
                          </span>
                        )}
                        <span className="text-primary font-medium text-lg">
                          {product.price} kr
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => addToCart(product)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Lägg till
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="font-heading font-medium text-xl mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Varukorg
                </h2>
                
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Din varukorg är tom
                  </p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 pb-4 border-b">
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            <p className="text-primary font-medium">{item.price} kr</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 p-0 text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Discount Code */}
                    <div className="mb-6">
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Rabattkod"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={applyDiscount}
                          className="flex items-center gap-1"
                        >
                          <Percent className="w-3 h-3" />
                        </Button>
                      </div>
                      {discountAmount > 0 && (
                        <p className="text-green-600 text-sm">
                          {discountAmount}% rabatt tillämpad
                        </p>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 mb-6 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Delsumma:</span>
                        <span>{subtotal} kr</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Rabatt:</span>
                          <span>-{discount} kr</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-lg pt-2 border-t">
                        <span>Totalt:</span>
                        <span>{total} kr</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full"
                      size="lg"
                    >
                      {isCheckingOut ? 'Bearbetar...' : 'Till kassan'}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Säker betalning via Stripe • Apple Pay stöds
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;