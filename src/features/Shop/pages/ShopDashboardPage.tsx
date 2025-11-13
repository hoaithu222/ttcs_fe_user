import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";

const ShopDashboardPage = () => {
	return (
		<Section title="Bảng điều khiển cửa hàng">
			<Card className="space-y-4">
				<div className="space-y-2">
					<div className="text-lg font-semibold">Tổng quan</div>
					<div className="text-neutral-6 text-sm">
						Xem nhanh doanh thu, đơn hàng và đánh giá.
					</div>
				</div>
				<div className="flex gap-2">
					<Button>Quản lý đơn hàng</Button>
					<Button variant="outline">Thêm sản phẩm</Button>
				</div>
			</Card>
		</Section>
	);
};

export default ShopDashboardPage;

