import React from 'react';
import '../styles/ui.css';
import TreeMenu from './treemenu';
import SettingView from './setting';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Space, Button, Divider  } from 'antd';
import { CSS_RULES } from '../assets/atom/css_rules';
import { STYLE_MIXIN } from '../assets/atom/style-mixin';
import 'antd/dist/reset.css';
const colors = require('nice-color-palettes');
const postcss = require('postcss');
import { uuid } from '../utils/tools';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
const beautifyCss = require('js-beautify').css;
const beautifyHtml = require('js-beautify').html;

let gRuleNodes = [];
let gAtomRules = [];
let gArrayRules = [];
let gAfPseudoRules = [];
let gBePseudoRules = [];
const InitRules = () => {
  postcss().process(CSS_RULES, { from: undefined })
    .then(result => {
      gRuleNodes = result.root.nodes
      // console.log('result.root==', result.root) 
      gRuleNodes.forEach(item => {
        const { type , selector, nodes } = item;
        if (type === 'rule') {
          if (selector.includes('::after')) {
            gAfPseudoRules.push(item)
          } else if(selector.includes('::before')) {
            gBePseudoRules.push(item)
          } else if (nodes.length > 1) {
            gArrayRules.push(item);
          } else if (nodes.length === 1)  {
            gAtomRules.push(item)
            // const { prop, value } = nodes[0]
            // gAtomRules[`${prop}-${value}`] = selector.substring(1);
          }
        }
      })
    })
}

InitRules();
// const DATAS = [{ 
//     "key":"parent",
//     "title":"Layout",
//     "nodeType":"root",
//     "data":{"nodeType":"root"},
//     "children":[
//       {"key":"AEDFFF","title":"v-AEDFFF","nodeType":"virtual",
//       "data":{"nodeShow":true, "txtContent": "", "nodeType":"view","cssCode":"{\n  position: ffrelative;\n  width: 80px;\n  height: 80px;\n}::after{position:absolute;\n border: 2px solid #ffffff;}"},
//         "children":[
//             {"key":"3:106","title":"Frame 2938","nodeType":"view","data":{"nodeShow":true,"nodeType":"view","cssCode":"{\n  position: ffrelative;\n  width: 100%;\n height: 100%;\n}::after{ @retina_one_px_border: top, #ffffff;\n}"},"children":[]},
//             {"key":"3:108","title":"Group 89","nodeType":"view","data":{"nodeShow":true,"nodeType":"view","cssCode":"{\n  @ellipsis_lines: 1; \n position: absolute;\n  bottom:0;\n  right:0;\n width: 28px;\n height: 28px;\n}"},"children":[]}
//           ]}
//     ]}];
function App() {
  // const textbox = React.useRef<HTMLInputElement>(undefined);
  const [pluginMessage, setPluginMessage] = React.useState();
  const [treeNode, setTreeNode] = React.useState();
  const [runShow, setRunShow] = React.useState(false)
  const [exportShow, setExportShow] = React.useState(false)
  const [viewCodeString, setViewCodeString] = React.useState('')
  const [cssCodeString, setCssCodeString] = React.useState('')

  // const countRef = React.useCallback((element: HTMLInputElement) => {
  //   if (element) element.value = '1';
  //   textbox.current = element;
  // }, []);

  // const onCreate = () => {
  //   const count = parseInt(textbox.current.value, 10);
  //   parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*');
  // };

  // const onCancel = () => {
  //   parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
  // };

  React.useEffect(() => {
    console.log('window.onmessage===', Math.random())
    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      console.log('window.onmessage===1')
      const { type, message } = event.data.pluginMessage;
      if (type === 'join') {
        setPluginMessage(event.data.pluginMessage)
      }
      if (type === 'create-rectangles') {
        console.log(`Figma Says: ${message}`);
      }
      const selor =  document.getElementsByClassName('object_row--selected--obsqL')
      console.log('selor===', window.parent, selor)
    };
  }, []);

  const onTreeSelet = (value: any) => {
    setTreeNode(value);
  }

  const onAction = (type: string, data: any) => {
    console.log(type, data);
    const pluginMessage = {
      type,
      message: data,
    } as any;
    setPluginMessage(pluginMessage)
  }
  const renderView = async (domDatas) => {
    if (!gRuleNodes.length) { console.error('gRuleNodes empty') ; return};
    const p = document.querySelector('#hostElement');  // ①
    let shadowRoot = p.shadowRoot;
    if (!p.shadowRoot) {
      shadowRoot =  p.attachShadow({mode: 'open'});  // ②
    }
    const [remaStyle, rootDom] = await runView(domDatas)
      // ③
      shadowRoot.innerHTML = `
      <style> .page { width: 750px; position: relative; box-sizing: border-box;overflow: auto; } ${CSS_RULES} ${remaStyle} </style>
      <div class="page" > ${(rootDom as any).innerHTML} </div> 
    `;
  }
  const runView = async (domDatas, elType = 'div', opt = 'view') => {
    // console.log('DATAS===', DATAS,  colors[0][0], gRuleNodes)
    let colorIndex = 0;
    const remaCss = []
    const _arrayRules = []
    const _atomRules = []
    const _afPseudoRules = []
    const _bePseudoRules = []
    const createDom = async (nodes: any[], elType = 'div', parentDom) => {
      if (!parentDom || !parentDom.appendChild) {
        console.error('createDom => parentDom error')
        return
      }
      for(let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const { data, children } = node;
        const { cssCode, txtContent, nodeShow } = data;
        if (!nodeShow) continue;
        const el = document.createElement(elType)
        parentDom.appendChild(el);
        if (cssCode) {
          const [atomCls, clsName, atomRoot, pseudoRoot, pseudoClsName] = await transformCss(cssCode);
          remaCss.push({
            clsName, atomRoot, pseudoRoot, pseudoClsName
          })
          el.className = (atomCls as any).join(' ');
        }
        if (txtContent) {
          el.innerText = txtContent;
        }
        if (Array.isArray(children) && children.length) {
          await createDom(children, elType, el);
        } else {
          // 无内容,无子节点, 填充颜色
          if (!txtContent && opt === 'view') {
            el.style.backgroundColor = colors[0][colorIndex];
            colorIndex++;
          }
        }
      }
    }
    const initMixin = (ruleNodes) => {
      let data = [...ruleNodes]
      ruleNodes.forEach((item, i) => { 
        const {type, name, params } = item
        if (type === 'atrule' && params && name) {
          const mixName = name.split(':')[0];
          if ( typeof STYLE_MIXIN[`@${mixName}`] === 'function') {
            const ps = item.params.split(',');
            const minxCss = STYLE_MIXIN[`@${mixName}`](ps[0], ps.slice(1).join(','));
            data.splice(i, 1)
            const ruleRoot = postcss().process(minxCss, { from: undefined }).root;
            data = [...data, ...ruleRoot.nodes]
          }
        }
      })
      // console.log('initMixin data====', data)
      return data;
    }

    const getGatherAtomCss = (arrayRules, ruleNodes, pesudo) => {
      const result = [];
      arrayRules.forEach( arry => {
        let targets = [];
        let status = false;
        const remaNodes = []
        const { selector, nodes } = arry;
        for(let i = 0; i < ruleNodes.length; i++) {
          const el = ruleNodes[i]
          const { prop: p1 , value: v1 } = el
          const fIndex = nodes.findIndex(item => {
            const { prop: p2 , value: v2 } = item
            return p2 === p1 && v2 === v1
          })
          if (fIndex !== -1 && !targets.includes(fIndex)) {
            targets.push(fIndex)
          } else {
            remaNodes.push(el)
          }
          // console.log('selector===', targets, nodes)
          if (targets.length === nodes.length) {
            status = true;
            const sel = selector.substring(1);
            result.push(pesudo ? sel.split(pesudo)[0] : sel)
            targets = []
          }
        }
        status && (ruleNodes = remaNodes);
      })
      return [result, ruleNodes]
    }
    const transformCss = async (cssCode) => {
      let atomCls = [];
      let atomRemains = [];
      let pseudoRemains = [];
      let clsName = ''
      let pseudoClsName = ''
      let pseudoType = ''
      let atomRoot = ''
      let pseudoRoot = ''
      const cssRules = await postcss().process(cssCode, { from: undefined })
        .then(result => result.root.nodes);
      if (cssRules.length <= 2) {
        const [atomRules, pseudoRules] = cssRules;
        // 单个
        if (atomRules && atomRules.type === 'rule' && Array.isArray(atomRules.nodes)) {
          atomRules.nodes = initMixin(atomRules.nodes)
          let [cls, rema] = getGatherAtomCss([...gArrayRules, ..._arrayRules], atomRules.nodes, '')
          atomCls = [...atomCls, ...cls];
          atomRules.nodes = rema;
          [cls, rema] = getGatherAtomCss([...gAtomRules, ..._atomRules],  atomRules.nodes, '')
          atomCls = [...atomCls, ...cls];
          atomRemains = rema
        }  
        if (pseudoRules 
          && pseudoRules.type === 'rule' 
          && pseudoRules.selector && pseudoRules.selector.indexOf('::') !== -1
          && Array.isArray(pseudoRules.nodes)) {
          const { selector } = pseudoRules
          pseudoType = selector.indexOf('::after') !== -1 ? '::after' : '::before'
          pseudoRules.nodes = initMixin(pseudoRules.nodes)
          const [cls, rema] = getGatherAtomCss(pseudoType.indexOf('::after') !== -1 
            ? [...gAfPseudoRules, ..._afPseudoRules] 
            : [...gBePseudoRules, ..._bePseudoRules], pseudoRules.nodes, pseudoType)
          atomCls = [...atomCls, ...cls];
          pseudoRemains = rema
        }
        if (atomRemains.length) { 
          clsName = uuid(6, 6).toLocaleLowerCase()
          atomCls.push(clsName)
          atomRoot = createCssRule(clsName, atomRemains, '')
          if (atomRoot) {
            const rule = (atomRoot as any).nodes[0]
            if (rule.nodes.length > 1) {
              _arrayRules.push(rule)
            } else if (rule.nodes.length === 1) {
              _atomRules.push(rule)
            }
          }
        }
        if (pseudoRemains.length) {
          pseudoClsName = uuid(6, 6).toLocaleLowerCase()
          atomCls.push(pseudoClsName)
          pseudoRoot = createCssRule(pseudoClsName, pseudoRemains, pseudoType)
          if (pseudoRoot) {
            const rule = (pseudoRoot as any).nodes[0]
            pseudoType === '::after'
              ? (_afPseudoRules.push(rule))
              : (_bePseudoRules.push(rule))
          }
        }
      }
      return [atomCls, clsName, atomRoot, pseudoRoot, pseudoClsName]
    }

    const createCssRule = (clsName, nodes, type) => {
      if (!nodes || !nodes.length) return null
      const ruleRoot = postcss().process(`.${clsName}${type}{}`, { from: undefined }).root;
      ruleRoot.nodes[0].nodes = nodes
      return ruleRoot
    }
    const rootDom = document.createElement(elType)
    await createDom(domDatas[0].children, elType, rootDom)
    let remaStyle = ''
    remaCss.forEach(rcls => {
      const { clsName, atomRoot, pseudoRoot, pseudoClsName } = rcls
      if (clsName) {
        remaStyle = `${remaStyle} 
          ${atomRoot ? atomRoot.toString() : ''}`
      }
      if (pseudoClsName) {
        remaStyle = `${remaStyle} 
        ${pseudoRoot ? pseudoRoot.toString() : ''}`
      }
    })
 
    return [remaStyle, rootDom]
  }
  const onExport = async (domDatas) => {
    const [remaStyle, rootDom] = await runView(domDatas, 'view', 'export')
    setExportShow(true)
    setCssCodeString(beautifyCss(remaStyle as string, { indent_size: 2}) )
    setViewCodeString(beautifyHtml((rootDom as any).innerHTML, { indent_size: 2}))
  }
  return (
    <div className='main-plugin'>
      <div className='content'>
        <div className='tree-menu'>
          <TreeMenu pluginMessage={pluginMessage} onTreeSelet={ onTreeSelet } onExport={(gData) => onExport(gData)} onRender={ (gData)=> (setRunShow(true), setTimeout(()=> renderView(gData) , 0))}></TreeMenu>
        </div>
        <div className='setting-view'>
          <SettingView treeNode={treeNode} onAction= {onAction} ></SettingView>
        </div>
        <div className={ `render-content ${ exportShow ? 'render-show' : 'render-hide'}`}>
          <Button type="link" onClick={ ()=> setExportShow(false)}>Close</Button>
          <div className='flex'>
            <div className='flex-1'>
              <SyntaxHighlighter language="htmlbars" style={dark}>
                {viewCodeString}
              </SyntaxHighlighter>
            </div>
            <Divider type="vertical" />
            <div className='flex-1'>
              <SyntaxHighlighter language="css" style={dark}>
                {cssCodeString}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
      <div className="run-view" draggable style={{ display: runShow ? 'block' : 'none'}}>
        <div id="hostElement" draggable></div>
      </div>
      <div> 
          <Space style={{ cursor: 'pointer'}}>
            { !runShow
              ? <EyeOutlined onClick={() => (setRunShow(true))} /> 
              : <EyeInvisibleOutlined onClick={() => (setRunShow(false))} />
            } 
          </Space>
      </div>
    </div>
  );
}

export default App;
