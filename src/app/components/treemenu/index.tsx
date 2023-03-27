import React, { useEffect, useState } from 'react';
import { Tree, message, Space, } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { EyeOutlined, EyeInvisibleOutlined, DeleteOutlined } from '@ant-design/icons';
import { uuid } from '../../utils/tools';
// import type { MenuProps } from 'antd';


const defaultData: any[] = [{
	key: 'parent',
	title: 'Layout',
	nodeType: 'root',
	data: {
		nodeType: 'root',
	},
	children: [],
}];

let selectedKey: string = '';
const TreeMenu: React.FC<{ [key: string]: any }> = ({ pluginMessage, onTreeSelet, onRender, onExport, btnOptType, }: any) => {
	const [gData, setGData] = useState(defaultData);
	const [messageApi, contextHolder] = message.useMessage();
	const [, setCurNode] = useState<any>({});
	const msgError = (msg: string) => {
		messageApi.warning(msg);
	};
  console.log('init', msgError);

	const onDragEnter: TreeProps['onDragEnter'] = () => { };
	const onSelect: TreeProps['onSelect'] = (selectedKeys) => {
		if (selectedKeys.length === 1) {
			selectedKey = selectedKeys[0] as string;
			const parentNode = findNode(gData, selectedKey);
      if (parentNode) {
        onTreeSelet(parentNode);
        parent.postMessage({ pluginMessage: { type: 'selected', message: { selectedKey: parentNode.kid, } } }, '*');
      } else {
        console.error(' parentNode find error')
      }
		}
	}
	const onDrop: TreeProps['onDrop'] = (info) => {
		const dropKey = info.node.key;
		const dragKey = info.dragNode.key;
		const dropPos = info.node.pos.split('-');
		const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
		console.log('info===', info, dropPosition)
		if (/^\d+-\d+$/.test(info.node.pos) && info.node.key === 'parent' && [-1, 1].includes(dropPosition)) {
			return;
		}
		const loop = (
			data: DataNode[],
			key: React.Key,
			callback: (node: DataNode, i: number, data: DataNode[]) => void,
		) => {
			for (let i = 0; i < data.length; i++) {
				if (data[i].key === key) {
					return callback(data[i], i, data);
				}
				if (data[i].children) {
					loop(data[i].children!, key, callback);
				}
			}
		};
		const data = [...gData];

		// Find dragObject
		let dragObj: DataNode;
		loop(data, dragKey, (item, index, arr) => {
			arr.splice(index, 1);
			dragObj = item;
		});

		if (!info.dropToGap) {
			// Drop on the content
			loop(data, dropKey, (item) => {
				item.children = item.children || [];
				// where to insert 示例添加到头部，可以是随意位置
				item.children.unshift(dragObj);
			});
		} else if (
			((info.node as any).props.children || []).length > 0 && // Has children
			(info.node as any).props.expanded && // Is expanded
			dropPosition === 1 // On the bottom gap
		) {
			loop(data, dropKey, (item) => {
				item.children = item.children || [];
				// where to insert 示例添加到头部，可以是随意位置
				item.children.unshift(dragObj);
				// in previous version, we use item.children.push(dragObj) to insert the
				// item to the tail of the children
			});
		} else {
			let ar: DataNode[] = [];
			let i: number;
			loop(data, dropKey, (_item, index, arr) => {
				ar = arr;
				i = index;
			});
			if (dropPosition === -1) {
				ar.splice(i!, 0, dragObj!);
			} else {
				ar.splice(i! + 1, 0, dragObj!);
			}
		}
		setGData(data);
	};

	const handleBtn = (type: string) => {
		if (['join', 'import'].includes(type)) {
			parent.postMessage({ pluginMessage: { type, } }, '*');
		} else if (type === 'virtual-node') {
			createVirtualNode()
		} else if (type === 'export') {
			onExport(gData)
		} else if (type === 'render') {
			onRender(gData)
		}
	}

	useEffect(() => {
		handleBtn(btnOptType.split('_')[1])
	}, [btnOptType])

	const createVirtualNode = () => {
		const data = [...gData];
		const parentNode = findNode(data, selectedKey);
		let optNode = data[0].children;
		if (parentNode && Array.isArray(parentNode.children)) {
			optNode = parentNode.children;
		}
		const unid = uuid(6, 6)
		optNode.push({
			key: unid,
			title: `v-${unid.substring(0, 6)}`,
			nodeType: 'virtual',
			data: {
				nodeShow: true,
				nodeType: 'view',
			},
			children: [],
		});
		setGData([...data]);
	}
	const delNode = (key) => {
		const curNode = findNode(gData, key);
		if (curNode.key === 'parent') return;
		const datas = [...gData];
		removeNode(datas, key)
		selectedKey === key && (selectedKey = '')
		setGData([...datas])
	}

	const checkNodeStatus = (key) => {
		const curNode = findNode(gData, key);
		setCurNode({ ...curNode });
		if (curNode && curNode.data) {
			curNode.data.nodeShow = !curNode.data?.nodeShow;
			setGData([...gData])
		}
	}

	// const items = (key: any): MenuProps['items'] => [
	// 	{
	// 		label: <Button type="link" danger onClick={() => delNode(key)}>Delete</Button>,
	// 		key: '1',
	// 	},
	// 	{
	// 		label: <Button type="link" onClick={() => checkNodeStatus(key)}>{curNode.data?.nodeShow === false ? 'Show' : 'Hidden'}</Button>,
	// 		key: '2',
	// 	},
	// ];

	const findNode = (nodes: any, kid: string) => {
		let result = null;
		const dg = (datas: any) => {
			for (let i = 0; i < datas.length; i++) {
				if (result) return;
				if (datas[i].key === kid) {
					result = datas[i];
					return result
				}
				if (datas[i].children && datas[i].children.length) {
					dg(datas[i].children);
				}
			}
		}
		dg(nodes);
		return result
	}

	const removeNode = (nodes: any, kid: string) => {
		let result = null;
		const dg = (datas: any) => {
			for (let i = 0; i < datas.length; i++) {
				if (result) return;
				if (datas[i].key === kid) {
					result = datas[i];
					datas.splice(i, 1)
					return result
				}
				if (datas[i].children && datas[i].children.length) {
					dg(datas[i].children);
				}
			}
		}
		dg(nodes);
		return result
	}

	React.useEffect(() => {
		if (!pluginMessage) return;
		const { type, message } = pluginMessage;
		const data = [...gData];
		if (['join', 'import'].includes(type)) {
			// const findItem = findNode(data, message.kid);
			// if (findItem) {
			// 	msgError('节点已存在!');
			// 	return;
			// }
			const parentNode = findNode(data, selectedKey);
			let optNode = data[0].children;
			if (parentNode && Array.isArray(parentNode.children)) {
				optNode = parentNode.children;
			}
			optNode.push(type === 'import' ? { ...message.rootNode } : {
				key: message.key,
        kid:  message.kid,
				title: message.name,
				nodeType: 'view',
				data: {
					nodeShow: true,
					nodeType: 'view',
          cssCode: message.cssCode ? `${ message.cssCode }` : '',
          txtContent:  message.txtContent || '', 
				},
				children: [],
			});
			setGData([...data]);
		} else if (type === 'node-show') {
			setGData([...gData])
		} else if (type === 'node-del') {
			const datas = [...gData];
			removeNode(datas, message.key)
			selectedKey = ''
			setGData([...datas])
		}
	}, [pluginMessage])

	return (
		<div className='tree-c'>
			{contextHolder}
			<Tree
				className="draggable-tree"
				titleRender={(node: any) => (
					// <Dropdown menu={ { items: items(node.key) } } trigger={['contextMenu']}>
					//   <div className='white-space-nowrap'>
					//     {node.title} 
					//     <Space style={{ marginLeft: '4px'}}>{ node.data.nodeShow === false ?  <EyeInvisibleOutlined /> : <EyeOutlined /> } </Space>
					//   </div>
					// </Dropdown>
					<div className="white-space-nowrap flex" title={node.title} >
						<div className="t-title"> {node.title} </div>
            {
							node.key !== 'parent' ?
								(<><Space style={{ marginLeft: '4px', verticalAlign: 'top' }} onClick={() => checkNodeStatus(node.key)}>
									{/* {curNode.data?.nodeShow === false ? 'Show' : 'Hidden'} */}
									{node.data.nodeShow === false ? <EyeInvisibleOutlined /> : <EyeOutlined />}
								</Space><Space style={{ marginLeft: '4px', verticalAlign: 'top' }} onClick={() => delNode(node.key)}> <DeleteOutlined style={{
									color
										: '#ED4343'
								}} /> </Space></>
								) : ''
						}
					</div>
				)
				}
				draggable
				blockNode
				onDragEnter={onDragEnter}
				onDrop={onDrop}
				treeData={gData}
				onSelect={onSelect}
			/>
		</div>
	);
};

export default TreeMenu;