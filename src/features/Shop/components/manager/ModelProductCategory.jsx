import { useEffect, useState } from "react";
import { X, ChevronRight, Search, FolderTree, CheckCircle2 } from "lucide-react";
import { userCategoriesApi } from "@/core/api/categories";
import Button from "@/foundation/components/buttons/Button";

export default function ModelProductCategory({
  onClose,
  setData,
  setAttribute,
  onPathChange,
  initialCategoryId = "",
}) {
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Chỉ fetch categories, không fetch subcategories
  const fetchCategory = async () => {
    try {
      const response = await userCategoriesApi.getCategories();
      if (response.success && response.data) {
        const categories = response.data.categories || response.data || [];
        // Chỉ lưu thông tin cơ bản của categories, không fetch subcategories
        const transformedCategories = categories.map((cat) => ({
          id: cat._id,
          name: cat.name,
          attributes: cat.attributes || [],
        }));
        setCategory(transformedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch subcategories khi category được chọn
  const fetchSubCategories = async (categoryId) => {
    setLoadingSubCategories(true);
    setSubCategory([]); // Clear subcategories trước
    try {
      const response = await userCategoriesApi.getSubCategories(categoryId);
      if (response.success && response.data) {
        const subCategories = (response.data?.subCategories || []).map((sub) => ({
          id: sub._id,
          name: sub.name,
        }));
        setSubCategory(subCategories);
      } else {
        setSubCategory([]);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategory([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const handleCategorySelect = async (item) => {
    setSelectedCategory(item);
    setSelectedSubCategory(null);
    // Gọi API để lấy subcategories khi chọn category
    await fetchSubCategories(item.id);
  };

  const handleSubCategorySelect = (item) => {
    setSelectedSubCategory(item);
  };

  const handleConfirm = () => {
    if (selectedSubCategory) {
      setAttribute(selectedCategory?.attributes);
      setData((prev) => {
        return {
          ...prev,
          subCategoryId: selectedSubCategory.id,
          subcategory_id: selectedSubCategory.id, // Keep for backward compatibility
          category_path: getSelectedPath(),
        };
      });
      onPathChange(getSelectedPath());
      onClose();
    }
  };

  const filteredCategories = category.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCategory();
  }, []);

  // Xử lý initialCategoryId khi có category và initialCategoryId
  useEffect(() => {
    const initializeCategory = async () => {
      if (initialCategoryId && category.length > 0) {
        // Tìm category chứa subcategory có id = initialCategoryId
        // Vì chúng ta không có subcategories trong category, cần fetch từng category để tìm
        for (const cat of category) {
          try {
            const subCatsResponse = await userCategoriesApi.getSubCategories(cat.id);
            if (subCatsResponse.success) {
              const subCats = subCatsResponse.data?.subCategories || [];
              const foundSub = subCats.find((sub) => sub._id === initialCategoryId);
              if (foundSub) {
                setSelectedCategory(cat);
                setSubCategory(
                  subCats.map((sub) => ({
                    id: sub._id,
                    name: sub.name,
                  }))
                );
                setSelectedSubCategory({
                  id: foundSub._id,
                  name: foundSub.name,
                });
                setAttribute(cat.attributes);
                setData((prev) => ({
                  ...prev,
                  subCategoryId: foundSub._id,
                  subcategory_id: foundSub._id,
                }));
                onPathChange(`${cat.name} > ${foundSub.name}`);
                break;
              }
            }
          } catch (error) {
            console.error(`Error checking category ${cat.id}:`, error);
          }
        }
      }
    };

    initializeCategory();
  }, [category, initialCategoryId]);
  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      onPathChange(`${selectedCategory.name} > ${selectedSubCategory.name}`);
    }
  }, [selectedCategory, selectedSubCategory, onPathChange]);
  const getSelectedPath = () => {
    if (!selectedCategory) return "Chưa chọn";
    if (!selectedSubCategory) return selectedCategory.name;
    return `${selectedCategory.name} > ${selectedSubCategory.name}`;
  };

  return (
    <div
      className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "var(--color-overlay)" }}
    >
      <div
        className="overflow-hidden w-full max-w-4xl rounded-2xl shadow-2xl"
        style={{ backgroundColor: "var(--color-background-dialog)" }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-6 border-b"
          style={{
            borderColor: "var(--color-border-1)",
            backgroundColor: "var(--color-background-2)",
          }}
        >
          <div className="flex gap-3 items-center">
            <div
              className="flex justify-center items-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: "var(--color-primary-10)" }}
            >
              <FolderTree className="w-5 h-5" style={{ color: "var(--color-primary-6)" }} />
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-6 to-primary-8">
              Chọn ngành hàng
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex justify-center items-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: "var(--color-neutral-6)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-neutral-2)";
              e.currentTarget.style.color = "var(--color-error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-neutral-6)";
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div
              className="flex gap-3 items-center px-4 py-3 rounded-lg border transition-colors focus-within:border-primary-6"
              style={{
                backgroundColor: "var(--color-background-input)",
                borderColor: "var(--color-border-1)",
              }}
            >
              <Search
                className="flex-shrink-0 w-5 h-5"
                style={{ color: "var(--color-neutral-4)" }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm ngành hàng..."
                className="flex-1 bg-transparent outline-none"
                style={{ color: "var(--color-neutral-7)" }}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div
            className="flex overflow-hidden rounded-lg border"
            style={{
              backgroundColor: "var(--color-background-2)",
              borderColor: "var(--color-border-1)",
            }}
          >
            {/* Categories List */}
            <div
              className="overflow-y-auto w-1/2 max-h-96 border-r"
              style={{
                borderColor: "var(--color-border-1)",
                backgroundColor: "var(--color-background-1)",
              }}
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all border-l-4 ${
                      selectedCategory?.id === item.id ? "font-medium" : "border-transparent"
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory?.id === item.id
                          ? "var(--color-primary-10)"
                          : "transparent",
                      borderLeftColor:
                        selectedCategory?.id === item.id ? "var(--color-primary-6)" : "transparent",
                      color:
                        selectedCategory?.id === item.id
                          ? "var(--color-primary-7)"
                          : "var(--color-neutral-7)",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory?.id !== item.id) {
                        e.currentTarget.style.backgroundColor = "var(--color-background-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory?.id !== item.id) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                    onClick={() => handleCategorySelect(item)}
                  >
                    <span className="text-base">{item.name}</span>
                    <ChevronRight
                      className="flex-shrink-0 w-5 h-5"
                      style={{ color: "var(--color-neutral-4)" }}
                    />
                  </div>
                ))
              ) : (
                <div
                  className="flex justify-center items-center p-8"
                  style={{ color: "var(--color-neutral-5)" }}
                >
                  <p>Không tìm thấy ngành hàng</p>
                </div>
              )}
            </div>

            {/* Subcategories List */}
            <div
              className="overflow-y-auto w-1/2 max-h-96"
              style={{ backgroundColor: "var(--color-background-1)" }}
            >
              {loadingSubCategories ? (
                <div
                  className="flex justify-center items-center p-8"
                  style={{ color: "var(--color-neutral-5)" }}
                >
                  <p className="text-center">Đang tải danh mục con...</p>
                </div>
              ) : subCategory.length > 0 ? (
                subCategory.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all border-l-4 ${
                      selectedSubCategory?.id === item.id ? "font-medium" : "border-transparent"
                    }`}
                    style={{
                      backgroundColor:
                        selectedSubCategory?.id === item.id
                          ? "var(--color-primary-10)"
                          : "transparent",
                      borderLeftColor:
                        selectedSubCategory?.id === item.id
                          ? "var(--color-primary-6)"
                          : "transparent",
                      color:
                        selectedSubCategory?.id === item.id
                          ? "var(--color-primary-7)"
                          : "var(--color-neutral-7)",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSubCategory?.id !== item.id) {
                        e.currentTarget.style.backgroundColor = "var(--color-background-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSubCategory?.id !== item.id) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                    onClick={() => handleSubCategorySelect(item)}
                  >
                    <span className="text-base">{item.name}</span>
                    {selectedSubCategory?.id === item.id && (
                      <CheckCircle2
                        className="flex-shrink-0 w-5 h-5"
                        style={{ color: "var(--color-primary-6)" }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div
                  className="flex justify-center items-center p-8"
                  style={{ color: "var(--color-neutral-5)" }}
                >
                  <p className="text-center">
                    {selectedCategory
                      ? "Ngành hàng này chưa có danh mục con"
                      : "Vui lòng chọn ngành hàng"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Path Info */}
          <div
            className="p-4 mt-6 rounded-lg border"
            style={{
              backgroundColor: "var(--color-primary-10)",
              borderColor: "var(--color-primary-6)",
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-neutral-6)" }}>
                  Đã chọn:
                </p>
                <p
                  className="mt-1 text-base font-semibold"
                  style={{ color: "var(--color-primary-7)" }}
                >
                  {getSelectedPath() === "Chưa chọn" ? (
                    <span style={{ color: "var(--color-neutral-5)" }}>Chưa chọn ngành hàng</span>
                  ) : (
                    getSelectedPath()
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-4 justify-end items-center p-6 border-t"
          style={{
            borderColor: "var(--color-border-1)",
            backgroundColor: "var(--color-background-2)",
          }}
        >
          <Button type="button" color="gray" variant="outline" size="lg" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            color="blue"
            variant="solid"
            size="lg"
            disabled={!selectedSubCategory}
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}
