import { reactive } from 'vue';

// 定义 Store 接口
interface StoreType {
  monthHeaders: any[];
  weekHeaders: any[];
  dayHeaders: any[];
  hourHeaders: any[];
  tasks: any[];
  taskHeaders: any[];
  mapFields: Record<string, any>;
  scale: number;
  timelineCellCount: number;
  startGanttDate: Date | null;
  endGanttDate: Date | null;
  scrollFlag: boolean;
  mode: string | null;
  expandRow: {
    pid: number;
    expand: boolean;
  };
  rootTask: any;
  subTask: any;
  editTask: any;
  removeTask: any;
  allowChangeTaskDate: any;
  barDate: {
    id: string;
    startDate: string;
    endDate: string;
  };
}

// 初始状态
const initialStore: StoreType = {
  monthHeaders: [],
  weekHeaders: [],
  dayHeaders: [],
  hourHeaders: [],
  tasks: [],
  taskHeaders: [],
  mapFields: {},
  scale: 90,
  timelineCellCount: 0,
  startGanttDate: null,
  endGanttDate: null,
  scrollFlag: true,
  mode: null,
  expandRow: {
    pid: 0,
    expand: true
  },
  rootTask: {},
  subTask: {},
  editTask: {},
  removeTask: {},
  allowChangeTaskDate: {},
  barDate: {
    id: '',
    startDate: '',
    endDate: ''
  }
};

export let serialNumber: number = 0;
export let store = reactive(initialStore) as StoreType;

// 定义 Mutations 类型
interface MutationsType {
  setMonthHeaders: (monthHeaders: any[]) => void;
  setDayHeaders: (dayHeaders: any[]) => void;
  setTasks: (tasks: any[]) => void;
  setTaskHeaders: (taskHeaders: any[]) => void;
  setWeekHeaders: (weekHeaders: any[]) => void;
  setHourHeaders: (hourHeaders: any[]) => void;
  setScale: (scale: number) => void;
  setMapFields: (mapFields: Record<string, any>) => void;
  setTimelineCellCount: (timelineCellCount: number) => void;
  setStartGanttDate: (startGanttDate: Date | null) => void;
  setEndGanttDate: (endGanttDate: Date | null) => void;
  setScrollFlag: (scrollFlag: boolean) => void;
  setMode: (mode: string | null) => void;
  setExpandRow: (expandRow: { pid: number; expand: boolean }) => void;
  setRootTask: (rootTask: any) => void;
  setSubTask: (subTask: any) => void;
  setEditTask: (editTask: any) => void;
  setRemoveTask: (removeTask: any) => void;
  setBarDate: (barDate: { id: string; startDate: string; endDate: string }) => void;
  setAllowChangeTaskDate: (task: any) => void;
}

// 定义 Mutations
export let mutations: MutationsType = {
  setMonthHeaders(monthHeaders: any[]): void {
    store.monthHeaders = monthHeaders;
  },
  setDayHeaders(dayHeaders: any[]): void {
    store.dayHeaders = dayHeaders;
  },
  setTasks(tasks: any[]): void {
    store.tasks = tasks;
  },
  setTaskHeaders(taskHeaders: any[]): void {
    store.taskHeaders = taskHeaders;
  },
  setWeekHeaders(weekHeaders: any[]): void {
    store.weekHeaders = weekHeaders;
  },
  setHourHeaders(hourHeaders: any[]): void {
    store.hourHeaders = hourHeaders;
  },
  setScale(scale: number): void {
    store.scale = scale;
  },
  setMapFields(mapFields: Record<string, any>): void {
    store.mapFields = mapFields;
  },
  setTimelineCellCount(timelineCellCount: number): void {
    store.timelineCellCount = timelineCellCount;
  },
  setStartGanttDate(startGanttDate: Date | null): void {
    store.startGanttDate = startGanttDate;
  },
  setEndGanttDate(endGanttDate: Date | null): void {
    store.endGanttDate = endGanttDate;
  },
  setScrollFlag(scrollFlag: boolean): void {
    store.scrollFlag = scrollFlag;
  },
  setMode(mode: string | null): void {
    store.mode = mode;
  },
  setExpandRow(expandRow: { pid: number; expand: boolean }): void {
    store.expandRow = expandRow;
  },
  setRootTask(rootTask: any): void {
    store.rootTask = rootTask;
  },
  setSubTask(subTask: any): void {
    store.subTask = subTask;
  },
  setEditTask(editTask: any): void {
    store.editTask = editTask;
  },
  setRemoveTask(removeTask: any): void {
    store.removeTask = removeTask;
  },
  setBarDate(barDate: { id: string; startDate: string; endDate: string }): void {
    store.barDate = barDate;
  },
  setAllowChangeTaskDate(task: any): void {
    store.allowChangeTaskDate = task;
  }
};