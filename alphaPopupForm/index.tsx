import { computed, defineComponent, onUpdated, ref, watch } from "vue";
import { message, Modal } from "ant-design-vue";
import { default as AlphaForm } from "../alphaForm";
import { errorModal } from "../utils";
import { type PropType } from "vue";
import { type FormConfig } from "../alphaForm";

interface Model {
	[key: string]: any;
}
interface PopupFormConfig {
	model: Model;
	submit?: (submitData) => Promise<any>;
	dataHandler?: (dataToBeHandled) => any;
	rules?: any;
	formConfig?: FormConfig;
	successMsg?: string;
	errMsg?: string;
	width?: string;
	title?: string;
	magicCallbacks?: ((formData, formRef?) => any)[];
	whenFinished?: () => any;
}
export { PopupFormConfig };
export default defineComponent({
	name: "AlphaPopupForm",
	props: {
		visible: {
			type: Boolean,
			required: true,
		},
		config: {
			type: Object as PropType<PopupFormConfig>,
			required: true,
		},
	},
	emits: ["update:visible", "cancle", "success", "error"],
	setup(props, { attrs, slots, emit, expose }) {
		const confirmLoading = ref(false);
		const customFormInstance = ref();
		let { submit, dataHandler } = props.config;
		watch(
			() => props.config,
			() => {
				submit = props.config.submit;
			},
			{ immediate: true }
		);
		function changeVisibilityTo(value) {
			emit("update:visible", value);
		}

		function okHandler() {
			if (!submit) {
				changeVisibilityTo(false);
				return;
			}
			customFormInstance.value
				.getFormRef()
				.value.validate()
				.then(() => {
					confirmLoading.value = true;
					let submitData;
					// if (dataHandler) {
					//   submitData = dataHandler(customFormInstance.value.getSubmitData());
					// }
					submitData = customFormInstance.value.getSubmitData();
					submit!(submitData)
						.then(() => {
							message.success(props.config.successMsg);
							changeVisibilityTo(false);
							emit("success");
						})
						.finally(() => {
							props.config.whenFinished?.();
							confirmLoading.value = false;
						});
				});
		}
		expose({
			formRef: customFormInstance,
		});
		return () => (
			<Modal
				visible={props.visible}
				{...{
					"onUpdate:visible": (value) => {
						emit("update:visible", value);
					},
				}}
				title={props.config.title}
				width={props.config.width}
				centered={true}
				confirmLoading={confirmLoading.value}
				onOk={okHandler}
				onCancel={(e) => {
					emit("cancle", e);
				}}
				destroyOnClose={true}>
				<AlphaForm
					ref={customFormInstance}
					model={props.config.model}
					rules={props.config.rules}
					dataHandler={props.config.dataHandler}
					formConfig={props.config.formConfig}
					magicCallbacks={props.config.magicCallbacks}>
					{{
						default: slots.default,
					}}
				</AlphaForm>
			</Modal>
		);
	},
});
