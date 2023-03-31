import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { Button } from 'ant-design-vue';
import searchStyle from './style/index.module.less';

export default defineComponent({
  name: 'Search',
  emits: ['search', 'reset'],
  setup(props, { emit, slots, attrs, expose }) {
    let originHeight;
    let adjustment = 0;
    let baseOffsetTop = 0;
    const folded = ref(true);
    const unfoldBtnVisibility = ref(false);
    const styleRef = ref<any>(searchStyle);
    const leftSide = ref<HTMLElement>();
    const rightSide = ref<HTMLElement>();
    const btns = ref<HTMLElement>();
    const containerRef = ref<HTMLElement>();
    function isBorderBox(boxSizing) {
      return boxSizing === 'border-box';
    }
    function string2Number(str) {
      const reg = /[0-9]*/g;
      const result = reg.exec(str);
      if (result) {
        return Number(result[0]);
      }
      return 0;
    }
    function getRealHeightWithoutMargin(s: CSSStyleDeclaration) {
      const height = string2Number(s.height),
        paddingTop = string2Number(s.paddingTop),
        padddingBottom = string2Number(s.paddingBottom),
        borderTopWidth = string2Number(s.borderTopWidth),
        borderBottomWidth = string2Number(s.borderBottomWidth);

      let realHeight = 0;
      if (isBorderBox(s.boxSizing)) {
        realHeight = height;
      } else {
        realHeight = height + paddingTop + padddingBottom + borderTopWidth + borderBottomWidth;
      }
      return realHeight;
    }
    function getRealWidth(s: CSSStyleDeclaration) {
      const width = string2Number(s.width),
        paddingLeft = string2Number(s.paddingLeft),
        paddingRight = string2Number(s.paddingRight),
        borderLeftWidth = string2Number(s.borderLeftWidth),
        borderRightWidth = string2Number(s.borderRightWidth),
        marginLeft = string2Number(s.marginLeft),
        marginRight = string2Number(s.marginRight);

      let realWidth = 0;
      if (isBorderBox(s.boxSizing)) {
        realWidth = width + marginLeft + marginRight;
      } else {
        realWidth = width + paddingLeft + paddingRight + borderLeftWidth + borderRightWidth + marginLeft + marginRight;
      }
      return realWidth;
    }
    function getLeftSideHeight() {
      const leftSideStyle = window.getComputedStyle(leftSide.value!);
      return getRealHeightWithoutMargin(leftSideStyle);
    }
    function getFirstLineWidth() {
      let resultWidth = 0;
      const childArray = Array.from(leftSide.value!.children) as HTMLElement[];
      if (childArray.length) {
        resultWidth += childArray[0].offsetLeft;
      }
      childArray.find((child) => {
        if (child.offsetTop === baseOffsetTop) {
          resultWidth += getRealWidth(window.getComputedStyle(child));
          return false;
        } else {
          return true;
        }
      });
      return resultWidth;
    }
    function adjustBtnPosition() {
      const rightSideOffsetLeft = rightSide.value!.offsetLeft;
      const distance = rightSideOffsetLeft - getFirstLineWidth();
      btns.value!.style.left = `-${distance}px`;
      console.log('rightSideOffsetLeft :>> ', rightSideOffsetLeft);
      console.log('getFirstLineWidth() :>> ', getFirstLineWidth());
    }
    function showUnfoldBtn() {
      if (originHeight < getLeftSideHeight() - adjustment) {
        unfoldBtnVisibility.value = true;
      } else {
        unfoldBtnVisibility.value = false;
        folded.value = true;
        containerRef.value!.style.height = `${originHeight}px`;
      }
    }
    function changeStyle() {
      if (folded.value) {
        folded.value = false;
        const leftSideHeight = getLeftSideHeight();
        containerRef.value!.style.height = `${leftSideHeight - adjustment}px`;
      } else {
        folded.value = true;
        containerRef.value!.style.height = `${originHeight}px`;
      }
      const e = new Event('resize');
      setTimeout(() => {
        window.dispatchEvent(e);
      }, 100);
    }

    function setAdjustment(el) {
      adjustment += string2Number(window.getComputedStyle(el).marginBottom);
    }
    function setBaseOffsetTop(el: HTMLElement) {
      baseOffsetTop = string2Number(el.offsetTop);
    }
    function getChildHeightAndSetThings(el: HTMLElement) {
      const child = el.children.item(0) as HTMLElement;
      if (child) {
        setAdjustment(child);
        setBaseOffsetTop(child);
        const style = window.getComputedStyle(child);
        return getRealHeightWithoutMargin(style);
      }
      return 32;
    }
    onMounted(() => {
      const childHeight = getChildHeightAndSetThings(leftSide.value!);
      originHeight = childHeight;
      containerRef.value!.style.height = `${childHeight}px`;
      showUnfoldBtn();
      setTimeout(() => {
        adjustBtnPosition();
      }, 100);
      window.addEventListener('resize', showUnfoldBtn);
      window.addEventListener('resize', adjustBtnPosition);
    });
    onUnmounted(() => {
      window.removeEventListener('resize', showUnfoldBtn);
      window.removeEventListener('resize', adjustBtnPosition);
    });
    return () => (
      <div class={styleRef.value.container} ref={containerRef}>
        <div class={styleRef.value.wrapper}>
          <div class={styleRef.value.leftSide} ref={leftSide}>
            {slots.default?.() || undefined}
          </div>
          <div class={searchStyle.rightSide} ref={rightSide}>
            <div ref={btns} style="position:relative;transition:all ease 0.2s">
              <Button type="primary" onClick={() => emit('search')} style="margin-left:8px">
                查询
              </Button>
              <Button onClick={() => emit('reset')} style="margin-left:8px">
                重置
              </Button>
              {unfoldBtnVisibility.value ? (
                <Button type="link" onClick={changeStyle}>
                  {folded.value ? '展开' : '收起'}
                </Button>
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
