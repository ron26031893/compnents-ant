import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { Modal } from 'ant-design-vue';
import 'ant-design-vue/lib/modal/style/index.less';
interface Model {
  [key: string]: any;
}

interface ModalConfig {
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  layout?: 'horizontal' | 'vertical' | 'inline';
  validateTrigger?: ['blur', 'change'] | 'blur' | 'change';
  labelWrap?: boolean;
  [key: string]: any;
}

export type { ModalConfig };

export default defineComponent({
  name: 'AlphaModal',
  emits: ['update:visible', 'ok', 'cancel'],
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    width: [String, Number],
    modalConfig: {
      type: Object as PropType<ModalConfig>,
      default: {},
    },
  },
  setup(props, { attrs, slots, emit, expose }) {
    const defaultConfig: ModalConfig = {
      centered: true,
      destroyOnClose: true,
    };
    (function configMerge(targetConfig: ModalConfig, sourceConfig: ModalConfig) {
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
    })(defaultConfig, props.modalConfig);

    const confirmLoading = ref(false);

    return () => (
      <Modal
        title={props.title}
        visible={props.visible}
        width={props.width}
        maskClosable={false}
        onUpdate:visible={(visible) => {
          emit('update:visible', visible);
        }}
        onOk={() => {
          emit('ok', confirmLoading);
        }}
        onCancel={() => {
          emit('cancel');
        }}
        confirmLoading={confirmLoading.value}
        {...defaultConfig}>
        {slots.default?.()}
      </Modal>
    );
  },
});
