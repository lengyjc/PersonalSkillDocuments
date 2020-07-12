docute.init({
	//启用侧边栏
	sidebar: true,
	// 显示 h2 到 h4 的标题
	tocVisibleDepth: 3,
	nav: [
    // 首页
    {title: '首页', path: '/'},
	 {title: '硬技能', type: 'dropdown', items: [
      
    ]},
     {title: '软技能', type: 'dropdown', items: [
      {title: '程序员面试', path: '/软实力/面试/程序员面试.md'}
    ]}
  ]
})