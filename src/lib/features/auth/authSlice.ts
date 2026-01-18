import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AuthAPI from "api/authAPI";




export const getMe = createAsyncThunk(
    "auth/getMe",
    async (token: string) => {
        const res = await AuthAPI.getMe({ token });
        return res.data;
    }

)

interface AuthState {
    user: any;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    loading: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

    },
    extraReducers(builder) {
        builder
            .addCase(getMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
    },
})

export default authSlice.reducer;