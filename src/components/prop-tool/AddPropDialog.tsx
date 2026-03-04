import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Priority } from '@/types/props';
import { parsePropsCSV, SAMPLE_CSV } from '@/lib/csvUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Download } from 'lucide-react';

interface Props {
  projectId: string;
}

export function AddPropDialog({ projectId }: Props) {
  const { dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [priority, setPriority] = useState<Priority>('medium');
  const [scene, setScene] = useState('');
  const [tags, setTags] = useState('');
  const [csv, setCsv] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddSingle = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_PROP',
      payload: {
        id: crypto.randomUUID(),
        projectId,
        propName: name.trim(),
        description: description.trim(),
        quantity: parseInt(quantity) || 1,
        priority,
        sceneOrReference: scene.trim(),
        treatmentDocUrl: '',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        searchQueryOverride: '',
        status: 'not_searched',
        createdAt: new Date().toISOString(),
      },
    });
    setName('');
    setDescription('');
    setQuantity('1');
    setPriority('medium');
    setScene('');
    setTags('');
    setOpen(false);
  };

  const handleImportCSV = () => {
    const props = parsePropsCSV(csv, projectId);
    if (props.length > 0) {
      dispatch({ type: 'ADD_PROPS', payload: props });
      setCsv('');
      setOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsv(reader.result as string);
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'props_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Prop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Props</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="single" className="pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="single" className="flex-1">Single Prop</TabsTrigger>
            <TabsTrigger value="import" className="flex-1">CSV Import</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label>Prop Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vintage Telephone" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Red rotary style, 1960s" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Scene / Reference</Label>
              <Input value={scene} onChange={e => setScene(e.target.value)} placeholder="Scene 3 – Office" />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="vintage, red, telephone" />
            </div>
            <Button onClick={handleAddSingle} disabled={!name.trim()} className="w-full">
              Add Prop
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-3 pt-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Upload CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadSample} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Sample CSV
              </Button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </div>
            <Textarea
              value={csv}
              onChange={e => setCsv(e.target.value)}
              placeholder="Paste CSV content here..."
              rows={8}
              className="font-mono text-xs"
            />
            <Button onClick={handleImportCSV} disabled={!csv.trim()} className="w-full">
              Import Props
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
