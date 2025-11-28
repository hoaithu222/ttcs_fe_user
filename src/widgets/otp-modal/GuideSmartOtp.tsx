const GuideSmartOtp = () => {
  return (
    <div className="w-full p-4 text-sm text-left border rounded-lg border-neutral-3 bg-background-1">
      <span className="mb-2 block text-sm font-semibold text-neutral-9">
        Hướng dẫn sử dụng Smart OTP
      </span>
      <ul className="pl-5 space-y-2 list-disc text-sm text-neutral-7">
        <li>
          <span>Nhập mật khẩu Smart OTP đã được cấu hình trước đó</span>
        </li>
        <li>
          <span>Hệ thống sẽ tự động tạo mã OTP 6 số từ mật khẩu của bạn</span>
        </li>
        <li>
          <span>Mã OTP sẽ tự động thay đổi sau mỗi 30 giây để đảm bảo bảo mật</span>
        </li>
        <li>
          <span>Nếu quên mật khẩu Smart OTP, bạn có thể đổi lại trong phần Cài đặt</span>
        </li>
      </ul>
    </div>
  );
};

export default GuideSmartOtp;
