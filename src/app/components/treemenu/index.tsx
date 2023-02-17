import React, { useState } from 'react';
import { Tree, Button, message, Space } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { EyeOutlined, EyeInvisibleOutlined  } from '@ant-design/icons';
import { uuid } from '../../utils/tools';


       
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
const TreeMenu: React.FC<{[key:string]: any}> = ({ pluginMessage, onTreeSelet, onRender, onExport } : any) => {
  const [gData, setGData] = useState(defaultData);
  const [messageApi, contextHolder] = message.useMessage();

  const msgError = (msg: string) => {
    messageApi.warning(msg);
  };

  const onDragEnter: TreeProps['onDragEnter'] = () => {
    // console.log(info);
    // expandedKeys 需要受控时设置
    // setExpandedKeys(info.expandedKeys)
  };
  const onSelect: TreeProps['onSelect'] = (selectedKeys) => {
    if (selectedKeys.length === 1) {
      selectedKey = selectedKeys[0] as string;
      const parentNode = findNode(gData, selectedKey);
      onTreeSelet(parentNode);
      parent.postMessage({ pluginMessage: { type: 'selected', message: {  selectedKey, } } }, '*');
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
    if (['join'].includes(type)) {
      parent.postMessage({ pluginMessage: { type, } }, '*');
    } else if (type === 'virtual-node') {
      createVirtualNode()
    } else if (type === 'export') {
      onExport(gData)
    } else if (type === 'render') {
      onRender(gData)
    }
  }

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
  
  // const items: MenuProps['items'] = [
  //   {
  //     key: 'virtual-node',
  //     label: (
  //       <Button type="link" onClick={ ()=> handleBtn('virtual-node')}>Virtual-Node</Button>
  //     ),
  //     disabled: true,
  //   },
  //   {
  //     key: 'export',
  //     label: (
  //       <Button type="link" onClick={ ()=> handleBtn('export')}>Export</Button>
  //     ),
  //   },
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

  React.useEffect(()=> {
    if (!pluginMessage) return;
    const { type, message } = pluginMessage;
    const data = [...gData];
    if (type === 'join') {
      const findItem =  findNode(data, message.kid);
      if (findItem) {
        msgError('节点已存在!');
        return;
      }
      const parentNode = findNode(data, selectedKey);
      let optNode = data[0].children;
      if (parentNode && Array.isArray(parentNode.children)) {
        optNode = parentNode.children;
      } 
      optNode.push({
        key: message.kid,
        title: message.name,
        nodeType: 'view',
        data: {
          nodeShow: true,
          nodeType: 'view',
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
      <div className='tree-btn-c'>
        <Button type="link" onClick={ ()=> handleBtn('join')}>Join</Button>
        <Button type="link" onClick={ ()=> handleBtn('render')}>Render</Button>
        <Button type="link" onClick={ ()=> handleBtn('virtual-node')}>VNode</Button>
        <Button type="link" onClick={ ()=> handleBtn('export')}>Export</Button>
        {/* <Dropdown menu={{ items }} trigger={ ['click']} >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              Action<DownOutlined />
            </Space>
          </a>
        </Dropdown> */}
      </div>
      <Tree
        className="draggable-tree"
        titleRender={ (node: any)=> <div className='white-space-nowrap'>{node.title} 
          <Space style={{ marginLeft: '4px'}}>{ node.data.nodeShow === false ?  <EyeInvisibleOutlined /> : <EyeOutlined /> } </Space></div>}
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