import React from "react";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";

interface SettingListSections {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}
interface SettingListSectionsItemProps {
  items: SettingListSections[];
}

const SettingListSections: React.FC<SettingListSectionsItemProps> = ({ items }) => {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={clsx(
            "flex items-center justify-between",
            index < items.length - 1 && "border-b border-divider-1"
          )}
          onClick={item.onClick}
        >
          <p className={clsx("text-body-14-medium pb-4 text-neutral-10")}>{item.label}</p>
          {item.icon ? (
            item.icon
          ) : (
            <ChevronRight className={clsx("cursor-pointer w-5 h-5 text-neutral-7")} />
          )}
        </div>
      ))}
    </div>
  );
};

export default SettingListSections;

/**
 * @example
 * icon thực chất là thẻ div để mik custom
 * Hiển thị danh sách các items của setting con
 * nếu có trường hợp có icon khác và có thể chọn thì truyền cả component vào
 * Ví dụ sử dụng icon mặc định :
 * <SettingListSections
        items={[
          {
            label: t('shortcuts.lists.settingFutures'),
            onClick: () => {
              push({
                title: t('shortcuts.lists.settingFutures'),
                element: <FuturesOrderSettings />,
              });
            },
          },
          {
            label: t('shortcuts.lists.settingFuturesBase'),
            onClick: () => {
              push({ title: t('shortcuts.lists.settingFuturesBase'), element: <FuturesBase /> });
            },
          },
          {
            label: t('shortcuts.lists.settingOrther'),
            onClick: () => {
              push({ title: t('shortcuts.lists.settingOrther'), element: <SettingOrther /> });
            },
          },
        ]}
      />
 * Ví dụ sử dụng custom icon :
 *       <SettingListSections
        items={[
          {
            label: 'Account Setting',
            icon: (
              <div className='relative flex items-center gap-2'>
                <p>D3750001-TK chính</p>
                {isOpen ? (
                  <Icon
                    name='UpArrowSm'
                    className={clsx('text-neutral-7', isOpen && 'rotate-180')}
                    onClick={() => setIsOpen(!isOpen)}
                  />
                ) : (
                  <Icon
                    name='DownArrow'
                    className={clsx('text-neutral-7', isOpen && 'rotate-180')}
                    onClick={() => setIsOpen(!isOpen)}
                  />
                )}
                <div className='absolute right-4 top-8'>
                  {isOpen && (
                    <Form className='absolute left-0 w-full top-4'>
                      <Select
                        options={[
                          {
                            label: 'Tài khoản chính',
                            value: 'ttt1',
                          },
                          {
                            label: 'Tài khoản chính',
                            value: 'ttt2',
                          },
                        ]}
                        onChange={(value) => setAccount(value)}
                        value={account}
                        placeholder={'Chọn tài khoản'}
                        name='account'
                      />
                    </Form>
                  )}
                </div>
              </div>
            ),
          },
        ]}

      />
 * **/
