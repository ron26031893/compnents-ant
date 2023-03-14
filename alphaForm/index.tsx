import { defineComponent, ref, watch } from 'vue';
import { type PropType } from 'vue';
import { Form } from 'ant-design-vue';
import { deepClone, printLogInDevMode } from '../utils';
interface Model {
  [key: string]: any;
}

interface FormConfig {
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  layout?: 'horizontal' | 'vertical' | 'inline';
  validateTrigger?: ['blur', 'change'] | 'blur' | 'change';
  labelWrap?: boolean;
}

export { FormConfig };

export default defineComponent({
  name: 'AlphaForm',
  props: {
    model: {
      type: Object as PropType<Model>,
      required: true,
    },
    rules: {
      type: Object as PropType<{ [key: string]: any }>,
      default: {},
    },
    dataHandler: {
      type: Function as PropType<(dataToBeHandled: any) => {}>,
      default(submitData) {
        return submitData;
      },
    },
    formConfig: {
      type: Object as PropType<FormConfig>,
      default: {},
    },
    magicCallbacks: {
      type: Object as PropType<Array<(formData,formRef?) => any>>,
      default: [],
    },
  },
  setup(props, { attrs, slots, emit, expose }) {
    const formRef = ref();
    printLogInDevMode('AlphaPopupForm: deep clone props.model');
    const dataToBeHandled = ref(deepClone(props.model));
    watch(
      () => props.model,
      () => {
        dataToBeHandled.value = deepClone(props.model);
      }
    );
    const defaultConfig: FormConfig = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      layout: 'horizontal',
      validateTrigger: ['blur', 'change'],
      labelWrap: true,
    };
    (function configMerge(targetConfig: FormConfig, sourceConfig: FormConfig) {
      //不支持使用undefined和null覆盖默认配置
      if (!sourceConfig) {
        return;
      }
      const srcKeys = Object.keys(sourceConfig);
      if (!srcKeys.length) {
        return;
      }
      srcKeys.forEach((key) => {
        const value = sourceConfig[key];
        if (value !== undefined && value !== null) {
          targetConfig[key] = value;
        }
      });
    })(defaultConfig, props.formConfig);

    watch(dataToBeHandled, () => {
      props.magicCallbacks.forEach((callback) => {
        callback(dataToBeHandled.value, formRef);
      });
    },{deep:true});

    function getSubmitData() {
      printLogInDevMode('AlphaPopupForm: deep clone dataTobeHandled');
      const clonedData = deepClone(dataToBeHandled.value);
      return props.dataHandler?.(clonedData) ?? clonedData;
    }

    function getFormRef() {
      return formRef;
    }

    expose({
      getSubmitData,
      getFormRef,
    });
    return () => (
      <Form ref={formRef} model={dataToBeHandled.value} {...defaultConfig} rules={props.rules}>
        {slots.default?.({ params: dataToBeHandled })}
      </Form>
    );
  },
});
