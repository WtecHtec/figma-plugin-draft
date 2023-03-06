import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css, cssLanguage } from '@codemirror/lang-css';
import { Form, Input, Alert, Space, } from 'antd';
const { TextArea } = Input;
const SettingView: React.FC<{[key:string]: any}> = ( { treeNode } : any) => {
  const [cssCode,  setCssCode] = useState('');
  const [txtContent, setTxtContent] = useState('');

  const [clsName, setClsName] = useState('');

  const [isShow, setIsShow] = useState(false);
  useEffect(()=> {
    if (!treeNode || treeNode.nodeType === 'root') {
      setIsShow(false)
      return;
    }
    const { data, } = treeNode;
    setCssCode('');
    setTimeout(() => {
      setCssCode(data.cssCode || '.v{}');
    }, 0)
    setClsName(data.clsName || '')
    setTxtContent(data.txtContent);
    setIsShow(true);
  }, [treeNode])

  const onCssCodeChange = (value,) => {
    treeNode.data.cssCode = value;
  };

  return <>
    <div style={{ visibility: isShow ? 'visible': 'hidden', height: '0'}}>
      <Alert message={ <div>
        <Space>**属性值前加一个空格</Space>
        <Space> @retina_one_px_border: direction = (all|top|bottom|right|left),color =(颜色值) (1px 边框);</Space>
        <Space> @ellipsis_lines: lines = (数值); (超出多少行显示...)</Space>
      </div> }  type="info" showIcon />
      <Form layout="vertical">
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