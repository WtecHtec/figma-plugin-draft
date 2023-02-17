import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css, cssLanguage } from '@codemirror/lang-css';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Form, Input, Select, Alert, Space, InputNumber, Button } from 'antd';
const { TextArea } = Input;
const SettingView: React.FC<{[key:string]: any}> = ( { treeNode, onAction } : any) => {
  const [cssCode,  setCssCode] = useState('');
  const [txtContent, setTxtContent] = useState('');
  const [nodeType, setNodeType] = useState('view');
  const [clsName, setClsName] = useState('');
  const [condition, setCondition] = useState('');
  const [nodeTypeOptions, setNodeTypeOptions] = useState([]);
  const [nodeShow, setNodeShow] = useState(true)
  const [isShow, setIsShow] = useState(false);
  useEffect(()=> {
    console.log('treeNode====', treeNode)
    if (!treeNode || treeNode.nodeType === 'root') {
      setIsShow(false)
      return;
    }
    const { data, children } = treeNode;
    setNodeType(data.nodeType)
    setCssCode('');
    setTimeout(() => {
      setCssCode(data.cssCode || '.v{}');
    }, 0)
    setClsName(data.clsName || '')
    setCondition(data.condition)
    setNodeShow(!!data.nodeShow);
    setTxtContent(data.txtContent);
    const nodeTypeOptions = [];
    if (data.nodeType === 'wxif' && Array.isArray(children)) {
      children.forEach(v => {
        nodeTypeOptions.push({ value: v.key, label: v.title })
      })
      setNodeTypeOptions(nodeTypeOptions);
    } 
    setIsShow(true);
  }, [treeNode])

  const onCssCodeChange = (value,) => {
    treeNode.data.cssCode = value;
  };

  const handleNodeTypeChange = (value: any) => {
    treeNode.data.nodeType = value;
    const { children } = treeNode;
    if (value === 'wxif' && Array.isArray(children)) {
      const nodeTypeOptions = [];
      children.forEach(v => {
        nodeTypeOptions.push({ value: v.key, label: v.title })
      })
      setNodeTypeOptions(nodeTypeOptions);
    } else if (value === 'wxfor') {
      setCondition('1');
    }
    setNodeType(value);
  };

  const handleCondChange = (value: any) => {
    treeNode.data.condition = value;
    setCondition(value)
  }

  return <>
    <div style={{ visibility: isShow ? 'visible': 'hidden', height: '0'}}>
      <Alert message={ <div>
        <Space>**属性值前加一个空格</Space>
        <Space> @retina_one_px_border: direction = (all|top|bottom|right|left),color =(颜色值) (1px 边框);</Space>
        <Space> @ellipsis_lines: lines = (数值); (超出多少行显示...)</Space>
      </div> }  type="info" showIcon />
      <Form layout="vertical">
        <Form.Item label="Action">
          <Space style={{ cursor: 'pointer'}}>
            <EyeOutlined onClick={() => (treeNode.data.nodeShow = true, setNodeShow(true), onAction('node-show', true,))} style={ {color: nodeShow ? '#2657F0' : '#666666' }} /> 
            <EyeInvisibleOutlined onClick={() => (treeNode.data.nodeShow = false, setNodeShow(false), onAction('node-show', false,))} style={ {color: !nodeShow ? '#2657F0' : '#666666' }} />
          </Space>
          <Button type="link" danger onClick={ ()=> (setIsShow(false), onAction('node-del', treeNode,))}> Del</Button>
        </Form.Item>
        <Form.Item label="NodeType" >
          <Select
            style={{ width: 120 }}
            value={nodeType}
            onChange={handleNodeTypeChange}
            options={[
              { value: 'view', label: 'VIEW' },
              // { value: 'wxif', label: 'WX:IF' },
              // { value: 'wxfor', label: 'WX:FOR' },
            ]}
          />
        </Form.Item>
        { nodeType !== 'view' && <Form.Item label="Condition" >
         { nodeType === 'wxif' 
            ? <Select
                style={{ width: 120 }}
                value={condition}
                onChange={handleCondChange}
                options={nodeTypeOptions}/>
            : <InputNumber min={1} max={10} value={condition as unknown as number} onChange={handleCondChange} />
          }
        </Form.Item> } 
        <Form.Item label="CSS" >
          <CodeMirror
            value={cssCode}
            height="200px"
            extensions={[css(), cssLanguage,]}
            onChange={onCssCodeChange}
          />
        </Form.Item>
        <Form.Item label="Content" >
          <TextArea
            value={txtContent}
            onChange={(e) => (treeNode.data.txtContent = e.target.value, setTxtContent(e.target.value))}
            placeholder="Content Desc"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>
        <Form.Item label="ClassName" style={{ display: 'none',}}  >
          <Input value={clsName}  onChange={(e) => (treeNode.data.clsName = e.target.value, setClsName(e.target.value))} />
        </Form.Item>
      </Form>
    </div>
  </>
}

export default SettingView;