import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CreateProjectDialog } from '@/components/prop-tool/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Clapperboard, Trash2, ExternalLink, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const Index = () => {
  const { state, dispatch, getProjectProps } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Clapperboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">PropFinder</h1>
              <p className="text-xs text-muted-foreground">Film & Commercial Prop Sourcing</p>
            </div>
          </div>
          <CreateProjectDialog />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {state.projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 text-primary/60" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create your first project to start sourcing props from Amazon UK with next-day Prime delivery.
            </p>
            <CreateProjectDialog />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.projects.map((project, i) => {
              const props = getProjectProps(project.id);
              const searched = props.filter(p => p.status === 'options_found').length;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 flex flex-col gap-3 cursor-pointer hover:border-primary/30 transition-colors group"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        dispatch({ type: 'DELETE_PROJECT', payload: project.id });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {project.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{project.notes}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                    <span>{props.length} prop{props.length !== 1 ? 's' : ''}</span>
                    {props.length > 0 && <span>{searched}/{props.length} searched</span>}
                  </div>

                  {project.treatmentDocUrl && (
                    <a
                      href={project.treatmentDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Treatment
                    </a>
                  )}

                  <p className="text-[10px] text-muted-foreground/60">
                    {format(new Date(project.createdAt), 'dd MMM yyyy')}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
