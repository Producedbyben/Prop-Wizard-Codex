import { useState } from 'react';
import { Prop } from '@/types/props';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from './StatusBadge';
import { Check, ExternalLink, Search, Star, Truck } from 'lucide-react';

interface Props {
  prop: Prop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropOptionsModal({ prop, open, onOpenChange }: Props) {
  const { getPropOptions, getSelectedOption, dispatch, searchProp } = useApp();
  const options = getPropOptions(prop.id);
  const selected = getSelectedOption(prop.id);
  const [queryOverride, setQueryOverride] = useState(prop.searchQueryOverride);

  const handleSaveOverride = () => {
    dispatch({
      type: 'UPDATE_PROP',
      payload: { id: prop.id, searchQueryOverride: queryOverride },
    });
  };

  const handleSearchWithOverride = async () => {
    handleSaveOverride();
    await searchProp({ ...prop, searchQueryOverride: queryOverride });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg">{prop.propName}</DialogTitle>
            <StatusBadge status={prop.status} />
          </div>
        </DialogHeader>

        {/* Prop Info */}
        <div className="space-y-3">
          {prop.description && <p className="text-sm text-muted-foreground">{prop.description}</p>}

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">Qty {prop.quantity}</Badge>
            <Badge variant="outline">{prop.priority} priority</Badge>
            {prop.sceneOrReference && <Badge variant="outline">📎 {prop.sceneOrReference}</Badge>}
            {prop.tags.map(t => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>

          {prop.treatmentDocUrl && (
            <a
              href={prop.treatmentDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" /> Open treatment doc
            </a>
          )}

          {/* Search override */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Search Query Override</Label>
              <Input
                value={queryOverride}
                onChange={e => setQueryOverride(e.target.value)}
                placeholder={prop.propName}
                className="h-8 text-sm"
              />
            </div>
            <Button
              size="sm"
              className="self-end h-8 gap-1.5"
              onClick={handleSearchWithOverride}
              disabled={prop.status === 'searching'}
            >
              <Search className="h-3 w-3" />
              {prop.status === 'searching' ? 'Searching…' : 'Search'}
            </Button>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Options */}
        <div>
          <h4 className="text-sm font-medium mb-3">
            {options.length > 0 ? `${options.length} Option${options.length > 1 ? 's' : ''} Found` : 'No options yet'}
          </h4>

          {prop.status === 'searching' && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="shimmer rounded-lg h-48" />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {options.map(option => {
              const isSelected = selected?.id === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() =>
                    dispatch(
                      isSelected
                        ? { type: 'DESELECT_OPTION', payload: prop.id }
                        : { type: 'SELECT_OPTION', payload: { propId: prop.id, optionId: option.id } }
                    )
                  }
                  className={`relative glass-card p-3 text-left transition-all hover:border-primary/40 ${
                    isSelected ? 'ring-2 ring-primary border-primary/50' : ''
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}

                  <img
                    src={option.imageUrl || '/placeholder.svg'}
                    alt={option.title}
                    className="w-full h-28 object-cover rounded-md mb-2"
                    loading="lazy"
                  />

                  <p className="text-xs font-medium line-clamp-2 mb-1">{option.title}</p>

                  <p className="text-lg font-bold text-primary">
                    {option.priceAmount > 0 ? `£${option.priceAmount.toFixed(2)}` : 'Price unavailable'}
                  </p>

                  {option.isPrime && (
                    <Badge className="bg-primary/15 text-primary text-[10px] mt-1">✓ Prime</Badge>
                  )}

                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    Next day delivery
                  </div>

                  {option.ratingStars && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {option.ratingStars.toFixed(1)} ({option.ratingCount})
                    </div>
                  )}

                  {option.merchantSoldBy && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Sold by {option.merchantSoldBy}
                    </p>
                  )}

                  <a
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] text-primary hover:underline mt-1 inline-flex items-center gap-0.5"
                  >
                    <ExternalLink className="h-2.5 w-2.5" /> View on Amazon
                  </a>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
