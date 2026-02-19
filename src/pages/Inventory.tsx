import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Package, Plus, ShoppingCart, TrendingDown, AlertTriangle, Archive, History } from 'lucide-react';
import { format } from 'date-fns';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  initial_stock: number;
  current_stock: number;
  low_stock_threshold: number;
  cost_price: number;
  sell_price: number;
  created_at: string;
  total_purchased: number;
  total_sold: number;
}

interface Transaction {
  id: string;
  item_id: string;
  transaction_type: string;
  quantity: number;
  note: string | null;
  recorded_by: string;
  created_at: string;
  item_name?: string;
}

const CATEGORIES = ['Beverages', 'Stationery', 'Equipment', 'Food', 'General'];

const Inventory: React.FC = () => {
  const { user, role } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [txQuantity, setTxQuantity] = useState('');
  const [txNote, setTxNote] = useState('');

  const [newItem, setNewItem] = useState({
    name: '', category: 'General', unit: 'pieces',
    initial_stock: '', low_stock_threshold: '5',
    cost_price: '', sell_price: '',
  });

  const isAdmin = role === 'super_admin' || role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    const [itemsRes, txRes] = await Promise.all([
      supabase.from('inventory_items').select('*').order('name'),
      supabase.from('inventory_transactions').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    if (itemsRes.data && txRes.data) {
      const enriched = itemsRes.data.map((item: any) => {
        const itemTxs = txRes.data.filter((tx: any) => tx.item_id === item.id);
        const total_purchased = itemTxs.filter((t: any) => t.transaction_type === 'purchase').reduce((s: number, t: any) => s + t.quantity, 0);
        const total_sold = itemTxs.filter((t: any) => t.transaction_type === 'sale').reduce((s: number, t: any) => s + t.quantity, 0);
        return { ...item, total_purchased, total_sold };
      });
      setItems(enriched);

      const txsWithNames = txRes.data.map((tx: any) => ({
        ...tx,
        item_name: itemsRes.data.find((i: any) => i.id === tx.item_id)?.name || 'Unknown',
      }));
      setTransactions(txsWithNames);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddItem = async () => {
    if (!newItem.name) return toast({ title: 'Error', description: 'Item name is required', variant: 'destructive' });
    const stock = parseInt(newItem.initial_stock) || 0;
    const { error } = await supabase.from('inventory_items').insert({
      name: newItem.name, category: newItem.category, unit: newItem.unit,
      initial_stock: stock, current_stock: stock,
      low_stock_threshold: parseInt(newItem.low_stock_threshold) || 5,
      cost_price: parseFloat(newItem.cost_price) || 0,
      sell_price: parseFloat(newItem.sell_price) || 0,
    });
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Item added successfully' });
    setAddItemOpen(false);
    setNewItem({ name: '', category: 'General', unit: 'pieces', initial_stock: '', low_stock_threshold: '5', cost_price: '', sell_price: '' });
    fetchData();
  };

  const handleTransaction = async (type: 'purchase' | 'sale') => {
    if (!selectedItem || !txQuantity) return;
    const qty = parseInt(txQuantity);
    if (qty <= 0) return toast({ title: 'Error', description: 'Quantity must be positive', variant: 'destructive' });
    if (type === 'sale' && qty > selectedItem.current_stock) {
      return toast({ title: 'Error', description: 'Not enough stock', variant: 'destructive' });
    }

    const newStock = type === 'purchase' ? selectedItem.current_stock + qty : selectedItem.current_stock - qty;

    const [txRes, updateRes] = await Promise.all([
      supabase.from('inventory_transactions').insert({
        item_id: selectedItem.id, transaction_type: type,
        quantity: qty, note: txNote || null, recorded_by: user?.id,
      }),
      supabase.from('inventory_items').update({ current_stock: newStock }).eq('id', selectedItem.id),
    ]);

    if (txRes.error || updateRes.error) {
      return toast({ title: 'Error', description: txRes.error?.message || updateRes.error?.message, variant: 'destructive' });
    }

    toast({ title: type === 'purchase' ? 'Stock purchased' : 'Sale recorded' });
    setSellDialogOpen(false);
    setPurchaseDialogOpen(false);
    setTxQuantity('');
    setTxNote('');
    setSelectedItem(null);
    fetchData();
  };

  const lowStockItems = items.filter(i => i.current_stock <= i.low_stock_threshold);
  const outOfStock = items.filter(i => i.current_stock === 0);
  const totalValue = items.reduce((s, i) => s + i.current_stock * i.sell_price, 0);
  const totalCost = items.reduce((s, i) => s + i.current_stock * i.cost_price, 0);

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const, color: 'text-destructive' };
    if (item.current_stock <= item.low_stock_threshold) return { label: 'Low Stock', variant: 'secondary' as const, color: 'text-orange-500' };
    return { label: 'In Stock', variant: 'default' as const, color: 'text-emerald-500' };
  };

  const stockPercentage = (item: InventoryItem) => {
    const max = Math.max(item.initial_stock + item.total_purchased, item.current_stock, 1);
    return (item.current_stock / max) * 100;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Track stock, purchases, and sales</p>
          </div>
          {isAdmin && (
            <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Bottle Water" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Category</Label>
                      <Select value={newItem.category} onValueChange={v => setNewItem(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Unit</Label>
                      <Select value={newItem.unit} onValueChange={v => setNewItem(p => ({ ...p, unit: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['pieces', 'packs', 'cartons', 'boxes', 'units'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Initial Stock</Label><Input type="number" value={newItem.initial_stock} onChange={e => setNewItem(p => ({ ...p, initial_stock: e.target.value }))} /></div>
                    <div><Label>Low Stock Alert</Label><Input type="number" value={newItem.low_stock_threshold} onChange={e => setNewItem(p => ({ ...p, low_stock_threshold: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Cost Price (₦)</Label><Input type="number" value={newItem.cost_price} onChange={e => setNewItem(p => ({ ...p, cost_price: e.target.value }))} /></div>
                    <div><Label>Sell Price (₦)</Label><Input type="number" value={newItem.sell_price} onChange={e => setNewItem(p => ({ ...p, sell_price: e.target.value }))} /></div>
                  </div>
                  <Button className="w-full" onClick={handleAddItem}>Add Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Low Stock Warnings */}
        {lowStockItems.length > 0 && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-orange-500">Low Stock Warnings</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <Badge key={item.id} variant="outline" className="border-orange-500/50 text-orange-600">
                    {item.name}: {item.current_stock} {item.unit} remaining
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Package className="h-4 w-4" />Total Items</div>
            <p className="text-2xl font-bold text-foreground mt-1">{items.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><AlertTriangle className="h-4 w-4" />Low Stock</div>
            <p className="text-2xl font-bold text-orange-500 mt-1">{lowStockItems.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><TrendingDown className="h-4 w-4" />Out of Stock</div>
            <p className="text-2xl font-bold text-destructive mt-1">{outOfStock.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Archive className="h-4 w-4" />Stock Value</div>
            <p className="text-2xl font-bold text-foreground mt-1">₦{totalValue.toLocaleString()}</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="stock">
          <TabsList>
            <TabsTrigger value="stock">Current Stock</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <Card>
              <CardHeader><CardTitle>Inventory Items</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground text-center py-8">Loading...</p>
                ) : items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No inventory items yet. Add your first item!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Purchased</TableHead>
                          <TableHead className="text-right">Sold</TableHead>
                          <TableHead className="text-right">In Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => {
                          const status = getStockStatus(item);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">₦{item.sell_price} / {item.unit}</p>
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                              <TableCell className="text-right">{item.total_purchased}</TableCell>
                              <TableCell className="text-right">{item.total_sold}</TableCell>
                              <TableCell className="text-right">
                                <div className="space-y-1">
                                  <span className="font-semibold">{item.current_stock} {item.unit}</span>
                                  <Progress value={stockPercentage(item)} className="h-1.5" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setPurchaseDialogOpen(true); }}>
                                    <Plus className="h-3 w-3 mr-1" />Buy
                                  </Button>
                                  <Button size="sm" variant="secondary" onClick={() => { setSelectedItem(item); setSellDialogOpen(true); }}
                                    disabled={item.current_stock === 0}>
                                    <ShoppingCart className="h-3 w-3 mr-1" />Sell
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Recent Transactions</CardTitle></CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-muted-foreground text-sm">{format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                          <TableCell className="font-medium">{tx.item_name}</TableCell>
                          <TableCell>
                            <Badge variant={tx.transaction_type === 'purchase' ? 'default' : 'secondary'}>
                              {tx.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{tx.quantity}</TableCell>
                          <TableCell className="text-muted-foreground">{tx.note || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Purchase Dialog */}
        <Dialog open={purchaseDialogOpen} onOpenChange={v => { setPurchaseDialogOpen(v); if (!v) { setSelectedItem(null); setTxQuantity(''); setTxNote(''); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Purchase Stock: {selectedItem?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Current stock: {selectedItem?.current_stock} {selectedItem?.unit}</p>
              <div><Label>Quantity</Label><Input type="number" value={txQuantity} onChange={e => setTxQuantity(e.target.value)} placeholder="How many?" /></div>
              <div><Label>Note (optional)</Label><Input value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="e.g. Bought from vendor" /></div>
              <Button className="w-full" onClick={() => handleTransaction('purchase')}>Record Purchase</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sale Dialog */}
        <Dialog open={sellDialogOpen} onOpenChange={v => { setSellDialogOpen(v); if (!v) { setSelectedItem(null); setTxQuantity(''); setTxNote(''); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Sale: {selectedItem?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Available: {selectedItem?.current_stock} {selectedItem?.unit}</p>
              <div><Label>Quantity Sold</Label><Input type="number" value={txQuantity} onChange={e => setTxQuantity(e.target.value)} placeholder="How many sold?" max={selectedItem?.current_stock} /></div>
              <div><Label>Note (optional)</Label><Input value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="e.g. Sold to customer" /></div>
              <Button className="w-full" onClick={() => handleTransaction('sale')}>Record Sale</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
