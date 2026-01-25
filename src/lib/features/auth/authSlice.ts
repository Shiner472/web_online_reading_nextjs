import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AuthAPI from "api/authAPI";
import Cookies from "js-cookie";



export const getMe = createAsyncThunk(
    "auth/getMe",
    async (token: string) => {
        const res = await AuthAPI.getMe({ token });
        return res.data;
    }

)

export const loginRedux = createAsyncThunk(
    "auth/login",
    async (payload: any) => {
        const res = await AuthAPI.login(payload);
         const token = res.data.token;
            localStorage.setItem('token', token);
            Cookies.set('token', token, { expires: 7 });
        return res.data;
    }
)

export const registerRedux = createAsyncThunk(
    "auth/register",
    async (payload: any) => {
        const res = await AuthAPI.register(payload);
        return res.data;
    }
)

interface AuthState {
    user: any;
    dataLogin: any;
    dataRegister: any;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    dataLogin: null,
    dataRegister: null,
    loading: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(getMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(loginRedux.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginRedux.fulfilled, (state, action) => {
                state.dataLogin = action.payload;
                state.loading = false;
            })
            .addCase(registerRedux.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerRedux.fulfilled, (state, action) => {
                state.dataRegister = action.payload;
                state.loading = false;
            })
    },
})

export default authSlice.reducer;