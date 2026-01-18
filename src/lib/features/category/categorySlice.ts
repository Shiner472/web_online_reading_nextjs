import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CategoryAPI from "api/categoryAPI";



export const getAllCategories = createAsyncThunk(
    "categories/fetchCategories",
    async () => {
        const res = await CategoryAPI.getAllCategories();
        return res.data;
    }
)


interface CategoriesState {
    list: any[];
    totalPages: number;
    selected: any | null;
    loading: boolean;
}

const initialState: CategoriesState = {
    list: [],
    totalPages: 1,
    selected: null,
    loading: false,
};

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        setSelectedCategory(state, action) {
            state.selected = action.payload;
        }
    },
    extraReducers(builder) {
        builder
            .addCase(getAllCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.list = action.payload;
            })
    },
});

export const { setSelectedCategory } = categoriesSlice.actions;

export default categoriesSlice.reducer;