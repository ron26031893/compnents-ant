import { TableProps } from 'ant-design-vue';

/**
 * 非嵌套形式['key','columnTitle']
 * 嵌套形式[['prop1','prop2'], 'columnTitle'], 此时prop2为列的key
 * @param arr 数据源，支持属性嵌套，最后一个属性的键值会作为列的key
 * @param needActions 需不需要操作列, 默认需要
 * @returns
 */
export function generateColumns(arr: Array<any[]>, needActions: boolean = true): any[] {
  const result: Object[] = [];
  arr.forEach((v, index) => {
    const temp = {
      dataIndex: v[0],
      title: v[1],
      key: v[0],
      align: 'center',
      fixed: index === 0 ? 'left' : undefined,
    };
    if (v[0] instanceof Array) {
      temp.key = v[0][v.length - 1];
    }
    result.push(temp);
  });

  needActions &&
    result.push({
      key: 'actions',
      title: '操作',
      align: 'center',
      fixed: 'right',
    });

  return result;
}

export function deepClone(obj, cleanMode = false) {
  if (!obj) {
    console.error('deepClone: 参数为undefined | Null');
    return null;
  }
  if (typeof obj !== 'object') {
    console.error('deepClone: 传入参数非对象,只接受对象参数');
    return null;
  }
  let result: any;
  if (obj instanceof Array) {
    result = [];
    obj.forEach((v) => {
      if (typeof v !== 'boolean' && !v && cleanMode) {
        void 0;
      } else if (typeof v === 'object' && v !== null) {
        result.push(deepClone(v, cleanMode));
      } else {
        result.push(v);
      }
    });
    return result;
  }
  result = {};
  for (let key in obj) {
    if (typeof obj[key] !== 'boolean' && !obj[key] && cleanMode) {
      continue;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = deepClone(obj[key], cleanMode);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}