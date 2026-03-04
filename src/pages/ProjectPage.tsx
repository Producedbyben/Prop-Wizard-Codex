import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Prop } from '@/types/props';
import { PropCard } from '@/components/prop-tool/PropCard';
import { PropOptionsModal } from '@/components/prop-tool/PropOptionsModal';
import { AddPropDialog } from '@/components/prop-tool/AddPropDialog';
import { PurchasingList } from '@/components/prop-tool/PurchasingList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clapperboard, Search, ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, getProjectProps, searchAllProps, getPurchaseItems } = useApp();
  const project = state.projects.find(p => p.id === id);
  const props = id ? getProjectProps(id) : [];
  const purchaseItems = id ? getPurchaseItems(id) : [];
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);
  const [searchingAll, setSearchingAll] = useState(false);

  if (!project || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleSearchAll = async () => {
    setSearchingAll(true);
    await searchAllProps(id);
    setSearchingAll(false);
  };

  const searchingCount = props.filter(p => p.status === 'searching').length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Clapperboard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold">{project.name}</h1>
              {project.notes && <p className="text-xs text-muted-foreground">{project.notes}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddPropDialog projectId={id} />
            {props.length > 0 && (
              <Button
                onClick={handleSearchAll}
                disabled={searchingAll}
                className="gap-1.5"
              >
                {searchingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {searchingAll ? `Searching (${searchingCount})…` : 'Search All'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="props">
          <TabsList className="mb-6">
            <TabsTrigger value="props" className="gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Props ({props.length})
            </TabsTrigger>
            <TabsTrigger value="purchasing" className="gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              Purchasing ({purchaseItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="props">
            {props.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-16 text-muted-foreground"
              >
                <p className="text-sm mb-2">No props added yet</p>
                <p className="text-xs mb-4">Add props manually or import from a CSV file</p>
                <AddPropDialog projectId={id} />
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {props.map(prop => (
                  <PropCard
                    key={prop.id}
                    prop={prop}
                    onViewOptions={() => setSelectedProp(prop)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchasing">
            <PurchasingList projectId={id} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Options Modal */}
      {selectedProp && (
        <PropOptionsModal
          prop={selectedProp}
          open={!!selectedProp}
          onOpenChange={open => !open && setSelectedProp(null)}
        />
      )}
    </div>
  );
}
