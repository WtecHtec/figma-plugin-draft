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
  }

  if (msg.type === 'create-rectangles') {
    const nodes = [];
    const selections: any =  figma.currentPage.selection
    console.log(selections)
    console.log(figma)
    // selections.name = '测试*'
    for (let i = 0; i < 1; i++) {
      const rect = figma.createRectangle();
      rect.name = '这是一个矩形';
      rect.x = i * 150;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    // figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    // console.log('main nodes===', figma.root.children);


    // This is how figma responds back to the ui
    figma.ui.postMessage({
      type: 'create-rectangles',
      message: `Created ${msg.count} Rectangles`,
    });
  }
  // setTimeout(()=> {
  //   figma.closePlugin();
  // }, 2000)

};
