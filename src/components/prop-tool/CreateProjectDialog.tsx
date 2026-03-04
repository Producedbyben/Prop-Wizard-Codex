import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function CreateProjectDialog() {
  const { dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [treatmentUrl, setTreatmentUrl] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_PROJECT',
      payload: {
        id: crypto.randomUUID(),
        name: name.trim(),
        notes: notes.trim(),
        treatmentDocUrl: treatmentUrl.trim(),
        createdAt: new Date().toISOString(),
      },
    });
    setName('');
    setNotes('');
    setTreatmentUrl('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Summer Campaign 2026"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Treatment Doc URL</Label>
            <Input
              value={treatmentUrl}
              onChange={e => setTreatmentUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any production notes..."
              rows={3}
            />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full">
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
