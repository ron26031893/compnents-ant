import { ref } from 'vue';
import type { Ref } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';

export function usePaginationConfig(size, pageSizeOptions): Ref<TablePaginationConfig> {
  function pageSizeOptionsElCheck(pageSizeOptions) {
    let result = true;
    pageSizeOptions.some((v) => {
      if ((typeof v === 'string' && isNaN(Number(v))) || typeof v !== 'string') {
        result = false;
        return true;
      }
      return false;
    });
    return result;
  }
  function getDefaultPageSize() {
    const length = pageSizeOptions.length;
    if (length >= 2) {
      return pageSizeOptions[1];
    }
    return pageSizeOptions[0];
  }
  if (!pageSizeOptions || pageSizeOptions.length === 0) {
    pageSizeOptions = ['10', '20', '50', '100'];
  }
  if (!pageSizeOptionsElCheck(pageSizeOptions)) {
    console.error('pageSizeOptions中的元素必须是数字字符串');
  }
  return ref<TablePaginationConfig>({
    current: 1,
    pageSize: Number(getDefaultPageSize()),
    total: 10,
    size: size || '',
    pageSizeOptions,
    showSizeChanger: true,
    showTotal(total) {
      return `共${total}条数据`;
    },
  });
}
