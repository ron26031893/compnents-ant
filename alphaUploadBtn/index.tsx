import { defineComponent, ref, StyleValue, Teleport } from "vue";
import { type PropType } from "vue";
import { Upload as AUpload, Button as AButton, message, Modal, Spin } from "ant-design-vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import { inDevMode, errorModal } from "../utils";
import { ButtonType } from "ant-design-vue/lib/button";
if (inDevMode()) {
	console.log("AlphaUploadBtn Version v0.1.0");
}

export default defineComponent({
	name: "AlphaUploadBtn",
	props: {
		action: {
			type: String,
			required: true,
		},
		parseExcel: {
			type: Function as PropType<(file) => Promise<any>>,
			default: function (file) {
				return Promise.resolve();
			},
		},
		limitationCheckerChain: {
			type: Object as PropType<((file) => void)[]>,
			default: [
				function (file) {
					const acceptType = ["xlsx", "xls"];
					const type = file.name.slice(file.name.lastIndexOf(".") + 1);
					if (!acceptType.includes(type)) {
						message.error("仅支持导入excel文件");
						throw new Error("仅支持导入excel文件");
					}
				},
			],
		},
		btnType: {
			type: String,
			default: "default",
		},
		title: {
			type: String,
			default: "导入",
		},
		requestInstance: {
			type: Function,
			required: true,
		},
		additionalParams: {
			type: Object,
			default: {},
		},
		after: {
			type: Function,
			default(res) {},
		},
	},
	emits: ["uploadEnded", "error"],
	setup(props, { attrs, slots, emit, expose }) {
		const uploading = ref(false);
		const spinTip = ref("文件正在上传中 00.00%");
		const maskStyle: StyleValue = {
			position: "absolute",
			width: "100%",
			height: "100%",
			top: "0px",
			"z-index": 1501,
			"background-color": "rgba(0, 0, 0, 0.10)",
		};
		const spinStyle: StyleValue = {
			position: "absolute",
			top: "50%",
			left: "50%",
			transform: "translate(-50%,-50%)",
		};
		const fileList = ref([]);

		function progressHandler(progressEvent) {
			spinTip.value = `文件上传中 ${((progressEvent.loaded * 100) / progressEvent.total).toFixed(2)}%`;
			progressEvent.target.onload = () => {
				spinTip.value = "文件上传成功, 正在处理...";
			};
		}

		function upload(uploadFile) {
			if (!props.action) {
				console.error("AlphaUploadBtn:未给定上传地址action!");
				return Promise.reject("AlphaUploadBtn:未给定上传地址action!");
			}
			const formData = new FormData();
			for (const key in props.additionalParams) {
				formData.append(key, props.additionalParams[key]);
			}
			formData.append("file", uploadFile);
			//call upload api
			return props.requestInstance({
				method: "post",
				data: formData,
				url: props.action,
				onUploadProgress: progressHandler,
				timeout: 0,
			});
		}

		async function beforeUploadHandler(file) {
			try {
				for (const fn of props.limitationCheckerChain) {
					await fn(file);
				}
			} catch (error) {
				return AUpload.LIST_IGNORE;
			}
			const uploadFile = file.originFileObj ?? file;
			spinTip.value = "文件正在上传中 00.00%";
			props.parseExcel(uploadFile).then((msg) => {
				let resultObj;
				if (msg) {
					Modal.confirm({
						title: "解析成功",
						content: msg,
						centered: true,
						okText: "确认导入",
						onOk() {
							uploading.value = true;
							upload(uploadFile)
								.then(
									(res) => {
										resultObj = {
											status: "success",
											playload: res,
										};
									},
									(errMsg) => {
										resultObj = {
											status: "fail",
											playload: `导入出现问题:${errMsg}`,
										};
									}
								)
								.finally(() => {
									uploading.value = false;
									props.after(resultObj);
								});
						},
						onCancel() {
							Modal.destroyAll();
						},
					});
				} else {
					uploading.value = true;
					upload(uploadFile)
						.then(
							(res) => {
								message.success("成功");
								resultObj = {
									status: "success",
									playload: res,
								};
							},
							(errMsg) => {
								resultObj = {
									status: "fail",
									playload: errMsg,
								};
							}
						)
						.finally(() => {
							uploading.value = false;
							props.after(resultObj);
						});
				}
			});
			return Promise.reject();
		}

		return () => (
			<AUpload fileList={fileList.value} beforeUpload={beforeUploadHandler} showUploadList={false}>
				<AButton type={props.btnType as ButtonType}>
					<UploadOutlined></UploadOutlined>
					{props.title}
				</AButton>
				<Teleport to={"body"}>
					{uploading.value ? (
						<div style={maskStyle as StyleValue}>
							<Spin tip={spinTip.value} style={spinStyle}></Spin>
						</div>
					) : undefined}
				</Teleport>
			</AUpload>
		);
	},
});
