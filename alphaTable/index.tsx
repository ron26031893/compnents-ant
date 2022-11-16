import {
	computed,
	defineComponent,
	onBeforeUnmount,
	onMounted,
	onUpdated,
	ref,
	watch,
} from "vue";
import type { PropType, Ref, ComputedRef } from "vue";
import {
	message,
	Table as ATable,
	TableProps,
	type TablePaginationConfig,
} from "ant-design-vue";
import { usePaginationConfig } from "./hooks/tableHooks";
import { deepClone } from "./utils/helper";
interface ScrollConfig {
	x: number | string | true | undefined;
	y: number | string | undefined;
	scrollToFirstRowOnChange: boolean | undefined;
}

export interface TableConfig {
	rowKey: string;
	whereis?: string | string[];
	fetchTableData:
		| ((queryParams: Object | undefined, additionalParam?: any) => Promise<any>)
		| undefined
		| null;
	paginationSize?: "small";
	pageSizeOptions?: string[];
	additionalParam?: any;
	queryParams?: { [key: string]: any };
	scrollConfig?: ScrollConfig;
	rowSelection?: {
		preserveSelectedRowKeys?: boolean;
		selectedRowKeys: any[];
		onChange?: (selectedRowKeys: any, selectedRows: any) => any;
		getCheckboxProps?: (record: any) => { disabled: boolean; name: string };
		onSelect?: (
			record: any,
			selected?: boolean,
			selectedRows?,
			nativeEvent?
		) => any;
		onSelectAll?: (selected: boolean, selectedRows?, changeRows?) => any;
	};
	before?: (dataSource: any[]) => any[]; //前置钩子,必须要有返回值, 返回值可以影响列表数据
	after?: (dataSource) => void; //后置钩子, 在完成数据获取之后会将数据当作参数传给后置钩子
}

interface TableMatirials {
	dataSource: Ref<any[]>;
	pagination: Ref<TablePaginationConfig>;
	columns: ComputedRef<any>;
	scrollConfig: Ref<ScrollConfig | undefined>;
	tableLoading: Ref<Boolean>;
}

function print(...arg): void {
	console.log(...arg);
}
function printDir(...arg): void {
	console.dir(...arg);
}

export default defineComponent({
	name: "AlphaTable",
	props: {
		columns: {
			type: Array,
			required: true,
		},
		tableConfig: {
			type: Object as PropType<TableConfig>,
			required: true,
		},
	},
	emits: ["afterDataFetched"],
	setup(props, { attrs, slots, emit, expose }) {
		const tableMatirials = {
			dataSource: ref<any[]>([]),
			pagination: usePaginationConfig(
				props.tableConfig.paginationSize,
				props.tableConfig.pageSizeOptions
			),
			columns: computed<any[]>(() => {
				return props.columns;
			}),
			scrollConfig: ref<ScrollConfig | undefined>(
				deepClone(props.tableConfig.scrollConfig)
			),
			tableLoading: ref(false),
			rowSelection: computed(() => {
				if (!props.tableConfig.rowSelection) {
					return undefined;
				}
				const result = deepClone(props.tableConfig.rowSelection);
				if (result.preserveSelectedRowKeys === undefined) {
					result.preserveSelectedRowKeys = true;
				}
				result.selectedRowKeys = ref(result.selectedRowKeys);
				result.customOnChange = result.onChange;
				result.onChange = function (selectedRowKeys, selectedRows) {
					result.selectedRowKeys.value = selectedRowKeys;
					if (
						result.customOnChange &&
						typeof result.customOnChange === "function"
					) {
						result.customOnChange(selectedRowKeys, selectedRows);
					}
				};
				return result;
			}),
		};
		const table = ref();
		let adapting = false;
		function adaptParentHeight(dataLength, scrollConfig, tScrollConfig) {
			function getElementOuterHeight(el: HTMLElement) {
				if (!el) {
					return 0;
				}
				let result = 0;
				const computedStyle = window.getComputedStyle(el);
				const marginTop = Number(
					computedStyle.marginTop.match(/[0-9]+/g)?.[0] || 0
				);
				const marginBottom = Number(
					computedStyle.marginBottom.match(/[0-9]+/g)?.[0] || 0
				);
				result = el.clientHeight + marginTop + marginBottom;
				return result;
			}
			if (adapting) {
				console.log("adapting, adapt aborted");
				return;
			}
			adapting = true;
			const totalHeight = dataLength * 57; //表格每一行的高度是57
			if (table.value && totalHeight) {
				const parentNode = table.value.parentNode;
				const parentComputedStyle = window.getComputedStyle(parentNode);
				const parentPaddingTop = Number(
					parentComputedStyle.paddingTop.match(/[0-9]+/g)?.[0] || 0
				);
				const parentPaddingBottom = Number(
					parentComputedStyle.paddingBottom.match(/[0-9]+/g)?.[0] || 0
				);
				const parentClientHeight =
					parentNode.clientHeight - parentPaddingBottom - parentPaddingTop;
				const children: HTMLElement[] = Array.from(parentNode.children);
				const childrenHeight = children.reduce((accumulator, v) => {
					if (v !== table.value) {
						return (accumulator +
							getElementOuterHeight(v as HTMLElement)) as number;
					}
					return accumulator;
				}, 0);
				const targetHeight =
					Number(parentClientHeight) - childrenHeight - 114.14;
				if (targetHeight <= totalHeight) {
					scrollConfig.value.y = targetHeight;
				} else {
					scrollConfig.value.y = totalHeight;
				}
			} else {
				if (scrollConfig.value) {
					scrollConfig.value.y = tScrollConfig.y;
					if (scrollConfig.value.y && totalHeight <= scrollConfig.value.y) {
						scrollConfig.value.y = undefined; //防止最右边出现垂直空隙
					}
				}
			}
			adapting = false;
		}

		function getTableData(
			current: number | undefined,
			pageSize: number | undefined,
			tableConfig: TableConfig,
			tableMatirials: TableMatirials
		): Promise<any> {
			if (!tableConfig.fetchTableData) {
				return Promise.reject("未传递获取表格数据API调用函数");
			}
			const { fetchTableData, queryParams, additionalParam, before, after } =
				tableConfig;
			const { tableLoading, dataSource, pagination, scrollConfig } =
				tableMatirials;
			tableLoading.value = true;
			return fetchTableData(
				{ ...queryParams, current, pageSize },
				additionalParam
			)
				.then((response) => {
					const whereis = props.tableConfig.whereis || "rows";
					pagination.value.current = current;
					pagination.value.pageSize = pageSize;
					pagination.value.total = response.total;
					let tableData;
					if (whereis) {
						if (typeof whereis === "object" && whereis instanceof Array) {
							tableData = whereis.reduce((lastLayer, curKey) => {
								if (lastLayer) {
									return lastLayer[curKey];
								}
								return undefined;
							}, response);
						} else if (typeof whereis === "string") {
							tableData = response[whereis];
						}
					} else {
						tableData = response["rows"];
					}

					if (!tableData) {
						console.error(
							`AlphaTable: 无法从指定位置(${whereis || "rows"})找到列表数据`
						);
						tableLoading.value = false;
						return;
					}

					if (before) {
						tableData = before(tableData);
					}
					dataSource.value.splice(0);
					tableData.forEach((v) => {
						dataSource.value.push(v);
					});
					if (after) {
						after(deepClone(tableData));
					}

					tableLoading.value = false;

					const length = dataSource.value.length;
					adaptParentHeight(length, scrollConfig, tableConfig.scrollConfig);

					return dataSource.value;
				})
				.catch((msg) => {
					message.error(msg);
					return Promise.reject(msg);
				});
		}

		function reloadTableData() {
			getTableData(
				tableMatirials.pagination.value.current,
				tableMatirials.pagination.value.pageSize,
				props.tableConfig,
				tableMatirials
			).then((tableData) => {
				emit("afterDataFetched", deepClone(tableData));
			});
		}

		function handlePaginationChange(pagination) {
			getTableData(
				pagination.current,
				pagination.pageSize,
				props.tableConfig,
				tableMatirials
			).then((tableData) => {
				emit("afterDataFetched", deepClone(tableData));
			});
		}

		function getSelectedRowKeys() {
			return deepClone(
				tableMatirials.rowSelection.value?.selectedRowKeys.value
			);
		}
		function clearSelectedRowKeys() {
			if (tableMatirials.rowSelection.value) {
				tableMatirials.rowSelection.value.selectedRowKeys.value.splice(0);
			}
		}

		reloadTableData();
		expose({
			reloadTableData,
			dataSource: deepClone(tableMatirials.dataSource.value),
			getSelectedRowKeys,
			clearSelectedRowKeys,
		});
		watch(props.tableConfig.queryParams!, () => {
			getTableData(
				1,
				tableMatirials.pagination.value.pageSize,
				props.tableConfig,
				tableMatirials
			).then((tableData) => {
				emit("afterDataFetched", deepClone(tableData));
			});
		});

		/**
		 * window resize event listener
		 */
		function adaptWrapper() {
			adaptParentHeight(
				tableMatirials.dataSource.value.length,
				tableMatirials.scrollConfig,
				props.tableConfig.scrollConfig
			);
		}
		onMounted(() => {
			adaptWrapper();
			window.addEventListener("resize", adaptWrapper);
		});

		onBeforeUnmount(() => {
			window.removeEventListener("resize", adaptWrapper);
		});

		return () => (
			<div ref={table}>
				<ATable
					rowKey={props.tableConfig.rowKey}
					columns={tableMatirials.columns.value}
					dataSource={tableMatirials.dataSource.value}
					loading={tableMatirials.tableLoading.value}
					pagination={tableMatirials.pagination.value}
					scroll={tableMatirials.scrollConfig.value}
					onChange={handlePaginationChange}
					rowSelection={tableMatirials.rowSelection.value}>
					{{
						bodyCell: ({ text, record, index, column }) => {
							if (slots?.default) {
								return slots.default({ text, column, record, reloadTableData });
							}
							return text;
						},
					}}
				</ATable>
			</div>
		);
	},
});
