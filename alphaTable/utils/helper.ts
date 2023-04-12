import { TableProps } from 'ant-design-vue';

/**
 * 非嵌套形式['key','columnTitle']
 * 嵌套形式[['prop1','prop2'], 'columnTitle'], 此时prop2为列的key
 * @param arr 数据源，支持属性嵌套，最后一个属性的键值会作为列的key
 * @param needActions 需不需要操作列, 默认需要
 * @returns
 */
export function generateColumns(arr: Array<any[]>, columnHandler = (column) => column, needActions: boolean = true): any[] {
  const result: Object[] = [];
  arr.forEach((v, index) => {
    const temp = columnHandler({
      dataIndex: v[0],
      title: v[1],
      key: v[0],
      align: 'left',
      fixed: index === 0 ? 'left' : undefined,
    });

    if (v[0] instanceof Array) {
      temp.key = v[0][v.length - 1];
    }
    result.push(temp);
  });

  needActions &&
    result.push(
      columnHandler({
        key: 'actions',
        title: '操作',
        align: 'left',
        fixed: 'right',
      })
    );

  return result;
}
