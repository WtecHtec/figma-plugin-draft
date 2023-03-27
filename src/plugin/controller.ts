// r7shen
import { uuid } from '../app/utils/tools';
const presetStyle = { 
  fontSize: (data) => {
    console.log('data[fontSize]===', data['fontSize'])
    if (data['fontSize']) return `font-size: ${data['fontSize']}px;`;
  },
  fontWeight: (data) => {
    
    if (typeof data['fontWeight'] === 'symbol') return `font-weight: bold;`;
    try {
      const fw = Number(data['fontWeight'])
      if (fw) {
        if (fw >= 500) return `font-weight: bold;`;
        return `font-weight: ${fw};`;
      }
    } catch (error) {
      return 0;
    }

  },
  wh: (data) => {
    const w = data['width'];
    const h = data['height'];
    if (typeof w === 'object' || typeof h === 'object') return ''
    if (w && h && w === h) {
      return `width: ${w}px;\nheight: ${h}px;`
    }
  }};
const txtContentKey = 'characters';
function getStyle(data) {
  const sKeys = Object.keys(presetStyle);
  const result = [];
  for(let i = 0; i < sKeys.length; i++) {
    const key = sKeys[i];
    if (typeof presetStyle[key] === 'function') {
      const res = presetStyle[key](data)
      res && result.push(res)
    }
  }
  return result;
}
figma.showUI(__html__, { width: 860, height: 850});
figma.ui.onmessage = (msg) => {
  if (msg.type === 'join') {
    const selections: any =  figma.currentPage.selection
    if (Array.isArray(selections) && selections.length === 1) {
      const [selection] = selections;
      console.log('selection===', selection);
      const unid = uuid(6, 6)
      const styles  = getStyle(selection || {});
      console.log('styles===', styles)
      figma.ui.postMessage({
        type: msg.type,
        message: {
          key: `${unid.substring(0, 6)}`,
          kid: selection.id,
          name: selection.name,
          txtContent: typeof selection[txtContentKey] === 'string' ?  selection[txtContentKey] : '',
          cssCode: styles.length ? `.v { ${styles.join('\n')} \n}` : '',
        },
      });
    } else {
      figma.notify('请选中一个节点')
    }
  } else if (msg.type === 'selected') {
    const { selectedKey } = msg.message;
    const selecteNode = figma.currentPage.findOne( i => i.id === selectedKey );
    if ( selecteNode ) {
      figma.currentPage.selection = [selecteNode];
    }
  } else if (msg.type === 'import') {
    const selections: any =  figma.currentPage.selection
    console.log(selections)
    if (Array.isArray(selections) && selections.length === 1) { 
      const rootNode = {}
      const [selection] = selections;
      createTreeNode(rootNode, selection)
      const unid = uuid(6, 6)
      figma.ui.postMessage({
        type: msg.type,
        message: {
          rootNode,
          key: `${unid.substring(0, 6)}`,
          kid: selection.id,
          name: selection.name,
        } ,
      });
    } else {
      figma.notify('请选中一个节点')
    }
  } 

};

const createTreeNode = (root,node) => {
  if (node) {
    const unid = uuid(6, 6)
    const styles  = getStyle(node || {});
    root.key = `${unid.substring(0, 6)}`
    root.kid =  node.id;
    root.title = node.name,
    root.nodeType = 'view',
    root.data = {
      txtContent: typeof node[txtContentKey] === 'string' ?  node[txtContentKey] : '',
      cssCode: styles.length ? `.v { ${styles.join('\n')} \n}` : '',
      nodeShow: true,
      nodeType: 'view',
    }
    root.children = []
    if (node.type !== 'GROUP' && node.children && Array.isArray(node.children)) {
      node.children.forEach(item => root.children.push(createTreeNode({}, item)))
    }
  }
  return root
}
