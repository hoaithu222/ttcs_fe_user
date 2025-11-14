import { useEffect, useState } from "react";
import { Pencil, CheckCircle2, Edit } from "lucide-react";
import Input from "@/foundation/components/input/Input";
import TextArea from "@/foundation/components/input/TextArea";
import Button from "@/foundation/components/buttons/Button";
import ImageUpload from "@/foundation/components/input/upload/ImageUpload";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import ModelProductCategory from "./ModelProductCategory";
import { useSelector } from "react-redux";
import { shopManagementApi } from "@/core/api/shop-management";
import { userCategoriesApi } from "@/core/api/categories";
import { addToast } from "@/app/store/slices/toast";
import Loading from "@/foundation/components/loading/Loading";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export default function EditProduct() {
  const { productId } = useParams(); // Lấy ID sản phẩm từ URL
  const { data: shop } = useSelector((state) => state.shop);
  const [data, setData] = useState({
    shop_id: "",
    subcategory_id: "",
    name: "",
    description: "",
    base_price: 0,
    product_images: [],
    product_attributes: [],
    product_variants: [],
    stock_quantity: 0,
    rating: 0,
    sales_count: 0,
    weight: 0,
    is_active: true,
  });

  const [openCategory, setOpenCategory] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Get product from shop products list
        const productsResponse = await shopManagementApi.getProducts({ limit: 1000 });
        if (productsResponse.success && productsResponse.data) {
          const products = productsResponse.data.products || [];
          const product = products.find((p) => p._id === productId);

          if (product) {
            setData({
              shop_id: product.shopId || "",
              subcategory_id: product.subCategoryId || "",
              name: product.name || "",
              description: product.description || "",
              base_price: product.price || 0,
              product_images: product.images || [],
              product_attributes: product.attributes || [],
              product_variants: product.variants || [],
              stock_quantity: product.stock || 0,
              rating: product.rating || 0,
              sales_count: product.salesCount || 0,
              weight: product.weight || 0,
              is_active: product.isActive !== false,
            });

            // Fetch category info if subcategory_id exists
            if (product.subCategoryId) {
              try {
                const categoriesResponse = await userCategoriesApi.getCategories();
                if (categoriesResponse.success && categoriesResponse.data) {
                  const categories = categoriesResponse.data.categories || categoriesResponse.data || [];
                  // Find parent category by checking subcategories
                  for (const cat of categories) {
                    try {
                      const subCatsResponse = await userCategoriesApi.getSubCategories(cat._id);
                      if (subCatsResponse.success) {
                        const subCats = subCatsResponse.data?.subCategories || [];
                        const foundSub = subCats.find((sub) => sub._id === product.subCategoryId);
                        if (foundSub) {
                          setAttributes(cat.attributes || []);
                          setSelectedPath(`${cat.name} > ${foundSub.name}`);
                          break;
                        }
                      }
                    } catch {
                      continue;
                    }
                  }
                }
              } catch (error) {
                console.error("Error fetching categories:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        dispatch(addToast({ type: "error", message: "Không thể tải thông tin sản phẩm" }));
      }
      setLoading(false);
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId, dispatch]);

  useEffect(() => {
    if (shop?.id) {
      setData((prev) => ({
        ...prev,
        shop_id: shop.id,
      }));
    }
  }, [shop]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "base_price" || name === "stock_quantity") {
      value = Number(value);
    }
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpenCategory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        name: data.name,
        description: data.description,
        price: data.base_price,
        images: data.product_images,
        stock: data.stock_quantity,
        weight: data.weight,
        isActive: data.is_active,
        subCategoryId: data.subcategory_id,
        attributes: data.product_attributes,
        variants: data.product_variants,
      };

      const response = await shopManagementApi.updateProduct(productId, updateData);
      if (response.success) {
        dispatch(addToast({ type: "success", message: "Đã cập nhật sản phẩm thành công" }));
        navigate("/shop/list-product");
      } else {
        dispatch(addToast({ type: "error", message: response.message || "Cập nhật sản phẩm thất bại" }));
      }
    } catch (error) {
      console.error("Error updating product:", error);
      dispatch(
        addToast({
          type: "error",
          message: error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật sản phẩm",
        })
      );
    }
    setLoading(false);
  };

  return (
    <div className="p-5 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-h-[96vh] custom-scrollbar overflow-y-auto mx-auto transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center mb-6 space-x-4">
          <div className="p-2 bg-orange-100 rounded-full">
            <FaPencilAlt className="text-2xl text-orange-400" />
          </div>
          <h2
            className={`${colors.textColors.gradientRainbow} text-2xl font-bold`}
          >
            Chỉnh sửa thông tin sản phẩm
          </h2>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="h-0.5 bg-gradient-to-r from-purple-100 to-purple-300 my-6 shadow-lg shadow-purple-400/50 rounded-full" />

          <h3 className="mb-4 text-xl font-bold text-gray-800">
            Thông tin cơ bản
          </h3>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">
              Hình ảnh sản phẩm
            </p>
            <UploadImageProduct data={data} setData={setData} />
          </div>

          <div className="space-y-4">
            <Input
              label="Tên sản phẩm"
              name="name"
              placeholder="Vui lòng nhập tên sản phẩm + Thương hiệu + Model + Thông số kĩ thuật"
              id="name"
              isView={true}
              icon={FcOk}
              value={data.name}
              onChange={handleChange}
              required
            />

            <div className="flex gap-1 items-center">
              <label className="text-lg font-semibold text-gray-700 min-w-[120px]">
                Ngành hàng
              </label>
              <div
                className="flex flex-1 items-center p-3 bg-gray-50 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-blue-200 hover:border-blue-400"
                onClick={() => setOpenCategory(true)}
              >
                <MdCategory className="mr-3 text-2xl text-blue-500" />
                <p className="text-gray-600">
                  {selectedPath || "Vui lòng chọn ngành hàng"}
                </p>
                <TiPencil className="ml-auto text-2xl text-gray-400 transition-colors hover:text-blue-500" />
              </div>
            </div>

            <TextareaInput
              label="Mô tả sản phẩm"
              name="description"
              value={data.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              required
            />
          </div>

          <div className="">
            <div className="h-0.5 bg-gradient-to-r from-blue-100 to-blue-400 my-6 shadow-lg shadow-blue-200 rounded-full" />
            <h3 className="text-xl font-bold text-gray-800">
              Thông tin chi tiết
            </h3>
            {attributes?.length > 0 ? (
              <div>
                <p className="text-gray-500">
                  Điền thông tin thuộc tính để tăng mức độ hiển thị cho sản phẩm
                </p>
                {attributes.map((attribute, index) => (
                  <div key={`${attribute.id}-${index}`} className="mb-4">
                    {attribute.name !== "Màu sắc" &&
                      attribute.name !== "Kích thước" &&
                      attribute.name !== "Giới tính" &&
                      attribute.name !== "Size" ? (
                      <SelectAttribute
                        attribute={attribute}
                        setData={setData}
                        initialValue={
                          attribute.values.find((value) =>
                            data.product_attributes.some(
                              (attr) => attr.attribute_value_id === value.id,
                            ),
                          )?.value
                        }
                      />
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                Có thể điều chỉnh sau khi chọn ngành hàng
              </p>
            )}
          </div>

          <div className="">
            <div className="h-0.5 bg-gradient-to-r from-blue-100 to-blue-400 my-6 shadow-lg shadow-blue-100 rounded-full" />
            <h3 className="text-xl font-bold text-gray-800">
              Thông tin bán hàng
            </h3>
            {attributes?.length > 0 ? (
              <div>
                <ProductVariant
                  data={attributes}
                  setData={setData}
                  onChange={handleChange}
                  initialVariants={data.product_variants}
                />
              </div>
            ) : (
              <p className="text-gray-400">
                Có thể điều chỉnh sau khi chọn ngành hàng
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-end mt-3">
            <button
              type="button"
              className={`${colors.button.medium} ${colors.button.danger}`}
              onClick={() => navigate("/shop-management/products")}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`${colors.button.medium} ${colors.button.gradientSunrise}`}
              onClick={() => setData((prev) => ({ ...prev, is_active: false }))}
            >
              Lưu & Ẩn
            </button>
            <button
              type="submit"
              className={`${colors.button.medium} ${colors.button.gradientCyanToIndigo}`}
              onClick={() => setData((prev) => ({ ...prev, is_active: true }))}
            >
              Lưu & Hiển thị
            </button>
          </div>
        </form>
      </div>

      {openCategory && (
        <ModelProductCategory
          onClose={handleClose}
          setData={setData}
          setAttribute={setAttributes}
          onPathChange={setSelectedPath}
          initialCategoryId={data.subcategory_id}
        />
      )}
    </div>
  );
}
