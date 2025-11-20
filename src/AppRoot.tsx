import { Provider } from "react-redux";
import { persistor, store } from "./app/store";
import App from "./App";
import { PersistGate } from "redux-persist/integration/react";
import ThemProvider from "./app/providers/ThemProvider";
import LanguageProvider from "./app/providers/LanguageProvider";
import RealtimeProvider from "./app/providers/RealtimeProvider";

const AppRoot = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LanguageProvider>
          <ThemProvider>
            <RealtimeProvider>
              <App />
            </RealtimeProvider>
          </ThemProvider>
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );
};

export default AppRoot;
