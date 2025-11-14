import { useEffect, useState } from "react";
import { ChevronRight, Search, FolderTree, CheckCircle2 } from "lucide-react";
import { userCategoriesApi } from "@/core/api/categories";
import Button from "@/foundation/components/buttons/Button";
import Modal from "@/foundation/components/modal/Modal";
import Loading from "@/foundation/components/loading/Loading";

interface CategorySelectionModalProps {
  open: boolean;
  onClose: () => void;
  setData: React.Dispatch<React.SetStateAction<any>>;
  setAttribute: React.Dispatch<React.SetStateAction<any[]>>;
  onPathChange: (path: string) => void;
  initialCategoryId?: string;
}

interface Category {
  id: string;
  name: string;
  attributes: any[];
}

interface SubCategory {
  id: string;
  name: string;
}

export default function CategorySelectionModal({
  open,
  onClose,
  setData,
  setAttribute,
  onPathChange,
  initialCategoryId = "",
}: CategorySelectionModalProps) {
  const [category, setCategory] = useState<Category[]>([]);
  const [subCategory, setSubCategory] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Chỉ fetch categories, không fetch subcategories
  const fetchCategory = async () => {
    setLoadingCategories(true);
    try {
      const response = await userCategoriesApi.getCategories();
      if (response.success && response.data) {
        const categories = response.data.categories || response.data || [];
        const transformedCategories = categories.map((cat: any) => ({
          id: cat._id,
          name: cat.name,
          attributes: cat.attributes || [],
        }));
        setCategory(transformedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch subcategories khi category được chọn
  const fetchSubCategories = async (categoryId: string) => {
    setLoadingSubCategories(true);
    setSubCategory([]);
    try {
      const response = await userCategoriesApi.getSubCategories(categoryId);
      if (response.success && response.data) {
        // Xử lý cả hai trường hợp: data.subCategories hoặc data là array trực tiếp
        let subCategoriesArray: any[] = [];

        if (Array.isArray(response.data)) {
          // Trường hợp data là array trực tiếp
          subCategoriesArray = response.data;
        } else if (response.data.subCategories && Array.isArray(response.data.subCategories)) {
          // Trường hợp data có subCategories
          subCategoriesArray = response.data.subCategories;
        }

        const subCategories = subCategoriesArray.map((sub: any) => ({
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

  const handleCategorySelect = async (item: Category) => {
    setSelectedCategory(item);
    setSelectedSubCategory(null);
    await fetchSubCategories(item.id);
  };

  const handleSubCategorySelect = (item: SubCategory) => {
    setSelectedSubCategory(item);
  };

  const handleConfirm = () => {
    if (selectedSubCategory && selectedCategory) {
      setAttribute(selectedCategory.attributes);
      setData((prev: any) => ({
        ...prev,
        subCategoryId: selectedSubCategory.id,
        subcategory_id: selectedSubCategory.id,
        category_path: getSelectedPath(),
      }));
      onPathChange(getSelectedPath());
      onClose();
    }
  };

  const getSelectedPath = () => {
    if (!selectedCategory) return "Chưa chọn";
    if (!selectedSubCategory) return selectedCategory.name;
    return `${selectedCategory.name} > ${selectedSubCategory.name}`;
  };

  const filteredCategories = category.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch categories khi modal mở
  useEffect(() => {
    if (open) {
      fetchCategory();
      // Reset state khi mở modal
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSubCategory([]);
      setSearchTerm("");
    }
  }, [open]);

  // Xử lý initialCategoryId khi có category và initialCategoryId
  useEffect(() => {
    const initializeCategory = async () => {
      if (initialCategoryId && category.length > 0 && open) {
        setInitializing(true);
        // Tìm category chứa subcategory có id = initialCategoryId
        for (const cat of category) {
          try {
            const subCatsResponse = await userCategoriesApi.getSubCategories(cat.id);
            if (subCatsResponse.success && subCatsResponse.data) {
              // Xử lý cả hai trường hợp: data.subCategories hoặc data là array trực tiếp
              let subCatsArray: any[] = [];

              if (Array.isArray(subCatsResponse.data)) {
                subCatsArray = subCatsResponse.data;
              } else if (
                subCatsResponse.data.subCategories &&
                Array.isArray(subCatsResponse.data.subCategories)
              ) {
                subCatsArray = subCatsResponse.data.subCategories;
              }

              const foundSub = subCatsArray.find((sub: any) => sub._id === initialCategoryId);
              if (foundSub) {
                setSelectedCategory(cat);
                setSubCategory(
                  subCatsArray.map((sub: any) => ({
                    id: sub._id,
                    name: sub.name,
                  }))
                );
                setSelectedSubCategory({
                  id: foundSub._id,
                  name: foundSub.name,
                });
                setAttribute(cat.attributes);
                setData((prev: any) => ({
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
        setInitializing(false);
      }
    };

    initializeCategory();
  }, [category, initialCategoryId, open]);

  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      onPathChange(`${selectedCategory.name} > ${selectedSubCategory.name}`);
    }
  }, [selectedCategory, selectedSubCategory, onPathChange]);

  const customTitle = (
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
  );

  const footer = (
    <div className="flex gap-4 justify-end">
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
  );

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size="3xl"
      customTitle={customTitle}
      footer={footer}
      hideFooter={false}
      contentClassName="max-h-[90vh] overflow-hidden flex flex-col"
      className="overflow-y-auto"
      padding="p-0"
      headerPadding="p-6 border-b"
    >
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex overflow-hidden flex-col flex-1 p-6">
          {/* Search */}
          <div className="flex-shrink-0 mb-6">
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
            className="flex overflow-hidden flex-1 min-h-0 rounded-lg border"
            style={{
              backgroundColor: "var(--color-background-2)",
              borderColor: "var(--color-border-1)",
            }}
          >
            {/* Categories List */}
            <div
              className="overflow-y-auto flex-shrink-0 w-1/2 border-r"
              style={{
                borderColor: "var(--color-border-1)",
                backgroundColor: "var(--color-background-1)",
                maxHeight: "400px",
              }}
            >
              {loadingCategories ? (
                <div
                  className="flex justify-center items-center p-8"
                  style={{ color: "var(--color-neutral-5)" }}
                >
                  <Loading layout="centered" message="Đang tải danh mục..." />
                </div>
              ) : filteredCategories.length > 0 ? (
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
              className="overflow-y-auto flex-shrink-0 w-1/2"
              style={{
                backgroundColor: "var(--color-background-1)",
                maxHeight: "400px",
              }}
            >
              {initializing ? (
                <div
                  className="flex justify-center items-center p-8"
                  style={{ color: "var(--color-neutral-5)" }}
                >
                  <Loading layout="centered" message="Đang tải..." />
                </div>
              ) : loadingSubCategories ? (
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
            className="flex-shrink-0 p-4 mt-6 rounded-lg border"
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
      </div>
    </Modal>
  );
}
