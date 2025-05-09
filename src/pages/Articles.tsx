import React from "react";
import { ChartLine, Loader, AlertTriangle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

// The article fetching function
const fetchArticleBySlug = async (slug) => {
  const response = await fetch(`http://localhost:8000/get_article_by_slug/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }
  return response.json();
};

// Custom components for ReactMarkdown with dark theme styling
const MarkdownComponents = {
  h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mt-12 mb-6 text-gray-100" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-3xl font-semibold mt-10 mb-4 pb-2 border-b border-gray-700 text-gray-200" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-200" {...props} />,
  p: ({ node, ...props }) => <p className="my-6 leading-relaxed text-gray-300" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-6 text-gray-300" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-6 text-gray-300" {...props} />,
  li: ({ node, ...props }) => <li className="mb-2 text-gray-300" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="pl-4 italic border-l-4 border-gray-600 text-gray-400 my-6" {...props} />
  ),
  code: ({ node, inline, ...props }) => 
    inline ? (
      <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300" {...props} />
    ) : (
      <code className="text-gray-300" {...props} />
    ),
  pre: ({ node, ...props }) => (
    <pre className="bg-gray-800 p-4 rounded-lg overflow-auto my-6 text-gray-300" {...props} />
  ),
  a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
  img: ({ node, ...props }) => <img className="rounded-lg shadow-md my-6 max-w-full" {...props} />,
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-700 text-gray-300" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-gray-800" {...props} />,
  th: ({ node, ...props }) => (
    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200" {...props} />
  ),
  td: ({ node, ...props }) => <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold text-gray-200" {...props} />,
  em: ({ node, ...props }) => <em className="italic text-gray-300" {...props} />,
  hr: ({ node, ...props }) => <hr className="my-8 border-gray-700" {...props} />,
};

const Articles = () => {
  const { slug } = useParams();
  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticleBySlug(slug),
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-gray-1000 text-white-1000 font-sans">
      <header className="bg-gray-1000 border-b border-gray-1000 py-4 md:py-6 sticky top-0 z-50 backdrop-blur-sm bg-gray-1000/90">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <a
              href="/"
              className="flex items-center gap-2 no-underline text-current"
            >
            <ChartLine className="h-8 w-8 text-finlist-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              FinList
            </h1>
            </a>

          </div>
          <span className="text-gray-400 text-sm">Article Viewer</span>
        </div>
      </header>
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2 text-gray-400 py-20">
            <Loader className="animate-spin h-6 w-6" />
            <span>Loading article...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center space-x-2 text-red-400 py-20">
            <AlertTriangle className="h-6 w-6" />
            <span>Failed to load article. Please try again later.</span>
          </div>
        ) : article ? (
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-100">{article.article_name}</h1>
            
            <div className="text-gray-400 text-lg border-b border-gray-700 pb-6">
              {article.sector} • {article.author}
            </div>
            
            <div className="article-content text-lg">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={MarkdownComponents}
              >
                {article.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">Article not found.</div>
        )}
      </main>
    </div>
  );
};

export default Articles;