# 设计模式组合案例-Configuration

## Configuration有哪些对象

![image-20200713000422819](C:%5CUsers%5CAdministrator%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20200713000422819.png)

## 时序图

![image-20200713000720072](C:%5CUsers%5CAdministrator%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20200713000720072.png)

## 代码实现

1. 首先创建配置类

   ``` c#
   /// <summary>
       /// 配置类(核心领域模型)
       /// </summary>
       class Configuration
       {
           /// <summary>
           /// 配置数据
           /// </summary>
           public IDictionary<string, string> Data { set; get; } = new Dictionary<string, string>();
   
           // 1、扩展思路
         //  public List<IConfigurationProvider> lists = new List<IConfigurationProvider>();
           /// <summary>
           /// 设值
           /// </summary>
           /// <param name="key"></param>
           /// <param name="value"></param>
           public void Set(string key,string value)
           {
               Data.Add(key, value);
           }
   
           /// <summary>
           /// 取值
           /// </summary>
           /// <param name="key"></param>
           /// <returns></returns>
           public string this[string key]
           {
               get
               {
                   return Data[key];
               }
           }
       }
   ```

2. 构造建造者类

   ``` c#
    /// <summary>
       /// 配置建造者类(用于构建配置对象)
       /// </summary>
       class ConfigurationBuilder
       {
           /// <summary>
           /// 配置类
           /// </summary>
           private Configuration configuration = new Configuration();
   
           /// <summary>
           /// 1、添加json配置文件配置信息
           /// </summary>
           /// <returns></returns>
           public ConfigurationBuilder AddJsonFile(string jsonFilePath ,string reload)
           {
               // 1、获取json文件输入流
              /* Console.WriteLine($"{jsonFilePath}:获取json本地文件输入流");
   
               // 2、转换成为Dictionary对象
               configuration.Data.Add("json", "json文件内容");*/
               JsonConfigurationReader jsonConfigurationReader = new JsonConfigurationReader();
               jsonConfigurationReader.ReadJsonFile(jsonFilePath);
               // 添加到集合
               //configuration.Data.Add();
   
               return this;
           }
   
           /// <summary>
           /// 2、添加xml配置文件配置信息
           /// </summary>
           /// <returns></returns>
           public ConfigurationBuilder AddXmlFile(string xmlFilePath)
           {
              /* Console.WriteLine($"{XMLFilePath}:获取XML本地文件输入流");
   
               // 2、转换成为Dictionary对象
               configuration.Data.Add("json", "json文件内容1");*/
               return this;
           }
   
           /// <summary>
           /// 3、添加Ini配置文件配置信息
           /// </summary>
           /// <returns></returns>
           public ConfigurationBuilder AddIniFile(string iniFilePath)
           {
               return this;
           }
   
           /// <summary>
           /// 构建Configuration对象
           /// </summary>
           /// <returns></returns>
           public Configuration Build()
           {
               return configuration;
           }
       }
   ```

3. 将json访问抽象出来

   ``` c#
   	 /// <summary>
       /// json文件阅读接口
       /// </summary>
       interface IJsonConfigurationReader
       {
           public IDictionary<string, string> ReadJsonFile(string jsonFilePath);
       } 	
   	/// <summary>
       /// json文件阅读，将文件转换成为字典
       /// </summary>
       class JsonConfigurationReader : IJsonConfigurationReader
       {
           public IDictionary<string, string> ReadJsonFile(string jsonFilePath)
           {
               // 1、获取json文件输入流
               Console.WriteLine($"{jsonFilePath}:获取json本地文件输入流");
   
               // 2、转换成为Dictionary
               IDictionary<string, string> Data = new Dictionary<string, string>();
               Data.Add("json","json文件内容");
   
               // 1、排序(扩展)
               // 2、去重(扩展)
               // 3、安全获取(代理) === 例子
               // 4、远程获取(代理)
               return Data;
           }
       }
   ```

4. 增加扩展功能的装饰器

   ``` c#
   	/// <summary>
       /// 对于json文件读取进行排序装饰
       /// </summary>
       class JsonConfigurationReaderProxy : IJsonConfigurationReader
       {
           private IJsonConfigurationReader jsonConfigurationReader;
           public JsonConfigurationReaderProxy(IJsonConfigurationReader jsonConfigurationReader)
           {
               this.jsonConfigurationReader = jsonConfigurationReader;
           }
   
           public IDictionary<string, string> ReadJsonFile(string jsonFilePath)
           {
               IDictionary<string, string> Data = jsonConfigurationReader.ReadJsonFile(jsonFilePath);
               // 排序
               SortData(Data);
               return Data;
           }
   
           private void SortData(IDictionary<string, string> Data)
           {
               Console.WriteLine("json配置文件数据排序");
           }
       }
   ```

5. 增加代理模式

   ``` c#
   /// <summary>
       /// json配置文件进行安全读取
       /// </summary>
       class JsonConfigurationReaderProxy : IJsonConfigurationReader
       {
           private IJsonConfigurationReader jsonConfigurationReader;
           public JsonConfigurationReaderProxy(IJsonConfigurationReader jsonConfigurationReader)
           {
               this.jsonConfigurationReader = jsonConfigurationReader;
           }
   
           public IDictionary<string, string> ReadJsonFile(string jsonFilePath)
           {
               // 1、安全验证
               RemoteConnection(jsonFilePath);
   
               IDictionary<string, string> Data = jsonConfigurationReader.ReadJsonFile(jsonFilePath);
               return Data;
           }
   
           private void RemoteConnection(string jsonFilePath)
           {
               Console.WriteLine($"{jsonFilePath}：进行安全验证");
           }
       }
   ```

   

