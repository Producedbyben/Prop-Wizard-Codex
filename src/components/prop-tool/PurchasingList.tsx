import { useApp } from '@/context/AppContext';
import { exportPurchasingCSV } from '@/lib/csvUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, ExternalLink, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  projectId: string;
}

export function PurchasingList({ projectId }: Props) {
  const { getPurchaseItems } = useApp();
  const items = getPurchaseItems(projectId);

  const grandTotal = items.reduce((sum, { prop, option }) => sum + option.priceAmount * prop.quantity, 0);

  const handleExportCSV = () => {
    const csv = exportPurchasingCSV(items);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchasing_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handleCopyToClipboard = () => {
    const text = items
      .map(
        ({ prop, option }) =>
          `${prop.propName} — ${option.title} — £${option.priceAmount.toFixed(2)} × ${prop.quantity} = £${(option.priceAmount * prop.quantity).toFixed(2)} — ${option.url}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShoppingCart className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No items selected yet</p>
        <p className="text-xs mt-1">Select options from your prop cards to build a purchasing list</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" /> Copy
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Items */}
      <div className="glass-card divide-y divide-border">
        {items.map(({ prop, option }) => (
          <div key={prop.id} className="p-3 flex items-center gap-3">
            <img src={option.imageUrl} alt="" className="h-12 w-12 rounded object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{prop.propName}</p>
              <p className="text-xs text-muted-foreground truncate">{option.title}</p>
            </div>
            <div className="text-right flex-shrink-0 space-y-0.5">
              <p className="text-xs text-muted-foreground">
                £{option.priceAmount.toFixed(2)} × {prop.quantity}
              </p>
              <p className="text-sm font-semibold text-primary">
                £{(option.priceAmount * prop.quantity).toFixed(2)}
              </p>
            </div>
            <div className="flex-shrink-0 text-right space-y-0.5">
              <Badge className="bg-primary/15 text-primary text-[10px]">Prime</Badge>
              <p className="text-[10px] text-muted-foreground">{option.expectedDeliveryIso}</p>
            </div>
            <a
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between items-center px-1">
        <p className="text-sm text-muted-foreground">{items.length} item{items.length > 1 ? 's' : ''}</p>
        <p className="text-lg font-bold">
          Total: <span className="text-primary">£{grandTotal.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}
