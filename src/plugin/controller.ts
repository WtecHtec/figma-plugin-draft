// r7shen
figma.showUI(__html__, { width: 860, height: 850});
figma.ui.onmessage = (msg) => {
  if (msg.type === 'join') {
    const selections: any =  figma.currentPage.selection
    if (Array.isArray(selections) && selections.length === 1) {
      const [selection] = selections;
      figma.ui.postMessage({
        type: msg.type,
        message: {
          kid: selection.id,
          name: selection.name,
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
      figma.ui.postMessage({
        type: msg.type,
        message: {
          rootNode,
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
    root.key = node.id
    root.title = node.name,
    root.nodeType = 'view',
    root.data = {
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
