"use client";
import { useEffect, useState } from "react";
import LayoutMainPage from "./layout";
import NewsAPI from "api/newsAPI";
import CategoryAPI from "api/categoryAPI";

const HomeUserPage = () => {
  const [listLatestNews, setListLatestNews] = useState<any[]>([]);
  const [listMostReadNews, setListMostReadNews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryNews, setCategoryNews] = useState<Record<any, any>>({});
  const [featuredNews, setFeaturedNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const catRes = await CategoryAPI.getAllCategories();
      setCategories(catRes.data);

      const promises = catRes.data.map(async (cat: any) => {
        const newsRes = await NewsAPI.GetNewsBySlug(cat.slug);
        const hasTopStory = newsRes.data?.topStory
        const hasHighlight = newsRes.data.highlightArticles.length > 0;
        if (hasTopStory || hasHighlight) {
          return { [cat.name.vi]: newsRes.data };
        }

        return null;
      });

      const results = await Promise.all(promises);

      // Gộp kết quả, bỏ qua null
      const merged = results.reduce((acc, cur) => {
        if (cur) {
          return { ...acc, ...cur };
        }
        return acc;
      }, {});

      setCategoryNews(merged);
    };

    fetchData();
  }, []);


  useEffect(() => {
    NewsAPI.GetLastestNews(5).then((res) => {
      setListLatestNews(res.data);
    });
    NewsAPI.GetTopViewedNews({ limit: 5 }).then((res) => {
      setListMostReadNews(res.data);
    });
    NewsAPI.GetFeaturedNews(5).then((res) => {
      setFeaturedNews(res.data);
    });
  }, []);
  return (
    <LayoutMainPage>
      <main className="pt-6 px-4 md:px-8 max-w-7xl mx-auto bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột chính */}
          <div className="md:col-span-2 space-y-12">
            {/* Tin nổi bật */}
            <section className="grid md:grid-cols-2 gap-4 border-b pb-6">
              {featuredNews[0] && (
                <div>
                  <img
                    src={featuredNews[0].featuredImage || "https://via.placeholder.com/800x500"}
                    alt={featuredNews[0].title}
                    className="w-full h-64 object-cover rounded"
                  />
                  <a href={`/${featuredNews[0]?.slug}`}>
                    <h2 className="text-2xl font-bold mt-3 hover:text-blue-600 cursor-pointer">
                      {featuredNews[0].title}
                    </h2>
                  </a>
                  <p className="text-gray-600 mt-2">{featuredNews[0].summary}</p>
                </div>
              )}

              {/* Các bài còn lại */}
              <div className="space-y-4">
                {featuredNews.slice(1).map((news) => (
                  <a href={`/${news?.slug}`}>
                    <h3
                      key={news._id}
                      className="hover:text-blue-600 cursor-pointer font-semibold"
                    >
                      {news.title}
                    </h3>
                  </a>
                ))}
              </div>
            </section>


            {Object.entries(categoryNews).map(([key, newsData], i) => {

              return (
                <section key={i}>
                  <h2 className="text-xl font-bold mb-3 border-b pb-2">{key}</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <img
                        src={newsData.topStory?.featuredImage}
                        alt={newsData.topStory?.title}
                        className="w-full h-64 object-cover rounded"
                      />
                      <a href={`/${newsData.topStory?.slug}`}>
                        <h3 className="mt-2 font-semibold hover:text-blue-600 cursor-pointer">
                          {newsData.topStory?.title}
                        </h3>
                      </a>
                      <p className="text-sm text-gray-600">{newsData.topStory?.summary}</p>
                    </div>
                    <div className="space-y-2">
                      {newsData.highlightArticles?.map((article: any, idx: number) => (
                        <h4 key={idx} className="hover:text-blue-600 cursor-pointer">{article.title}</h4>
                      ))}
                    </div>
                  </div>
                </section>
              )
            })}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Tin mới nhất */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Tin mới</h3>
              <ul className="space-y-3 text-sm">
                {listLatestNews.map((news) => (
                  <li key={news._id} className="flex gap-2">
                    <img src={news.featuredImage || "https://source.unsplash.com/100x70/?news"} alt="tin" className="rounded w-24 h-16 object-cover" />
                    <a href={`/${news.slug}`} className="hover:text-blue-600 flex-1">{news.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tin đọc nhiều */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Tin đọc nhiều</h3>
              <ul className="space-y-3 text-sm list-decimal list-inside">
                {listMostReadNews.map((news) => (
                  <li key={news._id} className="flex gap-2">
                    <img src={news.featuredImage || "https://source.unsplash.com/100x70/?news"} alt="tin" className="rounded w-24 h-16 object-cover" />
                    <a href={`/${news.slug}`} className="hover:text-blue-600 flex-1">{news.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Góc nhìn */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Góc nhìn</h3>
              <div className="flex gap-3">
                <div className="w-24 h-16 flex-shrink-0">
                  <img
                    src="https://source.unsplash.com/100x70/?opinion,thinking"
                    alt="gocnhin"
                    className="rounded w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-700 italic">
                    "Làm sao để báo chí số hóa nhưng vẫn giữ được giá trị truyền thống?"
                  </p>
                  <a href="#" className="text-blue-600 text-sm font-medium">Đọc thêm &rarr;</a>
                </div>
              </div>
            </div>

            {/* Video nổi bật */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Video nổi bật</h3>
              <div className="space-y-3">
                <iframe
                  className="w-full rounded"
                  height="180"
                  src="https://www.youtube.com/embed/tgbNymZ7vqY"
                  title="video"
                  allowFullScreen
                ></iframe>
                <p className="text-sm">Phóng sự: Công nghệ AI trong đời sống</p>
              </div>
            </div>

            {/* Thời tiết */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Thời tiết</h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div>
                    <p className="font-medium">Hà Nội</p>
                    <p className="text-sm text-gray-600">Nắng nhẹ</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌤️</span>
                    <span className="font-semibold text-lg">32°C</span>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div>
                    <p className="font-medium">TP. HCM</p>
                    <p className="text-sm text-gray-600">Có mưa</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌧️</span>
                    <span className="font-semibold text-lg">29°C</span>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div>
                    <p className="font-medium">Đà Nẵng</p>
                    <p className="text-sm text-gray-600">Âm u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☁️</span>
                    <span className="font-semibold text-lg">30°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quảng cáo */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Quảng cáo</h3>
              <img
                src="https://source.unsplash.com/400x300/?advertisement"
                alt="ads"
                className="rounded w-full"
              />
            </div>
          </aside>
        </div>
      </main>
    </LayoutMainPage>
  );
};

export default HomeUserPage;