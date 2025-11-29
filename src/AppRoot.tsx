import { Provider } from "react-redux";
import { persistor, store } from "./app/store";
import App from "./App";
import { PersistGate } from "redux-persist/integration/react";
import ThemProvider from "./app/providers/ThemProvider";
import LanguageProvider from "./app/providers/LanguageProvider";
import RealtimeProvider from "./app/providers/RealtimeProvider";
import { SuccessModalProvider } from "./shared/contexts/SuccessModalContext";
import { SocketRefreshProvider } from "./shared/contexts/SocketRefreshContext";

const AppRoot = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LanguageProvider>
          <ThemProvider>
            <SuccessModalProvider>
              <SocketRefreshProvider>
                <RealtimeProvider>
                  <App />
                </RealtimeProvider>
              </SocketRefreshProvider>
            </SuccessModalProvider>
          </ThemProvider>
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );
};

export default AppRoot;
