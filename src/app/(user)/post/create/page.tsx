'use client';
import PostForm from "components/postForm/postForm";
import { useRouter } from "next/navigation"



const CreateNewsPage = () => {
  const router = useRouter();

  return (
    <PostForm
      mode="create"
      onSuccess={() => router.push("/my-news")}
    />
  );
};

export default CreateNewsPage;
