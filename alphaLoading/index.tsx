import { defineComponent } from 'vue';
import { Spin, Button } from 'ant-design-vue';
export default defineComponent({
  name: 'Loading',
  props: {
    message: String,
    cancelable: Boolean,
    visible: Boolean,
  },
  emits: ['cancel'],
  setup(props, { emit, slots, attrs, expose }) {
    const centerStyle = {
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      left: '50%',
      top: '50%',
    };
    const containerStyle: any = {
      width: '460px',
      aspectRatio: '16 / 9',
      backgroundColor: 'white',
      border: '1px solid #ededed',
      borderRadius: '8px',
      boxShadow: '0px 0px 5px #dddddd',
      ...centerStyle,
    };
    const wrapperStyle: any = {
      textAlign: 'center',
      ...centerStyle,
    };
    const spinStyle = {
      display: 'inline-block',
    };
    return () =>
      props.visible ? (
        <div style={containerStyle}>
          <div style={wrapperStyle}>
            <Spin style={spinStyle} size="large">
              {{
                tip: () => <div style="margin-top:18px;font-size:14px">{props.message}</div>,
              }}
            </Spin>
            <div></div>
            {props.cancelable ? (
              <Button
                type="default"
                size="small"
                style="color:#2F54EB;margin-top:24px;padding:5px 16px;display:inline-block;height:auto;font-size:14px"
                onClick={() => emit('cancel')}>
                取消
              </Button>
            ) : undefined}
          </div>
        </div>
      ) : undefined;
  },
});
