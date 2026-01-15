import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error) {
            // Handle error
            console.error("Social login error:", error);

            // Show error message (you can use toast here)
            alert(`Đăng nhập thất bại: ${error}`);

            // Redirect to login
            navigate("/login");
            return;
        }

        if (token) {
            // Store token
            localStorage.setItem("accessToken", token);

            // If opened in popup, send message to parent
            if (window.opener) {
                window.opener.postMessage({
                    type: 'SOCIAL_LOGIN_SUCCESS',
                    payload: { token }
                }, window.location.origin);

                // Close popup
                window.close();
            } else {
                // If not popup, redirect to home
                window.location.href = "/";
            }
        } else {
            // No token, redirect to login
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="text-center space-y-4">
                {/* Animated loader */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                </div>

                {/* Loading text */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        Đang đăng nhập...
                    </h2>
                    <p className="text-gray-600">
                        Vui lòng đợi trong giây lát
                    </p>
                </div>

                {/* Decorative dots */}
                <div className="flex justify-center gap-2 pt-4">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
