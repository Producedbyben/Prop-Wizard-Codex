import { useState } from 'react';
import { Prop } from '@/types/props';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from './StatusBadge';
import { EditPropDialog } from './EditPropDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  prop: Prop;
  onViewOptions: () => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/15 text-primary',
  high: 'bg-warning/20 text-warning',
  urgent: 'bg-destructive/20 text-destructive',
};

export function PropCard({ prop, onViewOptions }: Props) {
  const { searchProp, getPropOptions, getSelectedOption, dispatch } = useApp();
  const options = getPropOptions(prop.id);
  const selected = getSelectedOption(prop.id);
  const isSearching = prop.status === 'searching';
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 flex flex-col gap-3 group hover:border-primary/30 transition-colors overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{prop.propName}</h3>
            {prop.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{prop.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <StatusBadge status={prop.status} />
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Qty {prop.quantity}
          </Badge>
          <Badge className={`text-[10px] px-1.5 py-0 ${PRIORITY_STYLES[prop.priority]}`}>
            {prop.priority}
          </Badge>
          {prop.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Scene ref */}
        {prop.sceneOrReference && (
          <p className="text-[11px] text-muted-foreground truncate">📎 {prop.sceneOrReference}</p>
        )}

        {/* Selected option preview */}
        {selected && (
          <div className="bg-success/10 border border-success/20 rounded-md p-2 flex items-center gap-2 min-w-0">
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{selected.title}</p>
              {selected.priceAmount > 0 && (
                <p className="text-[11px] text-success font-semibold">£{selected.priceAmount.toFixed(2)}</p>
              )}
            </div>
          </div>
        )}

        {/* Treatment link */}
        {prop.treatmentDocUrl && (
          <a
            href={prop.treatmentDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3 shrink-0" /> Treatment doc
          </a>
        )}

        {/* Actions - always at bottom */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 min-w-0 flex-1"
            onClick={() => searchProp(prop)}
            disabled={isSearching}
          >
            <Search className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {isSearching ? 'Searching…' : options.length > 0 ? 'Re-search' : 'Search'}
            </span>
          </Button>
          {options.length > 0 && (
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 min-w-0 flex-1"
              onClick={onViewOptions}
            >
              <Eye className="h-3 w-3 shrink-0" />
              <span className="truncate">Options ({options.length})</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{prop.propName}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the prop and all its search results. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => dispatch({ type: 'DELETE_PROP', payload: prop.id })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>

      <EditPropDialog prop={prop} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
