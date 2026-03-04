import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Project, Prop, PropOption, PropStatus } from '@/types/props';
import { searchPropOptions } from '@/lib/searchProvider';

// ─── State ───────────────────────────────────────────────
interface AppState {
  projects: Project[];
  props: Prop[];
  propOptions: PropOption[];
  selectedOptions: Record<string, string>; // propId → optionId
}

const STORAGE_KEY = 'propfinder_state';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { projects: [], props: [], propOptions: [], selectedOptions: {} };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Actions ─────────────────────────────────────────────
type Action =
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_PROP'; payload: Prop }
  | { type: 'ADD_PROPS'; payload: Prop[] }
  | { type: 'DELETE_PROP'; payload: string }
  | { type: 'UPDATE_PROP'; payload: Partial<Prop> & { id: string } }
  | { type: 'SET_PROP_STATUS'; payload: { propId: string; status: PropStatus } }
  | { type: 'SET_PROP_OPTIONS'; payload: { propId: string; options: PropOption[] } }
  | { type: 'SELECT_OPTION'; payload: { propId: string; optionId: string } }
  | { type: 'DESELECT_OPTION'; payload: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'DELETE_PROJECT': {
      const propIds = state.props.filter(p => p.projectId === action.payload).map(p => p.id);
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        props: state.props.filter(p => p.projectId !== action.payload),
        propOptions: state.propOptions.filter(o => !propIds.includes(o.propId)),
        selectedOptions: Object.fromEntries(
          Object.entries(state.selectedOptions).filter(([k]) => !propIds.includes(k))
        ),
      };
    }
    case 'ADD_PROP':
      return { ...state, props: [...state.props, action.payload] };
    case 'ADD_PROPS':
      return { ...state, props: [...state.props, ...action.payload] };
    case 'DELETE_PROP':
      return {
        ...state,
        props: state.props.filter(p => p.id !== action.payload),
        propOptions: state.propOptions.filter(o => o.propId !== action.payload),
        selectedOptions: Object.fromEntries(
          Object.entries(state.selectedOptions).filter(([k]) => k !== action.payload)
        ),
      };
    case 'UPDATE_PROP':
      return {
        ...state,
        props: state.props.map(p => (p.id === action.payload.id ? { ...p, ...action.payload } : p)),
      };
    case 'SET_PROP_STATUS':
      return {
        ...state,
        props: state.props.map(p =>
          p.id === action.payload.propId ? { ...p, status: action.payload.status } : p
        ),
      };
    case 'SET_PROP_OPTIONS':
      return {
        ...state,
        propOptions: [
          ...state.propOptions.filter(o => o.propId !== action.payload.propId),
          ...action.payload.options,
        ],
      };
    case 'SELECT_OPTION':
      return {
        ...state,
        selectedOptions: { ...state.selectedOptions, [action.payload.propId]: action.payload.optionId },
      };
    case 'DESELECT_OPTION': {
      const { [action.payload]: _, ...rest } = state.selectedOptions;
      return { ...state, selectedOptions: rest };
    }
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  searchProp: (prop: Prop) => Promise<void>;
  searchAllProps: (projectId: string) => Promise<void>;
  getProjectProps: (projectId: string) => Prop[];
  getPropOptions: (propId: string) => PropOption[];
  getSelectedOption: (propId: string) => PropOption | undefined;
  getPurchaseItems: (projectId: string) => { prop: Prop; option: PropOption }[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const searchPropFn = useCallback(
    async (prop: Prop) => {
      dispatch({ type: 'SET_PROP_STATUS', payload: { propId: prop.id, status: 'searching' } });

      try {
        const result = await searchPropOptions(
          prop.propName,
          prop.description,
          prop.tags,
          prop.searchQueryOverride || undefined
        );

        const options: PropOption[] = result.options
          .filter(r => r.inStock !== false)
          .map(r => ({
            ...r,
            propId: prop.id,
            selected: false,
            createdAt: new Date().toISOString(),
          }));

        dispatch({ type: 'SET_PROP_OPTIONS', payload: { propId: prop.id, options } });
        dispatch({
          type: 'SET_PROP_STATUS',
          payload: { propId: prop.id, status: options.length > 0 ? 'options_found' : 'no_results' },
        });
      } catch {
        dispatch({ type: 'SET_PROP_STATUS', payload: { propId: prop.id, status: 'no_results' } });
      }
    },
    [dispatch]
  );

  const searchAllProps = useCallback(
    async (projectId: string) => {
      const projectProps = state.props.filter(p => p.projectId === projectId);
      for (const prop of projectProps) {
        await searchPropFn(prop);
      }
    },
    [state.props, searchPropFn]
  );

  const getProjectProps = useCallback(
    (projectId: string) => state.props.filter(p => p.projectId === projectId),
    [state.props]
  );

  const getPropOptions = useCallback(
    (propId: string) => state.propOptions.filter(o => o.propId === propId),
    [state.propOptions]
  );

  const getSelectedOption = useCallback(
    (propId: string) => {
      const optionId = state.selectedOptions[propId];
      return optionId ? state.propOptions.find(o => o.id === optionId) : undefined;
    },
    [state.selectedOptions, state.propOptions]
  );

  const getPurchaseItems = useCallback(
    (projectId: string) => {
      const projectProps = state.props.filter(p => p.projectId === projectId);
      return projectProps
        .map(prop => {
          const option = getSelectedOption(prop.id);
          return option ? { prop, option } : null;
        })
        .filter(Boolean) as { prop: Prop; option: PropOption }[];
    },
    [state.props, getSelectedOption]
  );

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        searchProp: searchPropFn,
        searchAllProps,
        getProjectProps,
        getPropOptions,
        getSelectedOption,
        getPurchaseItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
