import { configureStore } from "@reduxjs/toolkit"
import todosReducer from "../lib/features/todos/todoSlice"
import articlesReducer from "../lib/features/articles/articlesSlice"
import categoriesReducer from "../lib/features/category/categorySlice"
import authReducer from "../lib/features/auth/authSlice"
import commentReducer from "../lib/features/comment/commentSlice"

export const makeStore = () => {

    return configureStore({
        reducer: {
            todos: todosReducer,
            articles: articlesReducer,
            categories: categoriesReducer,
            auth: authReducer,
            comments: commentReducer
        },
    })
}


export type AppStore = ReturnType<typeof makeStore>

export type RootState = ReturnType<AppStore["getState"]>

export type AppDispatch = AppStore["dispatch"]