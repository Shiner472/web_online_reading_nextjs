'use client';
import { faPaperPlane, faFaceSmile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NewsAPI from "api/newsAPI";
import CommentList from "components/comment/commentList";
import { useParams } from "next/navigation";
import React, { useState, memo, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { CommentAPI } from "api/commentAPI";
import AuthAPI from "api/authAPI";
import CategoryPage from "pages/category";
import NewsDetail from "pages/newsDetail";

type Reaction = { type: string; label: string; icon: string; color: string };
type Reply = { _id: string; author: string; content: string; reactions: Reaction | null; replies: Reply[] };
type Comment = { _id: string; author: string; content: string; reactions: Reaction | null; replies: Reply[] };

const PostDetail = () => {
    const params = useParams();
    const slugParam = params?.slug ?? "";
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const [checkPage, setCheckPage] = useState(false);

    const match = slug.match(/^(.+)-([a-zA-Z0-9]+)$/);
    useEffect(() => {
        if (match) {
            const id = match[2];
            const hasNumber = /\d/.test(id);
            if (hasNumber) {
                setCheckPage(true);
            }
        } else {
            setCheckPage(false);
        }
    }, [slug]);

    return (
        checkPage ? <NewsDetail /> : <CategoryPage />

    );
};

export default PostDetail;
