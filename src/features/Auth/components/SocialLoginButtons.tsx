import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";

const SocialLoginButtons = () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const handleSocialLogin = (provider: 'google' | 'facebook' | 'github') => {
        // Open OAuth in popup window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            `${API_URL}/api/v1/auth/social/${provider}`,
            `${provider}_login`,
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
        );

        // Listen for message from popup
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'SOCIAL_LOGIN_SUCCESS') {
                const { token } = event.data.payload;

                // Store token
                localStorage.setItem('accessToken', token);

                // Close popup
                popup?.close();

                // Reload or redirect
                window.location.href = '/';
            }
        };

        window.addEventListener('message', handleMessage);

        // Cleanup
        const checkPopup = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkPopup);
                window.removeEventListener('message', handleMessage);
            }
        }, 1000);
    };

    return (
        <div className="space-y-3">
            {/* Divider */}
            <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="px-4 text-sm text-gray-500 font-medium">Hoặc đăng nhập với</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-3 gap-3">
                {/* Google */}
                <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow group relative overflow-hidden"
                    title="Đăng nhập với Google"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <FcGoogle className="w-6 h-6 transition-transform group-hover:scale-110 relative z-10" />
                </button>

                {/* Facebook */}
                <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow group relative overflow-hidden"
                    title="Đăng nhập với Facebook"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <FaFacebook className="w-6 h-6 text-blue-600 transition-transform group-hover:scale-110 relative z-10" />
                </button>

                {/* GitHub */}
                <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow group relative overflow-hidden"
                    title="Đăng nhập với GitHub"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <FaGithub className="w-6 h-6 text-gray-800 transition-transform group-hover:scale-110 relative z-10" />
                </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-center text-gray-500 mt-3">
                Bằng cách đăng nhập, bạn đồng ý với{" "}
                <a href="/terms" className="text-indigo-600 hover:underline">Điều khoản</a>
                {" "}và{" "}
                <a href="/privacy" className="text-indigo-600 hover:underline">Chính sách</a>
            </p>
        </div>
    );
};

export default SocialLoginButtons;
