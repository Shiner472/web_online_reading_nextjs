import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface TodosState {
  list: Todo[];
}

const initialState: TodosState = {
  list: [],
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.list.push({
        id: Date.now(),
        text: action.payload,
        done: false,
      });
    },
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.list.find(t => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
    removeTodo: (state, action: PayloadAction<number>) => {
      state.list = state.list.filter(t => t.id !== action.payload);
    },
  },
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
