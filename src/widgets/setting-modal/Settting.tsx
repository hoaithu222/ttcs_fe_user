// SettingAccountPage.tsx
import React, { useMemo, useRef } from 'react';

import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';

// import { otpVisibleSelector } from '@/app/store/slices/otp/selectors';
import {
  defaultSubScreenKeysSelector,
  resetCounterSelector,
  settingActiveTabSelector,
  settingVisibleSelector,
} from '@/app/store/slices/setting/settingSlice';
import {
  TabSetting,
  forceResetNavigation,
  setActiveTabSetting,
  setSubScreens,
  setVisibleModalSetting,
} from '@/app/store/slices/setting/settingSlice';
// import Icon from '@/foundation/components/icons/Icon';
// import {
//   OPTIONS_CTRL_SHORTCUT,
//   OPTIONS_F_KEYS_SHORTCUT,
// } from '@/shared/constants/shortcut-options';
// import { useNSTranslate } from '@/shared/hooks';

import CacheSetting from './cache-setting/CacheSetting';
import CustomModal from './components/CustomModal';
import SettingContentStack from './components/SettingContentStack';
import GeneralSetting from './general-setting/GeneralSetting';
import { screenConfigMap } from './screen-config-map';
import SecuritySetting from './security-setting/SecuritySetting';
import { isForgotPasswordModalOpenSelector } from './security-setting/slice/security-setting.selector';
import { SettingItem, Screen } from './type';

const SettingAccountPage: React.FC = () => {
  // const { t: tCommon } = useNSTranslate('common');
  const dispatch = useDispatch();
  const modalRef = useRef<HTMLDivElement>(null);

  const visibleModalSetting = useSelector(settingVisibleSelector);
  const activeTabSetting = useSelector(settingActiveTabSelector);
  const visibleOtpModal = false; // useSelector(otpVisibleSelector);
  const isModalForgotPwd = useSelector(isForgotPasswordModalOpenSelector);
  const defaultSubKeys = useSelector(defaultSubScreenKeysSelector) as string[];
  const resetCounter = useSelector(resetCounterSelector);

  // Build initialSubScreens cho tab hiện tại
  const initialSubScreens = useMemo(() => {
    const itemList: Screen[] = [];
    for (const key of defaultSubKeys) {
      const screens = screenConfigMap[activeTabSetting as TabSetting] || [];
      const item = screens.find((cfg: Screen) => cfg.key === key);
      if (item) {
        itemList.push(item);
      }
    }
    return itemList;
  }, [activeTabSetting, defaultSubKeys]);

  const handleCloseModal = React.useCallback(() => {
    if (visibleOtpModal || isModalForgotPwd) return;

    // reset defaultSubScreens để lần mở sau không còn dính
    dispatch(setSubScreens([]));
    dispatch(setVisibleModalSetting(false));
  }, [visibleOtpModal, isModalForgotPwd, dispatch]);

  const handleTabChange = (tab: TabSetting) => {
    // Nếu nhấn vào tab hiện tại, force reset navigation stack
    if (tab === activeTabSetting) {
      dispatch(forceResetNavigation());
      return;
    }

    // Nếu đổi sang tab khác
    dispatch(setActiveTabSetting(tab));
    dispatch(setSubScreens([]));
  };


  const settingItems: SettingItem[] = [
    {
      key: TabSetting.GENERAL,
      label: 'Cài đặt chung',
      icon: 'SettingNomal',
      content: (
        <SettingContentStack
          initialScreen={{
            title: 'Cài đặt chung',
            element: <GeneralSetting />,
          }}
          resetCounter={resetCounter}
        />
      ),
    },
    {
      key: TabSetting.SECURITY,
      label: 'Bảo mật',
      icon: 'Security',
      content: (
        <SettingContentStack
          initialScreen={{
            title: 'Bảo mật',
            element: <SecuritySetting push={() => {}} />,
          }}
          initialSubScreens={initialSubScreens}
          resetCounter={resetCounter}
        />
      ),
    },
    {
      key: TabSetting.CACHE,
      label: 'Xóa cache',
      icon: 'Clearcache',
      content: (
        <SettingContentStack
          initialScreen={{
            title: 'Xóa bộ nhớ đệm',
            element: <CacheSetting />,
          }}
          resetCounter={resetCounter}
        />
      ),
    },
  ];

  // React.useEffect(() => {
  //   if (!visibleModalSetting) return;
  //   // Tạo danh sách các phím cần lắng nghe
  //   const shortcutKeys = [
  //     ...OPTIONS_F_KEYS_SHORTCUT.map((item) => item.value),
  //     ...OPTIONS_CTRL_SHORTCUT.map((item) => item.value),
  //   ];

  //   function matchShortcut(e: KeyboardEvent) {
  //     // Xử lý các phím F1-F10
  //     if (shortcutKeys.includes(e.key)) {
  //       handleCloseModal();
  //       return;
  //     }
  //     // Xử lý các phím Ctrl + Fx
  //     if (e.ctrlKey) {
  //       const ctrlFx = `Ctrl+${e.key}`;
  //       if (shortcutKeys.includes(ctrlFx)) {
  //         handleCloseModal();
  //       }
  //     }
  //     // Xử lý Ctrl+B
  //     if (e.ctrlKey && e.key.toUpperCase() === 'B' && shortcutKeys.includes('Ctrl+B')) {
  //       handleCloseModal();
  //     }
  //   }

  //   window.addEventListener('keydown', matchShortcut);
  //   return () => {
  //     window.removeEventListener('keydown', matchShortcut);
  //   };
  // }, [visibleModalSetting, handleCloseModal]);

  return (
    <CustomModal
      open={visibleModalSetting}
      onClose={handleCloseModal}
      width={920}
      height={690}
      closeOnOverlayClick={false}
    >
      <div ref={modalRef} className='flex size-full'>
        {/* Sidebar */}
        <div className='flex h-full w-[260px] flex-col bg-background-1 border-r border-border-2'>
          <div className='flex items-center px-6 py-3.5 border-b border-border-2'>
            <h2 className='text-xl font-bold text-neutral-9'>
              Cài đặt
            </h2>
          </div>
          <div className='flex flex-col p-2'>
            {settingItems.map((item, idx) => (
              <button
                key={`${item.key}-${idx}`}
                className={clsx(
                  'flex h-[52px] w-full cursor-pointer items-center gap-3 px-4 rounded-lg transition-all',
                  activeTabSetting === item.key
                    ? 'bg-primary-2 text-primary-7 shadow-sm'
                    : 'text-neutral-6 hover:bg-background-2 hover:text-neutral-9',
                )}
                onClick={() => handleTabChange(item.key as TabSetting)}
              >
                <span
                  className={clsx(
                    'text-sm font-medium transition-colors',
                    activeTabSetting === item.key && 'font-semibold',
                  )}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto bg-background-1'>
          {(settingItems ?? []).map(
            (item, idx) =>
              item.key === activeTabSetting && (
                <div
                  key={`${item.key}-${idx}`}
                  className={clsx('h-full', activeTabSetting !== item.key && 'hidden')}
                >
                  {item.content}
                </div>
              ),
          )}
        </div>
      </div>
      {/* <OtpModal /> */}
    </CustomModal>
  );
};

export default SettingAccountPage;
