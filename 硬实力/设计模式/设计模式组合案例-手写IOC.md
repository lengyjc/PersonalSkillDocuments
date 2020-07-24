## 设计模式组合案例-手写IOC

## 含义

1. 对象的创建由工厂创建
2. 对象的属性设值由工厂赋值（依赖注入DI）
3. 对象的代理由工厂代理

IOC容器 ===控制反转容器

## 好处

1. 降低对象之间的耦合度
2. 提高扩展性
3. 符合开闭原则

## 特点

1. 工厂
2. 容器
3. 依赖注入
4. 循环引用
5. AOP

## 如何实现IOC

1. 工厂
2. 集合
3. 反射
4. 配置

![image-20200724100152581](https://i.loli.net/2020/07/24/ber6cixEOmaulTZ.png)

### 代码实现

``` c#
//1. 添加IOC工厂
	/// <summary>
    /// IOC抽象工厂
    /// </summary>
    public abstract class IOCFactory
    {
        /// <summary>
        /// IOC抽象工厂方法
        /// </summary>
        /// <param name="typeName"></param>
        /// <returns></returns>
        public abstract object GetObject(string typeName);
    }

 	/// <summary>
    /// 默认IOC工厂(IOC工厂实现类) === 创建对象
    /// 实现一个IOC
    /// List
    /// Set
    /// 字典 ===容器
    /// 
    /// IOC容器的对象从哪里来？
    /// 对象的原材料从哪里来
    /// 1、配置文件
    ///    1.1 xml文件
    ///    1.2 程序集 === 注册对象
    /// 2、手动注册(函数)
    /// 3、硬编码
    /// </summary>
    class DefaultIOCFactory : IOCFactory
    {
        /// <summary>
        /// 1、IOC容器(存储对象)
        /// </summary>
        private Dictionary<string, object> iocContainer = new Dictionary<string, object>();

        /// <summary>
        /// 1、IOC容器(存储对象)临时
        /// </summary>
        private Dictionary<string, object> iocContainerC = new Dictionary<string, object>();

        /// <summary>
        /// 1、IOC tyoe容器(用于存储对象实例类型)
        /// </summary>
        private Dictionary<string, Type> iocTypeContainer = new Dictionary<string, Type>();


        // 对象创建策略
        public IObjectCreateStrategy objectCreateStrategy { set; get; }

        /// <summary>
        /// 2、加载程序集
        /// </summary>
        public DefaultIOCFactory()
        {
            // 1、加载程序集
            Assembly assembly = Assembly.LoadFile(@"D:\test.exe");

            // 2、使用反射从程序集获取对象类型
            Type[] types = assembly.GetTypes();

            // 3、创建对象
            foreach (var type in types)
            {
                // 3.1 过滤对象(哪些对象被加载到IOC容器)
                IOCService iOCService = (IOCService)type.GetCustomAttribute(typeof(IOCService));
                if (iOCService != null)
                {
                    iocTypeContainer.Add(type.Name, type);
                }

                // 3.2 不直接创建对象而存储type是因为直接创建对象的话在创建的类给属性赋值时无法直接拿到type，比如A对象有个C对象的属性在给C赋值时需要创建对象无法直接拿到C对象的type
            }
        }

        /// <summary>
        /// 2、创建对象
        /// typeName type名字
        /// </summary>
        /// <returns></returns>
        public override object GetObject(string typeName)
        {
            // 如果对象重复，直接取
            //全局只有一个 单例
            if (iocContainer.ContainsKey(typeName))
            {
                object _obejctValue = iocContainer[typeName];
                return _obejctValue;
            }
            else
            {
                // 1、取Type进行创建
                if (!iocTypeContainer.ContainsKey(typeName))
                {
                    throw new Exception("对象不存在");
                }
                Type type = iocTypeContainer[typeName];

                // 2、创建对象 如果 student 对象 === teacher
                // 获取一个对象 CreateObject
                // object _obejct = Activator.CreateInstance(type);
                //使用策略模式
                object _obejct = objectCreateStrategy.CreateObject(type);

                // 循环依赖

                // 3 代理 AOP

                // 4 扩展

                // 3、对象依赖 怎么依赖 （循环依赖）构造函数（无法做到循环依赖）
                PropertyInfo[] propertyInfos = type.GetProperties();
                foreach (var propertyInfo in propertyInfos)
                {
                    // 过滤属性特性
                    IOCInject iOCInject = (IOCInject)propertyInfo.GetCustomAttribute(typeof(IOCInject));
                    if (iOCInject != null)
                    {
                        // 3.1 获取属性类型进行创建 (Teacher)
                        string propertyTypeName = propertyInfo.PropertyType.Name;

                        // 3.2 创建依赖对象(递归创建) [所有的属性都需要创建对象进行依赖 int double]
                        object _PropertyObejct = GetObject(propertyTypeName);

                        // 3.3 反射属性设置
                        propertyInfo.SetValue(_obejct, _PropertyObejct);
                    }
                }
                // 4、存储对象
                iocContainer.Add(type.Name, _obejct);

                // 5、返回对象
                return _obejct;
            }

        }
    }
```

``` c#
//2. 添加程序集过滤特性
	 /// <summary>
    /// IOC类型过滤特性
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class IOCService :Attribute
    {
        public IOCService()
        {

        }
    }

	  /// <summary>
    /// IOC属性过滤特性
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    class IOCInject : Attribute
    {
        public IOCInject()
        {

        }
    }
```

``` c#
//3.添加策略模式
	 /// <summary>
    /// 对象创建策略
    /// </summary>
    public interface IObjectCreateStrategy
    {
        /// <summary>
        /// 创建对象
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public object CreateObject(Type type);
    }

	 /// <summary>
    /// Assembly 对象创建策略
    /// </summary>
    public class AssemblyObjectCreateStrategy : IObjectCreateStrategy
    {
        public object CreateObject(Type type)
        {
            return type.Assembly.CreateInstance(type.FullName);
        }
    }

 	 /// <summary>
    /// Activator 对象创建策略
    /// </summary>
    public class ActivatorObjectCreateStrategy : IObjectCreateStrategy
    {
        public object CreateObject(Type type)
        {
           return  Activator.CreateInstance(type);
        }
    }
```

