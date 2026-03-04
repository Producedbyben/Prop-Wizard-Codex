import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Prop, Priority } from '@/types/props';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

interface Props {
  prop: Prop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPropDialog({ prop, open, onOpenChange }: Props) {
  const { dispatch } = useApp();
  const [name, setName] = useState(prop.propName);
  const [description, setDescription] = useState(prop.description);
  const [quantity, setQuantity] = useState(String(prop.quantity));
  const [priority, setPriority] = useState<Priority>(prop.priority);
  const [scene, setScene] = useState(prop.sceneOrReference);
  const [tags, setTags] = useState(prop.tags.join(', '));
  const [searchOverride, setSearchOverride] = useState(prop.searchQueryOverride);
  const [treatmentUrl, setTreatmentUrl] = useState(prop.treatmentDocUrl);

  useEffect(() => {
    setName(prop.propName);
    setDescription(prop.description);
    setQuantity(String(prop.quantity));
    setPriority(prop.priority);
    setScene(prop.sceneOrReference);
    setTags(prop.tags.join(', '));
    setSearchOverride(prop.searchQueryOverride);
    setTreatmentUrl(prop.treatmentDocUrl);
  }, [prop]);

  const handleSave = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'UPDATE_PROP',
      payload: {
        id: prop.id,
        propName: name.trim(),
        description: description.trim(),
        quantity: parseInt(quantity) || 1,
        priority,
        sceneOrReference: scene.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        searchQueryOverride: searchOverride.trim(),
        treatmentDocUrl: treatmentUrl.trim(),
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Prop</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label>Prop Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
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
            <Input value={scene} onChange={e => setScene(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tags (comma separated)</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Search Query Override</Label>
            <Input value={searchOverride} onChange={e => setSearchOverride(e.target.value)} placeholder="Leave empty to use prop name + description" />
          </div>
          <div className="space-y-1.5">
            <Label>Treatment Doc URL</Label>
            <Input value={treatmentUrl} onChange={e => setTreatmentUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button onClick={handleSave} disabled={!name.trim()} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
