import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import { Home, ArrowLeft, Search } from "lucide-react";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/20">
      <div className="text-center animate-fade-in">
        <Card className="p-8 mx-auto max-w-2xl border-0 shadow-2xl backdrop-blur-sm md:p-12 bg-card/80">
          {/* 404 Number with gradient */}
          <div className="relative mb-8">
            <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r md:text-9xl from-primary via-accent to-destructive animate-scale-in">
              404
            </h1>
            <div className="absolute inset-0 text-8xl font-bold blur-sm md:text-9xl text-muted/10">
              404
            </div>
          </div>

          {/* Main message */}
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold md:text-3xl text-foreground">
              Trang không tồn tại
            </h2>
            <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
              Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4 justify-center items-center sm:flex-row">
            <Button className="shadow-lg transition-all duration-300 group hover-scale hover:shadow-xl">
              <a href="/" className="flex gap-2 items-center">
                <Home className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                Về trang chủ
              </a>
            </Button>

            <Button
              onClick={() => window.history.back()}
              className="transition-all duration-300 group hover-scale"
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              Quay lại
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center mt-12 space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse bg-primary"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </Card>

        {/* Floating search suggestion */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="inline-flex gap-2 items-center px-4 py-2 text-sm rounded-full backdrop-blur-sm text-muted-foreground bg-muted/50">
            <Search className="w-4 h-4" />
            Thử tìm kiếm nội dung khác?
          </div>
        </div>

        {/* Background decoration */}
        <div className="overflow-hidden fixed inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse bg-primary/5" />
          <div
            className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-accent/5"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
