import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, Package, Calendar, CreditCard, Mail, Truck, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Order {
  id: string;
  created_at: string;
  email: string;
  total_amount: number;
  discount_amount: number;
  discount_code: string | null;
  status: string;
  items: any;
  shipping_address: any;
  stripe_session_id: string;
  shipped_at?: string;
  shipping_tracking_number?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isShipping, setIsShipping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Fel vid hämtning av beställningar",
        description: "Kunde inte hämta beställningarna.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShipOrder = async () => {
    if (!shippingOrder) return;
    
    setIsShipping(true);
    try {
      const { error } = await supabase.functions.invoke('ship-order', {
        body: {
          order_id: shippingOrder.id,
          tracking_number: trackingNumber.trim() || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Beställning skickad",
        description: "Kunden har informerats via e-post om att beställningen är skickad.",
      });

      // Reset form
      setShippingOrder(null);
      setTrackingNumber('');
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error shipping order:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skicka beställningen. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsShipping(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Väntande', variant: 'secondary' as const },
      paid: { label: 'Betald', variant: 'default' as const },
      shipped: { label: 'Skickad', variant: 'default' as const },
      completed: { label: 'Slutförd', variant: 'default' as const },
      cancelled: { label: 'Avbruten', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Beställningar</h1>
        <div>Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Beställningar</h1>
        <Button onClick={fetchOrders} variant="outline">
          Uppdatera
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Inga beställningar än</h3>
              <p className="text-muted-foreground">
                Beställningar kommer att visas här när kunder genomför köp.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      Beställning #{order.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    {getStatusBadge(order.status)}
                    <div className="text-lg font-semibold">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{order.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{Array.isArray(order.items) ? order.items.length : 0} produkter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Stripe</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    {order.status === 'paid' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => setShippingOrder(order)}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Skicka
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Markera som skickad</DialogTitle>
                            <DialogDescription>
                              Beställning #{order.id.slice(0, 8)} kommer att markeras som skickad och kunden får ett bekräftelsemail.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="tracking">Spårningsnummer (valfritt)</Label>
                              <Input
                                id="tracking"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="T.ex. 1234567890"
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShippingOrder(null);
                                  setTrackingNumber('');
                                }}
                              >
                                Avbryt
                              </Button>
                              <Button 
                                onClick={handleShipOrder}
                                disabled={isShipping}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {isShipping ? 'Skickar...' : 'Skicka beställning'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visa detaljer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Beställning #{selectedOrder?.id.slice(0, 8)}
                          </DialogTitle>
                          <DialogDescription>
                            Skapad {selectedOrder && formatDate(selectedOrder.created_at)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedOrder && (
                          <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <h4 className="font-medium mb-2">Kundinfo</h4>
                                <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                              </div>
                            <div>
                              <h4 className="font-medium mb-2">Status</h4>
                              {getStatusBadge(selectedOrder.status)}
                              {selectedOrder.shipped_at && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Skickad: {formatDate(selectedOrder.shipped_at)}
                                </p>
                              )}
                            </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Produkter</h4>
                              <div className="space-y-2">
                                {Array.isArray(selectedOrder.items) && selectedOrder.items?.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                                    <span>{item.title}</span>
                                    <div className="text-right">
                                      <div>{item.quantity} st</div>
                                      <div className="text-sm text-muted-foreground">
                                        {formatCurrency(item.price * 100)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {selectedOrder.shipping_address && (
                              <div>
                                <h4 className="font-medium mb-2">Leveransadress</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>{selectedOrder.shipping_address.name}</p>
                                  <p>{selectedOrder.shipping_address.region}</p>
                                  <p>{formatCurrency(selectedOrder.shipping_address.price_ex_vat * 100)} + moms</p>
                                </div>
                              </div>
                            )}

                            <div className="border-t pt-4">
                              <div className="space-y-2">
                                {selectedOrder.discount_amount > 0 && (
                                  <div className="flex justify-between">
                                    <span>Rabatt ({selectedOrder.discount_code})</span>
                                    <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium">
                                  <span>Totalt</span>
                                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                                </div>
                              </div>
                            </div>

                            {selectedOrder.shipping_tracking_number && (
                              <div>
                                <h4 className="font-medium mb-2">Spårningsnummer</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedOrder.shipping_tracking_number}
                                </p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Stripe Session ID</h4>
                              <p className="text-xs text-muted-foreground font-mono break-all">
                                {selectedOrder.stripe_session_id}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}