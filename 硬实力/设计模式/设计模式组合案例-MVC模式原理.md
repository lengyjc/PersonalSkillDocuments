# 设计模式组合案例-MVC模式原理

## 什么是MVC

![3](https://i.loli.net/2020/07/16/SVunNdlgMErF85m.jpg)

## 为什么要用MVC

1. 解耦
2. 复用性高
3. 维护性高

## MVC运行流程

![3](https://i.loli.net/2020/07/16/TkmpMs3z7G1qYDj.jpg)

1. 端点：方法的描述，对Action的抽象
2. 路由：一个请求只能找到一个方法
3. 路由执行中间件： 执行方法

## 实现MVC

``` c#
//1.定义端点模型
	/// <summary>
    /// 端点(就是Action的抽象)
    /// </summary>
    class Endpoint
    {
        /// <summary>
        /// 方法信息
        /// </summary>
        public MethodInfo methodInfo { set; get; }

        /// <summary>
        /// 方法参数
        /// </summary>
        public IList<ParameterInfo> parameterInfos { set; get; }

        /// <summary>
        /// 方法返回值
        /// </summary>
        public object returnValue { set; get; }

        /// <summary>
        /// 控制器
        /// </summary>
        public object Controller { set; get; }

    }

//2.定义存储端点的数据源
 	/// <summary>
    /// Endpoint数据源(存储Endpoint数据集合)
    /// </summary>
    class EndpointDataSources
    {
        /// <summary>
        /// Endpoint 集合
        /// </summary>
        public IDictionary<string, Endpoint> endpoints { set; get; } = new Dictionary<string, Endpoint>();
    }

//3.实现端点执行类
	/// <summary>
    /// 端点处理
    /// </summary>
    class EndpointHandler
    {
        /// <summary>
        /// 执行端点
        /// </summary>
        /// <param name="endpoint"></param>
        /// <param name="providedArgs">方法参数值</param>
        /// <returns></returns>
        public object HandlerEndpoint(Endpoint endpoint,object[] providedArgs)
        {
            // 1、获取方法
            MethodInfo methodInfo = endpoint.methodInfo;

            // 2、执行
            return methodInfo.Invoke(endpoint.Controller, providedArgs);
        }
    }

//4.构建路由对象
	 /// <summary>
    /// 构建EndpointDataSources(建造者设计模式)
    /// </summary>
    class EndpointRouteBuilder
    {
        /// <summary>
        /// Endpoint集合
        /// </summary>
        private EndpointDataSources endpointDataSources = new EndpointDataSources();

        /// <summary>
        /// 1、加载Controller类和相关特性
        /// </summary>
        public void MapControllers()
        {
            // 1、解析controller 和action 装换成Endpoint(反射加载)
            Endpoint endpoint = new Endpoint();
            endpoint.methodInfo = typeof(EndpointRouteBuilder).GetMethods()[0];

            // 2、添加到端点集合
            endpointDataSources.endpoints.Add("/index.html", endpoint);
        }

        /// <summary>
        /// 2、加载RazorPage页面Endpoint
        /// </summary>
        public void MapRazorPages()
        {
        }

        public EndpointDataSources Build()
        {
           return endpointDataSources;
        }
    }

// 5.构建路由对象
	/// <summary>
    /// Endpoint 路由(根据路径进行匹配Endpoint)
    /// </summary>
    class EndpointRoute
    {
        public EndpointRouteBuilder endpointRouteBuilder { set; get; }

        public Endpoint Match(string requestPath) {
            // 匹配合适的Endpoint
            return endpointRouteBuilder.Build().endpoints[requestPath];
        }
    }	

// 6.添加终结点中间件渲染到视图
	 /// <summary>
    /// 终结点中间件(外观模式)
    /// </summary>
    class EndpointMiddlewareFacde
    {
        private EndpointRouteBuilder endpointRouteBuilder;
        private EndpointRoute endpointRoute;
        private EndpointHandler endpointHandler;

        public EndpointMiddlewareFacde()
        {
            this.endpointRouteBuilder = new EndpointRouteBuilder();
            this.endpointRoute = new EndpointRoute();
            this.endpointHandler = new EndpointHandler();
        }

        /// <summary>
        /// 执行请求
        /// </summary>
        /// <param name="httpContext"></param>
        public void Invoke(HttpContext httpContext)
        {
            // 1、加载Controller
            endpointRouteBuilder.MapControllers();// 扫描所有Controller

            // 2、创建EndpointRoute
            Endpoint endpoint = endpointRoute.Match("/index");

            // 3、执行Endpoint
            object result = endpointHandler.HandlerEndpoint(endpoint, new object[] { "原理解析" });

            // 4、对结果进行处理(就是将数据输出到页面)
            ViewResult viewResult = (ViewResult)result;

            // 5、输出到页面
            if (viewResult.ViewType.Equals("Razor"))
            {
                // 5.1 输出到Razor页面
                RazorView razorView = new RazorView();
                razorView.Render(viewResult.ViewData, httpContext);
            } else if (viewResult.ViewType.Equals("XML"))
            {
                // 5.2 输出到XML页面
                XMLView xMLView = new XMLView();
                xMLView.Render(viewResult.ViewData, httpContext);
            }
        }
       
    }

//7.添加模板模式
	 /// <summary>
    ///视图模板
    /// </summary>
    abstract class AbstractView 
    {
        /// <summary>
        /// 渲染方法
        /// </summary>
        /// <param name="viewData"></param>
        /// <param name="httpContext"></param>
        public void Render(IDictionary<string, object> viewData, HttpContext httpContext)
        {
            // 1、转换成Razor数据
            TransformData(viewData);

            // 2、构建Razor页面
            BuildPage(viewData);

            // 3、输出Razor页面
            WritePage(httpContext);
        }


        protected abstract void TransformData(IDictionary<string, object> viewData);

        protected abstract void BuildPage(IDictionary<string, object> viewData);

        protected abstract void WritePage(HttpContext httpContext);

    }
```

``` c#
 //完成一个请求
               // 1、加载Controller
               EndpointRouteBuilder endpointRouteBuilder = new EndpointRouteBuilder();
               endpointRouteBuilder.MapControllers();// 扫描所有Controller

                //2、创建EndpointRoute
               EndpointRoute endpointRoute = new EndpointRoute();
               Endpoint endpoint = endpointRoute.Match("/index");

               // 3、执行Endpoint
               EndpointHandler endpointHandler = new EndpointHandler();
               object result = endpointHandler.HandlerEndpoint(endpoint, new object[] { "原理解析" });

               // 4、对结果进行处理*/
               EndpointMiddlewareFacde endpointMiddlewareFacde = new EndpointMiddlewareFacde();
                endpointMiddlewareFacde.Invoke(new HttpContext());
```

