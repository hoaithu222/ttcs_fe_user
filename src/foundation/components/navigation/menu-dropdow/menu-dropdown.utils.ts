import { DropdownMenuItem } from "../dropdown/DropDownListItem";

/** Lấy giá trị leaf đầu tiên của một item, đệ quy nếu có children */
export const getDefaultLeafValue = (item: DropdownMenuItem): string => {
  if (item.childrenItem && item.childrenItem.length > 0) {
    return getDefaultLeafValue(item.childrenItem[0]);
  }
  return item.value ?? "";
};

/** Cập nhật thuộc tính highlight cho các item dựa trên activeVal */
export const updateHighlight = (
  items: DropdownMenuItem[],
  activeVal: string
): DropdownMenuItem[] => {
  return items.map((item) => {
    const newItem = { ...item };
    if (newItem.childrenItem && newItem.childrenItem.length > 0) {
      newItem.childrenItem = updateHighlight(newItem.childrenItem, activeVal);
    }
    newItem.highlight =
      newItem.value === activeVal ||
      (newItem.childrenItem ? newItem.childrenItem.some((child) => child.highlight) : false);
    return newItem;
  });
};

/** Bọc onClick của từng item đệ quy để tự cập nhật active state và log index path.
 *  Nếu item có children, sẽ lấy default leaf value (đệ quy lấy con đầu tiên).
 */
export function wrapOnClick(
  items: DropdownMenuItem[],
  setActiveValue: (value: string) => void
): DropdownMenuItem[] {
  return items.map((item) => {
    const hasChildren = Array.isArray(item.childrenItem) && item.childrenItem.length > 0;

    // Khai báo trước wrappedOnClick để dùng chung cả với cha và con
    const wrappedOnClick: DropdownMenuItem["onClick"] = () => {
      const valueToSet = hasChildren ? getDefaultLeafValue(item) : (item.value ?? "");

      setActiveValue(valueToSet);
      item.onClick?.();
    };

    return {
      ...item,
      onClick: wrappedOnClick,
      childrenItem: hasChildren
        ? wrapOnClick(item.childrenItem!, setActiveValue)
        : item.childrenItem,
    };
  });
}

// export const wrapOnClick = (
//   items: DropdownMenuItem[],
//   setActiveValue: (value: string) => void,
//   parentIndex: number[] = [],
// ): DropdownMenuItem[] => {
//   return items.map((item, idx) => {
//     const currentIndex = [...parentIndex, idx];
//     const newItem = { ...item };
//     const originalOnClick = newItem.onClick;
//     newItem.onClick = (value: string) => {
//       if (newItem.childrenItem && newItem.childrenItem.length > 0) {
//         const defaultValue = getDefaultLeafValue(newItem);
//         setActiveValue(defaultValue);
//       } else {
//         setActiveValue(value);
//       }
//       if (originalOnClick) {
//         originalOnClick(value);
//       }
//     };
//     if (newItem.childrenItem && newItem.childrenItem.length > 0) {
//       newItem.childrenItem = wrapOnClick(newItem.childrenItem, setActiveValue, currentIndex);
//     }
//     return newItem;
//   });
// };
